import { Toaster } from "@/components/ui/sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ApplicationForm from "@/components/Application/ApplicationForm";

const page = () => {
  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="mb-8 border-pink-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-gray-800">
              Application Form
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              Please fill out the details below to enroll.
            </CardDescription>
          </CardHeader>
        </Card>
        <ApplicationForm />
      </div>
      <Toaster richColors />
    </main>
  );
};

export default page;
