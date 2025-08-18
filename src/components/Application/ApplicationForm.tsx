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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  "Regular - 24 months",
  "Steady - 12 months",
  "Swift - 6 months",
  "Rapid - 4 months",
  "Mental Arithmetic",
  "Abacus Teacher Training - 3 months",
  "Vedic Maths Teacher Training - Grandmaster Level 4 months",
  "Abacus and Vedic Maths Teacher Training - 6 months",
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
    <Card className="border-pink-200 shadow-lg">
      <CardContent className="p-8">
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
                {/* Form Fields */}
                <motion.div variants={fieldVariants} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="student_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Name of the student (This name will be printed on the
                          Certificate) <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Your answer" {...field} />
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
                        <FormLabel>
                          Name of the parents{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Your answer" {...field} />
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
                        <FormLabel>
                          Date of birth <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact numbers (WhatsApp){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Your answer"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="full_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full address with pincode (to send the Workbook){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the full address..."
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
                        <FormLabel>
                          Registering for{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="My Child">My Child</SelectItem>
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

                  {/* Course Selection */}
                  <motion.div variants={fieldVariants}>
                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-lg font-bold text-gray-800">
                            Course enrolling for{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              {courseOptions.map((course) => (
                                <FormItem
                                  key={course}
                                  className="flex items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={course} />
                                  </FormControl>
                                  <FormLabel className="font-normal">
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

                  <FormField
                    control={form.control}
                    name="hobbies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Hobbies & Interests{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Your answer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                {/* Form Actions */}
                <motion.div
                  variants={fieldVariants}
                  className="flex items-center justify-between pt-4"
                >
                  <Button
                    type="submit"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => form.reset()}
                    className="hover:text-red-500"
                  >
                    Clear form
                  </Button>
                </motion.div>
              </motion.form>
            </Form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
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
        <Link href={"/"}>
        Back
        </Link>
      </Button>
      </div>
    </motion.div>
  );
};
export default ApplicationForm;
