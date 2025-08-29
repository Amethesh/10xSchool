import { Toaster } from "@/components/ui/sonner";
import ApplicationForm from "@/components/Application/ApplicationForm";

const page = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Course Application
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take the first step towards enhancing your mathematical skills.
            Please fill out the form below to begin your enrollment process.
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto">
          <ApplicationForm />
        </div>
      </div>
      <Toaster richColors />
    </main>
  );
};

export default page;
