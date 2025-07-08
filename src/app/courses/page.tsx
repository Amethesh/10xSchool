import CourseCard, { CourseCardItems } from "@/components/Courses/CourseCard";
import EducationalVisionComponent from "@/components/Courses/CoursesHeader";
import Footer from "@/components/Home/Footer";

const coursesData: CourseCardItems[] = [
  {
    title: "5-in-1 Brain Development Program (Ages 5-15)",
    description:
      "An innovative course designed to enhance mental speed, memory retention, logical and lateral thinking using:",
    timing: "8 Levels - 3 months each\n2 hours/week",
    features: ["📜  Certification", "🧮 Abacus Kit", "⚡ Fast maths exercise"],
    coursePoints: [
      "Finger Abacus — Add/subtract using fingers (5x faster than traditional methods)",
      "Real Abacus — Solve up to trillion-digit sums using +, −, ×, ÷",
      "Mind Abacus — Mental arithmetic using visualized abacus beads",
      "Vedic Maths — Solve complex equations with ancient Indian techniques",
      "Memory Techniques — Right-brain memory training and brain activation",
    ],
    image: "/images/courses/brain.png",
    imageWidthClass: "w-96",
    bgColor: "bg-[#ccf0ff]",
  },
  {
    title: "Vedic Mathematics (Ages 10-15)",
    description:
      "Master Maths the Ancient Indian Way – Fast, Fun & Fearless! Vedic Maths is a set of ancient Indian mathematical techniques that simplifies complex calculations using mental techniques from the Atharva Veda. Unlike slow, step-by-step methods, it employs mental strategies and visual tricks to solve problems in seconds, making it perfect for Olympiads, school exams, and building confidence.",
    timing: "4 Levels - 3 months each\n2 hours/week",
    features: ["📜 Certification", "📝 Fast maths exercise"],
    coursePoints: [
      "Mastery of mental techniques from Atharva Veda for calculations",
      "Application of mental strategies and visual tricks for rapid problem-solving",
    ],
    image: "/images/courses/maths.png",
    bgColor: "bg-[#d7cdff]",
  },
  {
    title: "School & Institute Tie-Ups",
    description:
      "Partner with us to bring The 10X Learning Edge to your school or institute:",
    coursePoints: [
      "Co-curricular Programs",
      "Customizable Academic Enrichment Modules",
      "Comprehensive training for instructors / Teachers",
      "Well-structured course materials including books, abacus kit, and access to engaging online exercises and activities",
      "Recognition and motivation through certificates after each level",
    ],
    features: [
      "🫴 Join hands with us to deliver measurable results in student learning and engagement",
    ],
    image: "/images/courses/school.png",
    bgColor: "bg-[#fff8e9]",
  },
  {
    title: "Phonics Program (Ages 4-8)",
    description:
      "Build a strong foundation in English reading and speaking. This program is perfect for early learners and ESL students.",
    timing: "3 Levels - 2 months each\n3 hours/week",
    features: ["📜 Certification", "📝 Engaging activities"],
    coursePoints: [
      "Letter sounds and blends",
      "Word formation and pronunciation",
      "Reading fluency through stories and fun exercises",
    ],
    image: "/images/courses/letters.png",
    bgColor: "bg-[#ffd6ee]",
  },
  {
    title: "Drawing for Kids (Ages 5-13)",
    description:
      "An innovative course designed to enhance mental speed, memory retention, logical and lateral thinking using:",
    timing: "8 Levels - 3 months each\n2 hours/week", // This description and points seem copied from the first course. You might want to update these for a drawing course.
    features: ["📜 Certification", "🖼️ Art Kit", "✨ Creative sessions"], // Changed "Abacus Kit" to "Art Kit"
    coursePoints: [
      "Learn basic shapes and perspective",
      "Explore color theory and shading techniques",
      "Develop observational drawing skills",
      "Create imaginative and expressive artworks",
      "Boost fine motor skills and creativity",
    ],
    image: "/images/courses/pencil.png",
    bgColor: "bg-[#ccf0ff]",
  },
  {
    title:
      "Vedic Maths Brain Development Program training to Tutors / Parents (Ages 25-50)",
    description:
      "Vedic Maths is a set of ancient Indian mathematical techniques that enable quick and accurate calculations. Instead of the slow, step-by-step methods taught in regular schools, Vedic Maths uses mental strategies and visual tricks to solve problems in seconds.",
    timing: "4 Levels - 3 months each\n2 hours/week",
    features: ["📜 Certification", "📝 Fast maths exercise"],
    coursePoints: [
      "Learn ancient Indian mathematical techniques for quick and accurate calculations",
      "Master mental strategies and visual tricks to solve problems rapidly",
      "Understand how to teach Vedic Maths effectively to students",
    ],
    image: "/images/courses/maths.png",
    bgColor: "bg-[#d7cdff]",
  },
  {
    title: "Tuition Classes for Grades 9-12 (Maths, Physics, Chemistry)",
    description:
      "Comprehensive tuition classes designed for students in Grades 9-12, focusing on Maths, Physics, and Chemistry, providing a strong academic foundation and enhancing performance.",
    timing: "", // Changed from 'null' to an empty string. This will display an empty timing box.
    // If you want the default timing from CourseCard, you can omit the 'timing' property entirely.
    features: [
      "👨‍🎓 Tailored curriculum for academic success", // Adjusted feature for clarity
    ],
    coursePoints: [
      "In-depth coverage of Maths, Physics, and Chemistry syllabi.",
      "Experienced educators providing personalized attention.",
      "Regular assessments and progress tracking.",
      "Doubt-clearing sessions and exam preparation strategies.",
      "Focus on conceptual understanding and problem-solving skills.",
    ],
    image: "/images/courses/study.png",
    bgColor: "bg-[#fff8e9]",
  },
];

const page = () => {
  return (
    <main className="mt-24">
      <EducationalVisionComponent />
      {coursesData.map((courseData, index) => (
        <CourseCard key={index} {...courseData} />
      ))}
      <Footer />
    </main>
  );
};

export default page;
