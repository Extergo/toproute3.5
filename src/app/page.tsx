// src/app/page.tsx
"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Our Car Recommender
        </h1>
        <p className="text-gray-700 mb-6">
          This application will help you pick the ideal car for your daily
          commute and holiday trips based on your preferences.
        </p>
        <Link
          href="/form"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Try It Now
        </Link>
      </div>
    </main>
  );
}
