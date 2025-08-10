import ChatWidget from "../components/ChatWidget";

export default function CustomerPage() {
  return (
    <>
      <div className="w-full h-screen  bg-blue-300 z-50 opacity-50 rounded-2xl">
        <h2 className="text-zinc-700 font-bold  pt-15 pl-3 text-2xl">
          Customer Page
        </h2>
      </div>
      <div>
        <ChatWidget
          userId="customer1"
          userType="customer"
          roomId="customer1_restaurantA"
        />
      </div>
    </>
  );
}
