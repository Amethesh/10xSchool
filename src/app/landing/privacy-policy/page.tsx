import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | The 10X School",
  description:
    "How The 10X School collects, uses, stores and protects personal information provided by parents, guardians, students and website visitors.",
};

const LAST_UPDATED = "September 2026";
const CONTACT_EMAIL = "mentor@the10xschool.com";
const CONTACT_WHATSAPP = "+91 9787220578";
const WEBSITE = "https://the10xschool.com";

type Block =
  | { kind: "p"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "list"; items: string[] };

type Section = {
  id: string;
  title: string;
  blocks: Block[];
};

const p = (text: string): Block => ({ kind: "p", text });
const sub = (text: string): Block => ({ kind: "sub", text });
const list = (items: string[]): Block => ({ kind: "list", items });

const SECTIONS: Section[] = [
  {
    id: "about",
    title: "About The 10X School",
    blocks: [
      p("The 10X School provides online educational and enrichment programs for children, including programs in:"),
      list([
        "Vedic Maths and Mental Calculation",
        "Abacus",
        "Memory Techniques",
        "Financial Literacy for kids",
        "Phonics",
        "Handwriting",
        "Free-style Drawing",
        "Academic tuition and other educational programs",
      ]),
      p(`Our website is: ${WEBSITE}`),
    ],
  },
  {
    id: "information-we-collect",
    title: "Information We May Collect",
    blocks: [
      p("Depending on how you interact with us, we may collect information such as:"),
      sub("Parent/Guardian information"),
      list([
        "Name",
        "Mobile/WhatsApp number",
        "Email address",
        "Country or location",
        "Preferred communication method",
        "Preferred assessment / class timing",
      ]),
      sub("Child/student information"),
      p("When provided by a parent or lawful guardian, we may collect limited information necessary to provide our educational services, such as:"),
      list([
        "Child’s first name",
        "Age",
        "Grade/class",
        "School curriculum or board",
        "Information relevant to the child’s educational requirements",
        "Assessment responses and results",
      ]),
      p("We request only information that is reasonably necessary for the relevant educational service or enquiry."),
    ],
  },
  {
    id: "how-we-collect",
    title: "How We Collect Information",
    blocks: [
      p("We may collect information when you:"),
      list([
        "Submit a form on our website",
        "Submit a Meta/Instagram/Facebook lead form",
        "Contact us through WhatsApp, phone, email or other communication channels",
        "Register for a FREE Math Speed Assessment",
        "Enrol in one of our programs",
        "Participate in an online class or assessment",
        "Communicate with The 10X School regarding our services",
      ]),
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    blocks: [
      p("We may use the information provided to:"),
      list([
        "Respond to your enquiry",
        "Schedule and conduct a FREE Math Speed Assessment",
        "Communicate assessment details and timings",
        "Prepare and share assessment results or reports",
        "Understand your child’s educational requirements",
        "Recommend an appropriate educational program",
        "Provide online classes and educational services",
        "Communicate regarding classes, schedules and related services",
        "Improve our educational programs and customer experience",
        "Send information about relevant The 10X School programs or services where permitted and appropriate",
      ]),
      p("We do not sell your personal information to third parties."),
    ],
  },
  {
    id: "childrens-data",
    title: "Children’s Personal Data",
    blocks: [
      p("The 10X School provides educational services to children."),
      p("We expect information relating to a child to be provided by the child’s parent or lawful guardian."),
      p("Where personal information relating to a child is required for an assessment or educational service, we will seek the appropriate consent of the parent or lawful guardian."),
      p("We aim to collect only the information reasonably necessary to provide the requested assessment or educational service."),
      p("We do not intentionally use children’s personal information for behavioural monitoring or targeted advertising directed at children."),
      p("Parents or lawful guardians may contact us regarding the personal information provided about their child."),
    ],
  },
  {
    id: "assessment",
    title: "FREE Math Speed Assessment and Demo",
    blocks: [
      p("If you register your child for our FREE Math Speed Assessment or Demo, we may collect information such as the child’s age, grade and assessment responses."),
      p("Assessment information may be used to:"),
      list([
        "Conduct the assessment",
        "Evaluate calculation accuracy and speed",
        "Prepare an assessment report",
        "Recommend suitable learning areas or programs",
        "Communicate the assessment results to the parent / guardian",
      ]),
      p("The assessment is intended for educational guidance and does not constitute a psychological, medical or professional educational diagnosis."),
    ],
  },
  {
    id: "communication",
    title: "WhatsApp and Other Communication",
    blocks: [
      p("If you provide your WhatsApp number or telephone number, we may use it to contact you regarding:"),
      list([
        "Your enquiry",
        "Assessment scheduling",
        "Assessment results",
        "Class information",
        "The 10X School programs and services",
      ]),
      p("You may request that we stop sending promotional communications at any time."),
    ],
  },
  {
    id: "advertising",
    title: "Advertising and Marketing",
    blocks: [
      p("The 10X School may use digital advertising platforms such as Meta (Facebook and Instagram), Google Ads or other digital platforms to promote its educational programs."),
      p("Information submitted on lead form through all such digital platforms may be received by The 10X School and used for the purposes described in this Privacy Policy."),
      p("We may also use website and advertising technologies such as cookies, pixels or similar technologies to understand website usage, measure advertising performance and improve our marketing, where applicable."),
      p("We do not use children’s personal information for targeted advertising directed at children."),
    ],
  },
  {
    id: "photographs",
    title: "Photographs and Class Images",
    blocks: [
      p("From time to time, The 10X School may wish to use photographs, class screenshots or other images of students for promotional purposes."),
      p("We will seek appropriate permission from the parent or lawful guardian before using identifiable images of a child for promotional or advertising purposes."),
      p("Where appropriate, identifying information such as a child’s full name, personal contact information or other unnecessary details may be removed or obscured."),
      p("Parents may contact us regarding previously granted permission."),
    ],
  },
  {
    id: "sharing",
    title: "Sharing of Personal Information",
    blocks: [
      p("We may use trusted service providers and technology platforms that help us operate our business, such as:"),
      list([
        "Website and hosting providers",
        "Communication platforms",
        "Online education/classroom platforms",
        "Assessment and form platforms",
        "Payment service providers",
        "Advertising and analytics platforms",
      ]),
      p("Such providers may process information on our behalf as necessary to provide their services."),
      p("We do not sell or rent personal information to third parties."),
      p("We may also disclose information where required by applicable law or legal process."),
    ],
  },
  {
    id: "retention",
    title: "Data Retention",
    blocks: [
      p("We retain personal information only for as long as reasonably necessary for the purpose for which it was collected, to provide our services, maintain appropriate records, resolve disputes, comply with legal obligations, or protect our legitimate interests."),
      p("When personal information is no longer reasonably required, we will take appropriate steps to delete or securely dispose of it, subject to applicable legal or regulatory requirements."),
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    blocks: [
      p("Subject to applicable law, you may contact us to:"),
      list([
        "Ask what personal information we hold about you",
        "Request correction of inaccurate information",
        "Request deletion of personal information where applicable",
        "Withdraw consent where processing is based on consent",
        "Request that we stop certain communications",
        "Raise a concern regarding the handling of your personal information",
      ]),
      p("Where consent is the basis for processing, withdrawal of consent will not affect the lawfulness of processing carried out before withdrawal."),
    ],
  },
  {
    id: "withdraw-consent",
    title: "How to Withdraw Consent or Request Deletion",
    blocks: [
      p("You may contact us using the details below to withdraw consent or request correction or deletion of your personal information."),
      p("Please include enough information for us to identify the relevant enquiry or account, including the registered name of the student."),
      p("__CONTACT_CARD__"),
      p("We will process such requests in accordance with applicable law."),
    ],
  },
  {
    id: "security",
    title: "Data Security",
    blocks: [
      p("We take reasonable technical and organisational measures to protect personal information against unauthorised access, misuse, alteration, disclosure or loss."),
      p("However, no method of electronic transmission or storage can be guaranteed to be completely secure."),
    ],
  },
  {
    id: "cookies",
    title: "Cookies and Website Technologies",
    blocks: [
      p("Our website may use cookies and similar technologies to:"),
      list([
        "Enable essential website functionality",
        "Understand website traffic and usage",
        "Improve website performance",
        "Measure advertising effectiveness",
        "Improve our marketing and user experience",
      ]),
      p("You may be able to control cookies through your browser settings."),
    ],
  },
  {
    id: "third-parties",
    title: "Third-Party Websites and Services",
    blocks: [
      p("Our website or communications may contain links to third-party websites, platforms or services."),
      p("The privacy practices of those third parties are governed by their own privacy policies."),
      p("We encourage users to review those policies before providing personal information to third-party services."),
    ],
  },
  {
    id: "changes",
    title: "Changes to This Privacy Policy",
    blocks: [
      p("We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements or data practices."),
      p("The updated version will be published on this page with a revised “Last Updated” date."),
    ],
  },
  {
    id: "contact",
    title: "Contact Us",
    blocks: [
      p("If you have any questions, concerns or requests regarding this Privacy Policy or the handling of your personal information, please contact:"),
      p("__CONTACT_CARD__"),
    ],
  },
];

const ContactCard = () => (
  <div className="my-5 rounded-2xl border border-[#0246A4]/15 bg-[#0246A4]/[0.04] p-5 not-prose">
    <p className="font-bold text-[#0246A4]">The 10X School</p>
    <dl className="mt-3 space-y-2 text-[15px]">
      <div className="flex flex-wrap gap-x-2">
        <dt className="text-gray-500 min-w-[86px]">Website</dt>
        <dd>
          <a
            href={WEBSITE}
            className="text-[#0246A4] underline underline-offset-2 hover:text-[#013a87]"
          >
            the10xschool.com
          </a>
        </dd>
      </div>
      <div className="flex flex-wrap gap-x-2">
        <dt className="text-gray-500 min-w-[86px]">Email</dt>
        <dd>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[#0246A4] underline underline-offset-2 hover:text-[#013a87]"
          >
            {CONTACT_EMAIL}
          </a>
        </dd>
      </div>
      <div className="flex flex-wrap gap-x-2">
        <dt className="text-gray-500 min-w-[86px]">WhatsApp</dt>
        <dd>
          <a
            href={`https://wa.me/${CONTACT_WHATSAPP.replace(/[^0-9]/g, "")}`}
            className="text-[#0246A4] underline underline-offset-2 hover:text-[#013a87]"
          >
            {CONTACT_WHATSAPP}
          </a>
        </dd>
      </div>
    </dl>
  </div>
);

const renderBlock = (block: Block, i: number) => {
  if (block.kind === "sub") {
    return (
      <h3 key={i} className="mt-5 mb-2 font-bold text-gray-900">
        {block.text}
      </h3>
    );
  }

  if (block.kind === "list") {
    return (
      <ul key={i} className="my-3 space-y-1.5">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 text-gray-700">
            <span
              aria-hidden
              className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0246A4]/40"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.text === "__CONTACT_CARD__") {
    return <ContactCard key={i} />;
  }

  return (
    <p key={i} className="my-3 text-gray-700 leading-relaxed">
      {block.text}
    </p>
  );
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-gradient-to-b from-[#0246A4]/[0.05] to-transparent pt-32 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0246A4]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Last updated: {LAST_UPDATED}
          </p>
          <div className="mt-6 max-w-3xl space-y-3 text-gray-700 leading-relaxed">
            <p>
              The 10X School (“we”, “us”, “our”) respects your privacy and is
              committed to protecting the personal information provided by
              parents, guardians, students and visitors to our website.
            </p>
            <p>
              This Privacy Policy explains how The 10X School collects, uses,
              stores and protects personal information when you visit our
              website, contact us, submit an enquiry, register for an
              assessment, or use our online educational services.
            </p>
            <p className="font-medium text-gray-900">
              By submitting your information to us, you acknowledge that you
              have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col-reverse gap-10 lg:flex-row lg:gap-14">
          {/* Sections */}
          <div className="min-w-0 flex-1">
            {SECTIONS.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 border-t border-gray-200 py-8 first:border-t-0 first:pt-0"
              >
                <h2 className="mb-3 flex gap-3 text-xl font-bold text-gray-900">
                  <span className="text-[#0246A4]/40 tabular-nums">
                    {index + 1}.
                  </span>
                  {section.title}
                </h2>
                {section.blocks.map(renderBlock)}
              </section>
            ))}
          </div>

          {/* Contents — 18 sections is enough to need a map */}
          <nav
            aria-label="On this page"
            className="lg:w-64 lg:shrink-0 lg:sticky lg:top-28 lg:self-start"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              On this page
            </p>
            <ol className="space-y-1 border-l border-gray-200">
              {SECTIONS.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px flex gap-2 border-l-2 border-transparent py-1.5 pl-4 text-[13px] leading-snug text-gray-500 transition-colors hover:border-[#0246A4] hover:text-[#0246A4]"
                  >
                    <span className="tabular-nums text-gray-400">
                      {index + 1}.
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </main>
  );
}
