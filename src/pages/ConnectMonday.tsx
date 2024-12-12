import MondayApiKeyForm from "@/components/MondayApiKeyForm";

export default function ConnectMonday() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <MondayApiKeyForm />
      </div>
    </div>
  );
}