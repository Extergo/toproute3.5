// src/utils/recommendVehicles.ts
import { cars, Car } from "../data/cars";

export interface RecommendationInput {
  house: { lat: number; lng: number };
  workplace: { lat: number; lng: number };
  holiday: { lat: number; lng: number };
  minSeats: number;
  habits: {
    hasKids: boolean;
    trunkPreference: boolean;
  };
  preferredType?: string; // Added parameter for vehicle type preference
}

export interface RecommendationResult {
  primary: Car;
  runnerUp: Car;
  summary: string;
  priceBreakdown: {
    primary: number;
    runnerUp: number;
  };
  carbonRating: number; // 1 (high combustion) to 5 (low/no combustion)
  metrics: {
    commuteDistance: number;
    holidayDistance: number;
    totalDistance: number;
    terrain: {
      city: number;
      highway: number;
      offroad: number;
    };
  };
}

export function recommendVehicles(
  input: RecommendationInput
): RecommendationResult {
  if (!input.house || !input.workplace || !input.holiday) {
    throw new Error("Not enough location data to provide a recommendation.");
  }

  // Haversine formula for distance in kilometers
  const toRad = (x: number): number => (x * Math.PI) / 180;
  const computeDistance = (
    p1: { lat: number; lng: number },
    p2: { lat: number; lng: number }
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);
    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate distances
  const commuteDistance = computeDistance(input.house, input.workplace);
  const holidayDistance = computeDistance(input.house, input.holiday);
  const totalDistance = commuteDistance + holidayDistance;

  // Determine terrain types based on the locations and distances
  // This is a simplified algorithm - in a real app, you might use Google Maps data
  const terrainPreference = {
    // Daily commute is usually more city/highway
    city: commuteDistance < 30 ? 0.7 : 0.3, // If short commute, more city driving
    highway: commuteDistance >= 30 ? 0.7 : 0.3, // If longer commute, more highway
    // Holiday trips typically involve highway and some off-road
    offroad: holidayDistance > 200 ? 0.4 : 0.2, // More off-road for longer trips
  };

  // Filter cars by seat requirement at minimum
  let filteredCars = cars.filter((car) => car.seats >= input.minSeats);

  // Apply type filter if specified
  if (input.preferredType && input.preferredType !== "any") {
    filteredCars = filteredCars.filter(
      (car) => car.type === input.preferredType
    );

    // If no cars match the preferred type, show a helpful error
    if (filteredCars.length === 0) {
      throw new Error(
        `No ${input.preferredType} vehicles found that meet your minimum seating requirement of ${input.minSeats}. Try adjusting your preferences.`
      );
    }
  }

  if (filteredCars.length === 0) {
    throw new Error("No vehicles found with your minimum seat requirement.");
  }

  // Calculate a score for each car based on various factors
  const scoredCars = filteredCars.map((car) => {
    let score = 0;

    // Base requirements
    // Range score: how well the car handles the total distance
    const rangeScore = Math.min(car.range / (totalDistance * 1.2), 1) * 10;

    // Trunk space score if user prefers trunk space
    const trunkScore = input.habits.trunkPreference
      ? (car.trunk / 1000) * 10
      : 0;

    // Family friendly score if user has kids
    const familyScore = input.habits.hasKids ? car.familyFriendly : 0;

    // Terrain match score
    const terrainScore =
      terrainPreference.city * car.terrain.city +
      terrainPreference.highway * car.terrain.highway +
      terrainPreference.offroad * car.terrain.offroad;

    // Efficiency score - prioritize efficiency for daily commutes
    const efficiencyWeight = commuteDistance > holidayDistance ? 3 : 1.5;
    let efficiencyScore = 0;

    // Different scale for electric vs. combustion
    if (car.type === "electric") {
      // For electric cars, higher km/kWh is better (typical range 3-7)
      efficiencyScore = (car.efficiency / 7) * 10 * efficiencyWeight;
    } else {
      // For gas/hybrid cars, higher km/L is better (typical range 8-25)
      efficiencyScore = (car.efficiency / 25) * 10 * efficiencyWeight;
    }

    // Total score calculation with weights
    score =
      rangeScore * 3 + // Range is important
      trunkScore * (input.habits.trunkPreference ? 2 : 0) + // Only if user cares
      familyScore * (input.habits.hasKids ? 2 : 0) + // Only if user has kids
      terrainScore * 2 + // Terrain match is important
      efficiencyScore; // Efficiency matters for cost

    // Divide by the sum of weights to normalize 0-10
    const weights =
      3 +
      (input.habits.trunkPreference ? 2 : 0) +
      (input.habits.hasKids ? 2 : 0) +
      2 +
      1;

    const normalizedScore = score / weights;

    // Return the car with its score
    return {
      car,
      score: normalizedScore,
      // Keep track of the specific scores for explanation
      scores: {
        range: rangeScore,
        trunk: trunkScore,
        family: familyScore,
        terrain: terrainScore,
        efficiency: efficiencyScore,
      },
    };
  });

  // Sort by score descending
  scoredCars.sort((a, b) => b.score - a.score);

  // Get the top recommendations
  const primary = scoredCars[0].car;
  const runnerUp =
    scoredCars.length > 1 ? scoredCars[1].car : scoredCars[0].car;

  // Calculate cost estimates more accurately
  const estimateFuelCost = (car: Car, distance: number): number => {
    // Different calculations based on car type
    const fuelPricePerLiter = 1.5; // Average price per liter
    const electricityPricePerKWh = 0.15; // Average price per kWh

    if (car.type === "electric") {
      // For electric: distance / efficiency (km/kWh) * price per kWh
      return (distance / car.efficiency) * electricityPricePerKWh;
    } else {
      // For gas/hybrid: distance / efficiency (km/L) * price per liter
      return (distance / car.efficiency) * fuelPricePerLiter;
    }
  };

  // Monthly commute cost (assuming 22 working days)
  const monthlyCommuteDist = commuteDistance * 2 * 22; // round trip * working days
  const primaryCommuteCost = estimateFuelCost(primary, monthlyCommuteDist);
  const runnerUpCommuteCost = estimateFuelCost(runnerUp, monthlyCommuteDist);

  // Holiday trip cost (one-time)
  const holidayTripDist = holidayDistance * 2; // round trip
  const primaryHolidayCost = estimateFuelCost(primary, holidayTripDist);
  const runnerUpHolidayCost = estimateFuelCost(runnerUp, holidayTripDist);

  // Total costs
  const primaryCost = primaryCommuteCost + primaryHolidayCost;
  const runnerUpCost = runnerUpCommuteCost + runnerUpHolidayCost;

  // Carbon rating based on vehicle type and efficiency
  let carbonRating = 1;
  if (primary.type === "electric") {
    carbonRating = 5;
  } else if (primary.type === "hybrid") {
    carbonRating = 3 + (primary.efficiency > 18 ? 1 : 0); // Better hybrid gets higher rating
  } else if (primary.type === "suv" || primary.type === "minivan") {
    carbonRating = primary.efficiency > 12 ? 2 : 1; // Efficient SUV/minivan gets slightly better
  } else {
    carbonRating = primary.efficiency > 14 ? 2 : 1; // Efficient sedan/compact gets slightly better
  }

  // Generate a dynamic summary
  const primaryScore = scoredCars[0].scores;
  const runnerUpScore =
    scoredCars.length > 1 ? scoredCars[1].scores : scoredCars[0].scores;

  let summary = `Based on your input, your daily commute is ${commuteDistance.toFixed(
    1
  )} km, and your holiday trip is ${holidayDistance.toFixed(
    1
  )} km—totaling ${totalDistance.toFixed(1)} km. `;

  // Explain why the primary was chosen
  summary += `We recommend the ${primary.name} as your primary option because `;

  // Add reasons based on highest scores
  const scores = Object.entries(primaryScore).sort((a, b) => b[1] - a[1]);

  // Get the top 2 factors
  const topFactors = scores.slice(0, 2);

  if (topFactors[0][0] === "range") {
    summary += `it offers excellent range (${primary.range} km) for your needs`;
  } else if (topFactors[0][0] === "trunk") {
    summary += `it has spacious trunk capacity (${primary.trunk} liters) as you requested`;
  } else if (topFactors[0][0] === "family") {
    summary += `it's highly family-friendly with excellent child-safety features`;
  } else if (topFactors[0][0] === "terrain") {
    summary += `it performs well on your specific mix of city, highway and occasional off-road driving`;
  } else if (topFactors[0][0] === "efficiency") {
    summary += `it offers excellent fuel efficiency (${
      primary.type === "electric"
        ? primary.efficiency + " km/kWh"
        : primary.efficiency + " km/L"
    })`;
  }

  // Add second factor
  if (topFactors.length > 1) {
    summary += ` and `;

    if (topFactors[1][0] === "range") {
      summary += `provides sufficient range (${primary.range} km) for your trips`;
    } else if (topFactors[1][0] === "trunk") {
      summary += `offers good cargo space (${primary.trunk} liters)`;
    } else if (topFactors[1][0] === "family") {
      summary += `is well-suited for families with children`;
    } else if (topFactors[1][0] === "terrain") {
      summary += `handles your typical driving conditions well`;
    } else if (topFactors[1][0] === "efficiency") {
      summary += `is cost-effective to operate with good ${
        primary.type === "electric" ? "energy" : "fuel"
      } efficiency`;
    }
  }

  summary += `. `;

  // Compare with runner-up if different
  if (primary.name !== runnerUp.name) {
    summary += `As a runner-up, we suggest the ${runnerUp.name}, which `;

    if (runnerUp.price < primary.price) {
      summary += `is more affordable`;
    } else if (runnerUp.type !== primary.type) {
      summary += `offers a different powertrain option (${runnerUp.type})`;
    } else if (runnerUp.trunk > primary.trunk) {
      summary += `provides more cargo space`;
    } else if (runnerUp.seats > primary.seats) {
      summary += `offers more seating capacity`;
    } else if (runnerUp.efficiency > primary.efficiency) {
      summary += `has better fuel efficiency`;
    } else {
      summary += `is a solid alternative`;
    }
  }

  // Add cost information
  summary += `. Your estimated monthly commute cost with the ${
    primary.name
  } would be $${primaryCommuteCost.toFixed(2)}`;

  if (input.habits.hasKids) {
    summary += `. This recommendation accounts for your family needs`;
  }

  if (input.habits.trunkPreference) {
    summary += ` and prioritizes vehicles with larger cargo capacity`;
  }

  summary += `.`;

  return {
    primary,
    runnerUp,
    summary,
    priceBreakdown: {
      primary: primaryCost,
      runnerUp: runnerUpCost,
    },
    carbonRating,
    metrics: {
      commuteDistance,
      holidayDistance,
      totalDistance,
      terrain: terrainPreference,
    },
  };
}
