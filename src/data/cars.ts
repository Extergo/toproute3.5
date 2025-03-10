// src/data/cars.ts

export type CarType =
  | "electric"
  | "hybrid"
  | "suv"
  | "sedan"
  | "compact"
  | "minivan";

export interface Car {
  name: string;
  type: CarType;
  range: number; // in km
  seats: number;
  trunk: number; // trunk space in liters
  efficiency: number; // km/L for gas or km/kWh for electric
  familyFriendly: number; // score from 1-10
  price: number; // base price in thousands of dollars
  terrain: {
    city: number; // score from 1-10
    highway: number; // score from 1-10
    offroad: number; // score from 1-10
  };
}

export const cars: Car[] = [
  // Electric Vehicles
  {
    name: "Tesla Model 3",
    type: "electric",
    range: 576,
    seats: 5,
    trunk: 425,
    efficiency: 6.9, // km/kWh
    familyFriendly: 7,
    price: 42,
    terrain: { city: 9, highway: 10, offroad: 3 },
  },
  {
    name: "Tesla Model Y",
    type: "electric",
    range: 533,
    seats: 5,
    trunk: 854,
    efficiency: 6.0, // km/kWh
    familyFriendly: 8,
    price: 49,
    terrain: { city: 9, highway: 9, offroad: 4 },
  },
  {
    name: "Hyundai Ioniq 5",
    type: "electric",
    range: 488,
    seats: 5,
    trunk: 531,
    efficiency: 5.7, // km/kWh
    familyFriendly: 8,
    price: 41,
    terrain: { city: 9, highway: 9, offroad: 3 },
  },
  {
    name: "Kia EV6",
    type: "electric",
    range: 499,
    seats: 5,
    trunk: 490,
    efficiency: 5.8, // km/kWh
    familyFriendly: 7,
    price: 43,
    terrain: { city: 9, highway: 9, offroad: 4 },
  },
  {
    name: "Ford Mustang Mach-E",
    type: "electric",
    range: 490,
    seats: 5,
    trunk: 840,
    efficiency: 5.4, // km/kWh
    familyFriendly: 7,
    price: 48,
    terrain: { city: 8, highway: 9, offroad: 5 },
  },
  {
    name: "Volkswagen ID.4",
    type: "electric",
    range: 410,
    seats: 5,
    trunk: 543,
    efficiency: 5.2, // km/kWh
    familyFriendly: 8,
    price: 40,
    terrain: { city: 8, highway: 8, offroad: 4 },
  },
  {
    name: "Nissan Leaf",
    type: "electric",
    range: 349,
    seats: 5,
    trunk: 435,
    efficiency: 5.9, // km/kWh
    familyFriendly: 6,
    price: 28,
    terrain: { city: 9, highway: 7, offroad: 2 },
  },
  {
    name: "Chevrolet Bolt EUV",
    type: "electric",
    range: 397,
    seats: 5,
    trunk: 462,
    efficiency: 6.0, // km/kWh
    familyFriendly: 6,
    price: 33,
    terrain: { city: 8, highway: 7, offroad: 3 },
  },

  // Hybrid Vehicles
  {
    name: "Toyota Prius",
    type: "hybrid",
    range: 950,
    seats: 5,
    trunk: 457,
    efficiency: 24.5, // km/L
    familyFriendly: 6,
    price: 28,
    terrain: { city: 9, highway: 8, offroad: 2 },
  },
  {
    name: "Honda Insight",
    type: "hybrid",
    range: 850,
    seats: 5,
    trunk: 428,
    efficiency: 21.3, // km/L
    familyFriendly: 6,
    price: 26,
    terrain: { city: 9, highway: 8, offroad: 2 },
  },
  {
    name: "Toyota RAV4 Hybrid",
    type: "hybrid",
    range: 900,
    seats: 5,
    trunk: 580,
    efficiency: 18.7, // km/L
    familyFriendly: 8,
    price: 32,
    terrain: { city: 8, highway: 8, offroad: 5 },
  },
  {
    name: "Toyota Camry Hybrid",
    type: "hybrid",
    range: 980,
    seats: 5,
    trunk: 428,
    efficiency: 20.4, // km/L
    familyFriendly: 7,
    price: 30,
    terrain: { city: 8, highway: 9, offroad: 2 },
  },
  {
    name: "Hyundai Ioniq Hybrid",
    type: "hybrid",
    range: 850,
    seats: 5,
    trunk: 443,
    efficiency: 22.1, // km/L
    familyFriendly: 6,
    price: 24,
    terrain: { city: 9, highway: 8, offroad: 2 },
  },
  {
    name: "Kia Niro Hybrid",
    type: "hybrid",
    range: 888,
    seats: 5,
    trunk: 548,
    efficiency: 19.6, // km/L
    familyFriendly: 7,
    price: 27,
    terrain: { city: 8, highway: 8, offroad: 3 },
  },

  // SUVs (non-hybrid)
  {
    name: "Toyota RAV4",
    type: "suv",
    range: 680,
    seats: 5,
    trunk: 580,
    efficiency: 13.2, // km/L
    familyFriendly: 8,
    price: 28,
    terrain: { city: 7, highway: 8, offroad: 6 },
  },
  {
    name: "Honda CR-V",
    type: "suv",
    range: 650,
    seats: 5,
    trunk: 590,
    efficiency: 12.8, // km/L
    familyFriendly: 8,
    price: 29,
    terrain: { city: 7, highway: 8, offroad: 5 },
  },
  {
    name: "Ford Explorer",
    type: "suv",
    range: 720,
    seats: 7,
    trunk: 800,
    efficiency: 10.2, // km/L
    familyFriendly: 9,
    price: 38,
    terrain: { city: 6, highway: 8, offroad: 7 },
  },
  {
    name: "Toyota Highlander",
    type: "suv",
    range: 700,
    seats: 8,
    trunk: 835,
    efficiency: 11.1, // km/L
    familyFriendly: 9,
    price: 38,
    terrain: { city: 7, highway: 8, offroad: 6 },
  },
  {
    name: "Jeep Grand Cherokee",
    type: "suv",
    range: 680,
    seats: 5,
    trunk: 740,
    efficiency: 9.8, // km/L
    familyFriendly: 7,
    price: 42,
    terrain: { city: 6, highway: 7, offroad: 9 },
  },
  {
    name: "Subaru Outback",
    type: "suv",
    range: 710,
    seats: 5,
    trunk: 920,
    efficiency: 12.3, // km/L
    familyFriendly: 7,
    price: 29,
    terrain: { city: 7, highway: 8, offroad: 8 },
  },

  // Minivans
  {
    name: "Honda Odyssey",
    type: "minivan",
    range: 750,
    seats: 8,
    trunk: 929,
    efficiency: 11.9, // km/L
    familyFriendly: 10,
    price: 34,
    terrain: { city: 8, highway: 8, offroad: 3 },
  },
  {
    name: "Toyota Sienna",
    type: "minivan",
    range: 800,
    seats: 8,
    trunk: 949,
    efficiency: 15.3, // km/L (hybrid version)
    familyFriendly: 10,
    price: 36,
    terrain: { city: 8, highway: 8, offroad: 3 },
  },
  {
    name: "Chrysler Pacifica",
    type: "minivan",
    range: 720,
    seats: 7,
    trunk: 915,
    efficiency: 10.6, // km/L
    familyFriendly: 9,
    price: 37,
    terrain: { city: 7, highway: 8, offroad: 3 },
  },
  {
    name: "Kia Carnival",
    type: "minivan",
    range: 710,
    seats: 8,
    trunk: 1041,
    efficiency: 11.1, // km/L
    familyFriendly: 9,
    price: 33,
    terrain: { city: 7, highway: 8, offroad: 3 },
  },

  // Sedans
  {
    name: "Toyota Camry",
    type: "sedan",
    range: 800,
    seats: 5,
    trunk: 428,
    efficiency: 14.9, // km/L
    familyFriendly: 7,
    price: 26,
    terrain: { city: 8, highway: 9, offroad: 2 },
  },
  {
    name: "Honda Accord",
    type: "sedan",
    range: 790,
    seats: 5,
    trunk: 473,
    efficiency: 15.3, // km/L
    familyFriendly: 7,
    price: 27,
    terrain: { city: 8, highway: 9, offroad: 2 },
  },
  {
    name: "Toyota Corolla",
    type: "sedan",
    range: 750,
    seats: 5,
    trunk: 371,
    efficiency: 16.2, // km/L
    familyFriendly: 6,
    price: 22,
    terrain: { city: 9, highway: 8, offroad: 2 },
  },
  {
    name: "Honda Civic",
    type: "sedan",
    range: 740,
    seats: 5,
    trunk: 428,
    efficiency: 15.7, // km/L
    familyFriendly: 6,
    price: 23,
    terrain: { city: 9, highway: 8, offroad: 2 },
  },

  // Compact Cars
  {
    name: "Mazda 3",
    type: "compact",
    range: 690,
    seats: 5,
    trunk: 374,
    efficiency: 14.5, // km/L
    familyFriendly: 5,
    price: 22,
    terrain: { city: 8, highway: 8, offroad: 2 },
  },
  {
    name: "Volkswagen Golf",
    type: "compact",
    range: 680,
    seats: 5,
    trunk: 380,
    efficiency: 14.1, // km/L
    familyFriendly: 5,
    price: 24,
    terrain: { city: 8, highway: 8, offroad: 2 },
  },
  {
    name: "Hyundai Elantra",
    type: "compact",
    range: 720,
    seats: 5,
    trunk: 402,
    efficiency: 15.3, // km/L
    familyFriendly: 5,
    price: 21,
    terrain: { city: 8, highway: 8, offroad: 2 },
  },
  {
    name: "Kia Forte",
    type: "compact",
    range: 710,
    seats: 5,
    trunk: 434,
    efficiency: 14.9, // km/L
    familyFriendly: 5,
    price: 20,
    terrain: { city: 8, highway: 8, offroad: 2 },
  },
];
