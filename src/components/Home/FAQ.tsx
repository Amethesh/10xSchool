"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Laptop,
  Video,
  CalendarCheck,
  GraduationCap,
  Baby,
  Globe,
  UserPlus,
  Heart,
  DollarSign,
  Plus,
} from "lucide-react";

const FAQComponent = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 FAQs initially

  const faqData = [
    {
      id: 1,
      question:
        "What is the ideal age for joining the 5-in-1 Brain Development Program?",
      answer:
        "Children aged 5 to 15 years can join. The course is structured into 8 levels, ensuring development at each stage.",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 2,
      question: "Are your programs conducted online or offline?",
      answer:
        "We are a 100% online institute, making our programs accessible globally.",
      icon: <Laptop className="w-5 h-5" />,
    },
    {
      id: 3,
      question: "How are the classes conducted?",
      answer:
        "Classes are conducted live via Google Meet in small batches for personalized attention.",
      icon: <Video className="w-5 h-5" />,
    },
    {
      id: 4,
      question: "Do you offer trial / demo classes?",
      answer:
        "Yes, you can book a free demo class using the QR codes or contact details provided below.",
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 5,
      question: "What are the qualifications of your trainers?",
      answer:
        "All our mentors are professionally trained with deep expertise in Abacus, Vedic Maths, and child psychology.",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: 6,
      question:
        "My child is below 5 years. Can I enrol him/her in your program?",
      answer:
        "Yes, you can. If your child is able to read, write, and speak numbers from 0 to 99 and shows an interest in Maths, they are welcome to join. Passion and basic number skills are more important than age!",
      icon: <Baby className="w-5 h-5" />,
    },
    {
      id: 7,
      question:
        "We live outside India. Will your teachers conduct classes in our time zone?",
      answer:
        "🌍 Absolutely! We already have students learning from countries like the USA, UAE, UK, Singapore, Japan and Australia. Our experienced teachers conduct classes based on your preferred time slot.",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      id: 8,
      question: "Are the classes conducted in groups or one-on-one?",
      answer:
        "👩‍🏫 Both options are available. You can choose between group classes and 1-on-1 personalized sessions, based on your child’s comfort and your budget. Fee structure varies accordingly.",
      icon: <UserPlus className="w-5 h-5" />,
    },
    {
      id: 9,
      question:
        "My child is a slow learner or doesn't speak much. Will he/she be able to learn?",
      answer:
        "❤ Yes, definitely. We specialize in working with shy or slow-to-adapt children. Our trainers give individual attention, use engaging techniques to encourage participation, and teach concepts at the child’s own pace. We ensure every child is confident before moving forward.",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 10,
      question: "How much do your programs cost?",
      answer:
        "We offer affordable pricing – less than the cost of a movie ticket per hour! Fee structure varies by course. Please contact us for detailed info.",
      icon: <DollarSign className="w-5 h-5" />,
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const loadMoreFAQs = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 5, faqData.length));
  };

  const showLess = () => {
    setVisibleCount(5);
    setOpenIndex(null); // Close any open FAQ when showing less
  };

  const visibleFAQs = faqData.slice(0, visibleCount);
  const hasMore = visibleCount < faqData.length;

  return (
    <section>
      <motion.div
        className="flex justify-center items-center mt-2 mb-10"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.p
          className="px-12 py-4 text-4xl bg-white border-2 border-black w-fit font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300 cursor-pointer"
          whileHover={{
            scale: 1.05,
            rotate: -1,
          }}
          whileTap={{ scale: 0.95 }}
        >
          FAQs
        </motion.p>
      </motion.div>
      {/* Header */}
      {/* FAQ Items */}
      <div className=" bg-white">
        {visibleFAQs.map((faq, index) => (
          <div key={faq.id} className="border-t-2 border-black py-6">
            <motion.div
              key={faq.id}
              className="mx-auto max-w-5xl flex justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Question Header */}
              <motion.div
                className="text-gray-950 w-32"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                {faq.icon}
              </motion.div>
              <div className="w-full ">
                <motion.div
                  className="cursor-pointer transition-colors duration-300 py-2"
                  onClick={() => toggleFAQ(index)}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-800 text-base md:text-xl">
                      {faq.id}. {faq.question}
                    </span>
                  </div>
                </motion.div>

                {/* Answer Content */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        className="p-4 pt-0"
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start space-x-3">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.div
                animate={{ rotate: openIndex === index ? 45 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                <Plus className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* View More/Show Less Button */}
      <motion.div
        className="flex justify-center mt-8 space-x-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        viewport={{ once: true }}
      >
        {hasMore && (
          <motion.button
            className="underline underline-offset-4 font-semibold cursor-cell"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadMoreFAQs}
          >
            View More
          </motion.button>
        )}

        {visibleCount > 5 && (
          <motion.button
            className="underline underline-offset-4 font-semibold cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={showLess}
          >
            Show Less
          </motion.button>
        )}
      </motion.div>
    </section>
  );
};

export default FAQComponent;
