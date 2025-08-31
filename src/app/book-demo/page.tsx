import { Toaster } from "@/components/ui/sonner";
import BookDemoForm from "@/components/BookDemo/BookDemoForm";

const page = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book a Demo Session
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Schedule a personalized demo session to experience our teaching methodology.
            Fill out the form below to book your preferred time slot.
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Demo Booking Form */}
        <div className="max-w-4xl mx-auto">
          <BookDemoForm />
        </div>
      </div>
      <Toaster richColors />
    </main>
  );
};

export default page;