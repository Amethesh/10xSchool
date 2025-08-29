"use client";
import * as motion from "motion/react-client";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";
import TrustpilotWidget from "../TrustpilotWidget";
const Testimonials = () => {
  return (
    <section className="mt-30">
      <motion.div
        className="flex flex-col justify-center items-center mt-2 mb-10"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.p
          className="px-12 py-6 text-4xl bg-white border-2 border-black w-fit font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300"
          whileHover={{
            scale: 1.05,
            rotate: -1,
          }}
          whileTap={{ scale: 0.95 }}
        >
          Helping students succeed!
        </motion.p>
        <motion.p
          className="flex flex-col justify-center items-center gap-2 px-12 py-2 text-xl bg-white border-2 border-black w-fit font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300"
          whileHover={{
            scale: 1.05,
            rotate: -1,
          }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            <span>Rated 4.2+ on</span>
            <img
              src="https://static.sitejabber.com/img/urls/746023/thumbnail_logo_review_mobile2x.1745404707.png"
              width={100}
              height={30}
              alt="Trust pilot logo"
            />
          </div>
            <TrustpilotWidget />
        </motion.p>
      </motion.div>
      <div className="h-[30rem] flex flex-col antialiased items-center justify-center relative overflow-hidden ">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
    </section>
  );
};

const testimonials = [
  {
    quote:
      "My daughter completed her Master Level Vedic Math class at 10X Academy successfully, thanks to the exceptional guidance and support of her instructor. Sir's dedication, expertise, and patience have been truly remarkable. His engaging teaching style and clear explanations made complex concepts easy to understand and enjoyable to learn. . .",
    name: "Prameela Sunil Amin",
    title: "My daughter completed her Master Level…",
    image:
      "https://user-images.trustpilot.com/665031b63062a089d1fc5a03/73x73.png",
  },
  {
    quote:
      "Demo Class was excellent and really impressed the way instructor sir went thru. Overall, it was an amazing session.",
    name: "Shravya Vempalakula",
    title: "Demo Class was excellent and really…",
    image:
      "https://user-images.trustpilot.com/64fec18f45a83e0012c51308/73x73.png",
  },
  {
    quote:
      "Excellent Teacher ! He is very patient  .his teaching method is very easy to understand . Our experience is very nice with 10x School. My son like the way of teaching . Highly recommended !",
    name: "Nanki sharma",
    title: "Excellent Teacher",
    image:
      "https://user-images.trustpilot.com/64e77d88953b290012bf8996/73x73.png",
  },
  {
    quote:
      "The webinar was very nice and well-explained. Karthick sir explained the course very clearly and what to buy for a certain age.",
    name: "Rithiksha Balaji",
    title: "The webinar was very nice and…",
    image:
      "https://user-images.trustpilot.com/6464fdc7acffd100120ffd51/73x73.png",
  },
  {
    quote: "Excellent, amazing",
    name: "Menaka Hiremath",
    title: "Excellent",
    image:
      "https://user-images.trustpilot.com/6468c69c498f680012714a39/73x73.png",
  },
  {
    quote:
      "This was wonderful class because it's really helpful to do maths really fast and this helps in improvising our mental knowledge,and so on ....",
    name: "Amales Waran",
    title: "Good for mind and helps to future",
    image:
      "https://user-images.trustpilot.com/64639b50ad9a2300128ae4c4/73x73.png",
  },
  {
    quote:
      "It has an excellent platform with amazing teacher. It helps to learn math in easy way.",
    name: "Thanishkaa Shri",
    title: "Enjoy learning",
    image:
      "https://user-images.trustpilot.com/6460f6fbd698590012837aa3/73x73.png",
  },
];

export default Testimonials;
