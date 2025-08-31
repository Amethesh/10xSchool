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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Clock, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  age: z.string().min(1, "Age is required."),
  parent_name: z.string().min(2, "Parent's name is required."),
  contact_number: z.string().min(10, "A valid contact number is required."),
  city_country: z.string().min(2, "City/Country is required."),
  registering_for: z.string({ message: "Please select an option." }),
  preferred_times: z.array(z.string()).min(1, "Please select at least one time slot."),
});

type FormValues = z.infer<typeof formSchema>;

const timeSlots = [
  { id: "sunday_6_8", label: "Sunday", time: "6:30 AM - 8:00 AM" },
  { id: "sunday_11_1", label: "Sunday", time: "11:00 AM - 1:00 PM" },
  { id: "sunday_3_5", label: "Sunday", time: "3:00 PM - 5:30 PM" },
  { id: "sunday_9_10", label: "Sunday", time: "9:00 PM - 10:00 PM" },
  { id: "monday_6_8", label: "Monday", time: "6:30 AM - 8:00 AM" },
  { id: "monday_11_1", label: "Monday", time: "11:00 AM - 1:00 PM" },
  { id: "monday_3_5", label: "Monday", time: "3:00 PM - 5:30 PM" },
  { id: "monday_9_10", label: "Monday", time: "9:00 PM - 10:00 PM" },
  { id: "tuesday_6_8", label: "Tuesday", time: "6:30 AM - 8:00 AM" },
  { id: "tuesday_11_1", label: "Tuesday", time: "11:00 AM - 1:00 PM" },
  { id: "tuesday_3_5", label: "Tuesday", time: "3:00 PM - 5:30 PM" },
  { id: "tuesday_9_10", label: "Tuesday", time: "9:00 PM - 10:00 PM" },
  { id: "wednesday_6_8", label: "Wednesday", time: "6:30 AM - 8:00 AM" },
  { id: "wednesday_11_1", label: "Wednesday", time: "11:00 AM - 1:00 PM" },
  { id: "wednesday_3_5", label: "Wednesday", time: "3:00 PM - 5:30 PM" },
  { id: "wednesday_9_10", label: "Wednesday", time: "9:00 PM - 10:00 PM" },
  { id: "thursday_6_8", label: "Thursday", time: "6:30 AM - 8:00 AM" },
  { id: "thursday_11_1", label: "Thursday", time: "11:00 AM - 1:00 PM" },
  { id: "thursday_3_5", label: "Thursday", time: "3:00 PM - 5:30 PM" },
  { id: "thursday_9_10", label: "Thursday", time: "9:00 PM - 10:00 PM" },
  { id: "friday_6_8", label: "Friday", time: "6:30 AM - 8:00 AM" },
  { id: "friday_11_1", label: "Friday", time: "11:00 AM - 1:00 PM" },
  { id: "friday_3_5", label: "Friday", time: "3:00 PM - 5:30 PM" },
  { id: "friday_9_10", label: "Friday", time: "9:00 PM - 10:00 PM" },
  { id: "saturday_6_8", label: "Saturday", time: "6:30 AM - 8:00 AM" },
  { id: "saturday_11_1", label: "Saturday", time: "11:00 AM - 1:00 PM" },
  { id: "saturday_3_5", label: "Saturday", time: "3:00 PM - 5:30 PM" },
  { id: "saturday_9_10", label: "Saturday", time: "9:00 PM - 10:00 PM" },
];

const BookDemoForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      age: "",
      parent_name: "",
      contact_number: "",
      city_country: "",
      preferred_times: [],
    },
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data: FormValues) => {
    const supabase = await createClient();
    const promise = () =>
      new Promise(async (resolve, reject) => {
        const { error } = await supabase.from("demo_bookings").insert([{
          ...data,
          preferred_times: JSON.stringify(data.preferred_times)
        }]);
        if (error) {
          reject(error);
        } else {
          resolve("Success!");
        }
      });

    toast.promise(promise, {
      loading: "Booking demo session...",
      success: () => {
        form.reset();
        setIsSubmitted(true);
        return "Demo session booked successfully!";
      },
      error: (error) => `Booking failed: ${error.message}`,
    });
  };

  const handleNewBooking = () => {
    setIsSubmitted(false);
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const groupedTimeSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.label]) {
      acc[slot.label] = [];
    }
    acc[slot.label].push(slot);
    return acc;
  }, {} as Record<string, typeof timeSlots>);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-8 md:p-12">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <SuccessView onNewBooking={handleNewBooking} />
          ) : (
            <Form {...form}>
              <motion.form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.1 }}
              >
                {/* Demo Information */}
                <motion.div variants={fieldVariants} className="bg-pink-50 border border-pink-200 rounded-lg p-6 mb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Demo Session Information
                      </h3>
                      <p className="text-gray-700 mb-4">
                        The demo session will take approximately 30 to 40 minutes.
                      </p>
                      <p className="text-gray-600 text-sm">
                        We kindly request you to schedule it at a time when the student is fresh and
                        attentive — not feeling sleepy, tired, hungry, or in a hurry — so they can get the
                        best out of the session.
                      </p>
                    </div>
                    <X className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </motion.div>

                {/* Personal Information Section */}
                <motion.div variants={fieldVariants} className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Student Name <span className="text-red-500">*</span>
                            </FormLabel>
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Email Address <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter email address"
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
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Age <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter age"
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
                              Parent/Guardian Name <span className="text-red-500">*</span>
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
                              WhatsApp Number <span className="text-red-500">*</span>
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
                        name="city_country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              City/Country <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter city and country"
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
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Registering For <span className="text-red-500">*</span>
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
                                <SelectItem value="My Child">My Child</SelectItem>
                                <SelectItem value="Self">Self</SelectItem>
                                <SelectItem value="Another Person">Another Person</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Schedule Selection Section */}
                  <motion.div variants={fieldVariants} className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Preferred Time Slots
                    </h3>
                    <FormField
                      control={form.control}
                      name="preferred_times"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Select your preferred time slots <span className="text-red-500">*</span>
                          </FormLabel>
                          <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium text-gray-700 border-b pb-2">
                              <div>Between 6:30 AM and 8:00 AM</div>
                              <div>Between 11:00 AM and 1:00 PM</div>
                              <div>Between 3:00 PM and 5:30 PM</div>
                              <div>Between 9:00 PM and 10:00 PM</div>
                            </div>
                            {Object.entries(groupedTimeSlots).map(([day, slots]) => (
                              <div key={day} className="grid grid-cols-5 gap-4 items-center">
                                <div className="font-medium text-gray-700">{day}</div>
                                {slots.map((slot) => (
                                  <FormField
                                    key={slot.id}
                                    control={form.control}
                                    name="preferred_times"
                                    render={({ field }) => {
                                      return (
                                        <FormItem className="flex items-center justify-center">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(slot.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, slot.id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== slot.id
                                                      )
                                                    )
                                              }}
                                              className="w-6 h-6"
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
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
                    <Clock className="w-4 h-4 mr-2" />
                    {form.formState.isSubmitting
                      ? "Booking Demo Session..."
                      : "Book Demo Session"}
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
  onNewBooking,
}: {
  onNewBooking: () => void;
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
        Demo Session Booked!
      </h2>
      <p className="text-gray-600 max-w-sm mx-auto mb-8">
        Thank you! We have received your demo booking request and will contact you shortly to confirm your session.
      </p>
      <div className="flex gap-4">
        <Button size="lg" onClick={onNewBooking}>
          Book Another Session
        </Button>
        <Button size="lg" variant={"outline"}>
          <Link href={"/"}>Back to Home</Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default BookDemoForm;