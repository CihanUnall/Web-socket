"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const startChatAsCustomer = () => {
    router.push("/customer");
  };

  const startChatAsRestaurant = () => {
    router.push("/restaurant");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Select a role:</p>
      <button
        className="bg-blue-600 hover:bg-pink-500 text-white py-2 px-4 rounded mr-2"
        onClick={startChatAsCustomer}
      >
        Customer
      </button>
      <button
        className="bg-blue-600 hover:bg-pink-500 text-white py-2 px-4 rounded"
        onClick={startChatAsRestaurant}
      >
        Restaurant
      </button>
    </div>
  );
}
