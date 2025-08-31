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
      question: "What is the ideal age for joining the M³ Genius Program?",
      answer:
        "Children aged 5 to 15 years can join. The course is structured into 8 levels, ensuring development at each stage.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: 2,
      question: "Are your programs conducted online or offline?",
      answer:
        "We are a 100% online institute, making our programs accessible globally.",
      icon: <Laptop className="w-6 h-6" />,
    },
    {
      id: 3,
      question:
        "Is it required to teach Financial literacy for kids below 10 years?",
      answer:
        "Certainly, because; \n a. 90% of children are not taught money management in school.\n b. Kids face financial choices (online spending digital payments) earlier than ever. \n c. Most teens don’t understand savings, debt, or budgeting — until it’s too late.",
      icon: <Video className="w-6 h-6" />,
    },
    {
      id: 4,
      question:
        "My child is not very strong in Math. Will they struggle in this course?",
      answer:
        "Not at all! This course focuses on improving child’s math ability at the pace of their understanding and learning capability. We also explain the concept through  stories, role plays, and real-life situations.",
      icon: <CalendarCheck className="w-6 h-6" />,
    },
    {
      id: 5,
      question: "What topics will my child learn in this course?",
      answer:
        "You child will learn Abacus, Vedic math, memory techniques, Brain exercises and Money management. With respective to Money management, your child will learn age appropriate chapters. The student of 7 to 9 years will learn right from History of Money, Needs vs Wants, Savings, Budgeting, Value of money etc. The senior kids (beyond 10 years) will learn additionally on Investment and passive income",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      id: 6,
      question: "Is this course theoretical or practical",
      answer:
        "It’s highly practical and activity-based. Children work on budgeting exercises, goal-planning, savings jars, mock shopping, and even simple investment games — all through child-friendly worksheets and tools.",
      icon: <Baby className="w-6 h-6" />,
    },
    {
      id: 7,
      question:
        "We live outside India. Will your teachers conduct classes in our time zone?",
      answer:
        "🌍 Absolutely! We already have students learning from countries like the USA, UAE, UK, Singapore, Japan and Australia. Our experienced teachers conduct classes based on your preferred time slot.",
      icon: <Globe className="w-6 h-6" />,
    },
    {
      id: 8,
      question: "Are the classes conducted in groups or one-on-one?",
      answer:
        "👩‍🏫 Both options are available. You can choose between group classes and 1-on-1 personalized sessions, based on your child’s comfort and your budget. Fee structure varies accordingly.",
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      id: 9,
      question:
        "My child is a slow learner or doesn't speak much. Will he/she be able to learn?",
      answer:
        "❤ Yes, definitely. We specialize in working with shy or slow-to-adapt children. Our trainers give individual attention, use engaging techniques to encourage participation, and teach concepts at the child’s own pace. We ensure every child is confident before moving forward.",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      id: 10,
      question: "How much do your programs cost?",
      answer:
        "We offer affordable pricing – less than the cost of a movie ticket per hour! Fee structure varies by course. Please contact us for detailed info.",
      icon: <DollarSign className="w-6 h-6" />,
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
                className="text-gray-950 w-32 flex justify-center items-center"
                whileHover={{ scale: 1.05 }}
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
                    <span className="text-gray-800 text-base md:text-xl font-semibold">
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
                        <div className="flex items-start space-x-6">
                          <p className="text-gray-700 text-base leading-relaxed mt-2">
                            {faq.answer.split("\n").map((line, idx) => (
                              <span key={idx}>
                                {line}
                                <br />
                              </span>
                            ))}
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
          <>
            <motion.button
              className="px-6 py-2 bg-blue-300 text-black font-semibold rounded-lg hover:bg-blue-400 transition-colors duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/application")}
            >
              I am interested
            </motion.button>

            <motion.button
              className="underline underline-offset-4 font-semibold cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={showLess}
            >
              Show Less
            </motion.button>
          </>
        )}
      </motion.div>
    </section>
  );
};

export default FAQComponent;
