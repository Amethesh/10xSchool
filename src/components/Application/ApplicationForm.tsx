"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Define the form schema using Zod (same as before)
const formSchema = z.object({
  student_name: z.string().min(2, "Student name is required."),
  parent_name: z.string().min(2, "Parent's name is required."),
  dob: z.string().min(1, "Date of birth is required."),
  contact_number: z.string().min(10, "A valid contact number is required."),
  full_address: z.string().min(10, "Full address with pincode is required."),
  course: z.string({ message: "Please select a course." }),
  registering_for: z.string({ message: "Please select an option." }),
  hobbies: z.string().min(2, "Hobbies & interests are required."),
});

type FormValues = z.infer<typeof formSchema>;

const courseOptions = [
  "M3 Genius Program - Group Class",
  "M3 Genius Program - 1 to 1 Class",
  "Vedic Mathematics - Group Class",
  "Vedic Mathematics - 1 to 1 Class",
  "M3 Genius Program - Teacher Training",
  "Vedic Mathematics - Teacher Training",
  "Phonics",
];

const ApplicationForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_name: "",
      parent_name: "",
      dob: "",
      contact_number: "",
      full_address: "",
      hobbies: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const supabase = await createClient();
    const promise = () =>
      new Promise(async (resolve, reject) => {
        const { error } = await supabase.from("applications").insert([data]);
        if (error) {
          reject(error);
        } else {
          resolve("Success!");
        }
      });

    toast.promise(promise, {
      loading: "Submitting application...",
      success: () => {
        form.reset();
        setIsSubmitted(true);
        return "Application submitted successfully!";
      },
      error: (error) => `Submission failed: ${error.message}`,
    });
  };
  const [isSubmitted, setIsSubmitted] = useState(false); // Our new state!

  const handleNewApplication = () => {
    setIsSubmitted(false); // Reset state to show the form again
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-8 md:p-12">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <SuccessView onNewApplication={handleNewApplication} />
          ) : (
            <Form {...form}>
              <motion.form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.1 }}
              >
                {/* Personal Information Section */}
                <motion.div variants={fieldVariants} className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="student_name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Student Name{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <p className="text-xs text-gray-500 mb-2">
                              This name will be printed on the certificate
                            </p>
                            <FormControl>
                              <Input
                                placeholder="Enter student's full name"
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parent_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Parent/Guardian Name{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter parent's full name"
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Date of Birth{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {/* Contact Information Section */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contact_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              WhatsApp Number{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Enter WhatsApp number"
                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="registering_for"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Registering For{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="My Child">
                                  My Child
                                </SelectItem>
                                <SelectItem value="Self">Self</SelectItem>
                                <SelectItem value="Another Person">
                                  Another Person
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="full_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Complete Address{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <p className="text-xs text-gray-500 mb-2">
                              Include pincode for workbook delivery
                            </p>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your complete address with pincode"
                                className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Course Selection Section */}
                  <motion.div
                    variants={fieldVariants}
                    className="border-b border-gray-200 pb-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Course Selection
                    </h3>
                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Select Your Course{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 gap-3"
                            >
                              {courseOptions.map((course) => (
                                <FormItem
                                  key={course}
                                  className="flex items-center space-x-3 space-y-0 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                  <FormControl>
                                    <RadioGroupItem
                                      value={course}
                                      className="text-blue-600"
                                    />
                                  </FormControl>
                                  <FormLabel className="font-medium text-gray-700 cursor-pointer flex-1">
                                    {course}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Additional Information Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Additional Information
                    </h3>
                    <FormField
                      control={form.control}
                      name="hobbies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Hobbies & Interests{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tell us about your hobbies and interests"
                              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>

                {/* Form Actions */}
                <motion.div
                  variants={fieldVariants}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200"
                >
                  <Button
                    type="submit"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium"
                  >
                    {form.formState.isSubmitting
                      ? "Submitting Application..."
                      : "Submit Application"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Clear Form
                  </Button>
                </motion.div>
              </motion.form>
            </Form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SuccessView = ({
  onNewApplication,
}: {
  onNewApplication: () => void;
}) => {
  return (
    <motion.div
      key="success"
      className="text-center flex flex-col items-center justify-center h-full py-16"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Submission Successful!
      </h2>
      <p className="text-gray-600 max-w-sm mx-auto mb-8">
        Thank you! We have received your application and will review it shortly.
      </p>
      <div className="flex gap-4">
        <Button size="lg" onClick={onNewApplication}>
          Submit Another Application
        </Button>
        <Button size="lg" variant={"outline"}>
          <Link href={"/"}>Back</Link>
        </Button>
      </div>
    </motion.div>
  );
};
export default ApplicationForm;
