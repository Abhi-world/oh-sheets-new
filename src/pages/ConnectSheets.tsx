import { GoogleSheetsConnect } from '@/components/GoogleSheetsConnect';

const ConnectSheets = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <GoogleSheetsConnect />
        </div>
      </div>
    </div>
  );
};

export default ConnectSheets;