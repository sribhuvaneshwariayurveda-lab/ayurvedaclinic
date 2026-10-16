/* --------------------------------------------------------------------------
   Placeholder content for the Home page.
   These values are placeholders until the real clinic details are supplied and
   will later be served from the CMS API. No medical claims, cure rates or
   invented patients are included.
   -------------------------------------------------------------------------- */

export const clinic = {
  name: "Sri Bhuvaneshwari Ayurveda Peedam",
  tagline: "Classical Ayurveda",
  doctor: "Dr. B. Neeraj Kalkin",
  qualifications: "BAMS",
  regNo: "2366/A",
  university: "Dr. M.G.R. Medical University, Chennai",
  graduationYear: "2023",
  experience: "2 years clinical experience",
  phone: "+91 96299 07763",
  phoneDisplay: "+91 96299 07763",
  bookingLink: "https://wa.me/919629907763",
  email: "",
  whatsapp: "919629907763",
  addressLines: ["87/92A, South Street, Pasupathipalayam", "Karur, Tamil Nadu, India"],
  /* Clinic location — single source of truth (CMS-editable).
     mapsUrl is the exact Google Maps location link shared by the clinic and
     is used for the "Get Directions" button (opens in a new tab).
     mapEmbed is an optional full Google Maps embed URL override; when empty,
     the site embeds a query-based map of the address above (no coordinates
     are invented or stored). */
  mapsUrl: "https://maps.app.goo.gl/4nWZfsS9LmrFe2pD9",
  /* No clinic timings were supplied as verified information, so no hours are
     listed. Consultations are by appointment via WhatsApp. */
  hoursNote: "Consultations by appointment",
  hours: [
    { day: "Consultations", time: "By appointment via WhatsApp" }
  ],
  mapEmbed: "", // optional full Google Maps embed URL override (see mapsUrl note above)
  socials: {
    instagram: "",
    facebook: "",
    youtube: ""
  }
};

/* --------------------------------------------------------------------------
   Site settings — single source of truth for global toggles.
   `animations` is the CMS/admin-controlled animation preset. Only the three
   supported presets below are accepted; any other value falls back to "full".
   ("off" is also forced automatically when the OS requests reduced motion.)
   -------------------------------------------------------------------------- */

export const siteSettings = {
  animations: "full" // "full" | "subtle" | "off"
};

export const nav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Treatments", to: "/treatments" },
  { label: "Products", to: "/products" },
  { label: "Gallery", to: "/gallery" },
  { label: "FAQs", to: "/faqs" },
  { label: "Contact", to: "/contact" }
];

export const hero = {
  label: "Doctor-led Ayurveda",
  title: "Restoring balance with",
  titleAccent: "classical Ayurvedic care.",
  desc: "Personalised consultations, authentic herbal medicine and time-honoured therapies — delivered by a qualified Ayurvedic physician in a calm, welcoming clinic.",
  primaryCta: { label: "Consult the Doctor", to: "/contact" },
  secondaryCta: { label: "Explore Treatments", to: "/treatments" },
  stats: [
    { value: "BAMS", label: "Qualified physician" },
    { value: "1:1", label: "Personalised plans" },
    { value: "Classical", label: "Authentic therapies" }
  ],
  badge: {
    title: "First consultation",
    text: "Begin with a detailed Nadi & Prakriti assessment."
  },
  mediaLabel: "Doctor consultation"
};

export const strip = [
  "Authentic classical formulations",
  "Personalised Prakriti assessment",
  "Panchakarma & detox therapies",
  "Doctor-led treatment plans",
  "Confidential consultations"
];

export const about = {
  label: "About the Doctor",
  title: "Care rooted in tradition,",
  titleAccent: "guided by evidence.",
  paragraphs: [
    "Dr. B. Neeraj Kalkin (BAMS, Reg. No. 2366/A) practises classical Ayurveda with a patient-centred approach — beginning every journey with a detailed assessment of constitution (Prakriti), current imbalances (Vikriti) and lifestyle.",
    "Treatments combine authentic herbal formulations, diet and routine guidance, and traditional therapies where appropriate. Every plan is explained clearly, with honest expectations and no exaggerated promises."
  ],
  credentials: [
    "Bachelor of Ayurvedic Medicine and Surgery (BAMS)",
    "Dr. M.G.R. Medical University, Chennai — 2023",
    "Registered Medical Practitioner — Reg. No. 2366/A",
    "2 years clinical experience"
  ],
  pillars: [
    { title: "Clinical Philosophy", text: "Honest, individualised treatment designed for long-term balance rather than quick fixes." },
    { title: "Patient Experience", text: "Unhurried consultations and a calm environment so every visit feels considered." }
  ],
  quote: "Every patient deserves care that is effective, ethical and genuinely personal.",
  mediaLabel: "Doctor portrait",
  mediaLabelSmall: "Clinic consultation room",
  /* Clinic photographs supplied by the clinic, served from /images/.
     Expected files in client/public/images/:
       clinic.jpg (clinic exterior — About and Contact sections),
       doctor.jpg (doctor portrait — Doctor Profile section),
       kidney-care-syrup.jpg (product display — Products section only).
     Until each file is present, that slot renders its on-brand fallback. */
  photos: {
    doctor: { src: "/images/doctor.jpg", alt: "Portrait of Dr. B. Neeraj Kalkin, BAMS" },
    clinic: { src: "/images/clinic.jpg", alt: "Exterior of Sri Bhuvaneshwari Ayurveda Peedam, Pasupathipalayam, Karur" }
  }
};

export const treatmentCategories = [
  "All",
  "Consultation",
  "Panchakarma",
  "Women's Health",
  "Lifestyle & Metabolism",
  "Wellness"
];

export const treatments = [
  {
    cat: "Consultation",
    title: "Ayurvedic Consultation",
    desc: "Detailed Prakriti and Vikriti assessment with a personalised treatment and diet plan.",
    mediaLabel: "Consultation"
  },
  {
    cat: "Panchakarma",
    title: "Panchakarma Detox",
    desc: "Supervised cleansing therapies including Vamana, Virechana, Basti, Nasya and Raktamokshana where indicated.",
    mediaLabel: "Panchakarma therapy"
  },
  {
    cat: "Panchakarma",
    title: "Abhyanga & Swedana",
    desc: "Therapeutic oil massage and herbal steam to ease stiffness, improve circulation and calm the nervous system.",
    mediaLabel: "Abhyanga therapy"
  },
  {
    cat: "Women's Health",
    title: "Women's Health Care",
    desc: "Support for menstrual health, PCOS, hormonal balance and post-natal recovery.",
    mediaLabel: "Women's health"
  },
  {
    cat: "Lifestyle & Metabolism",
    title: "Metabolic & Lifestyle Care",
    desc: "Ayurvedic management of digestion, weight, blood sugar and stress-related concerns.",
    mediaLabel: "Lifestyle care"
  },
  {
    cat: "Wellness",
    title: "Wellness & Prevention",
    desc: "Seasonal routines (Ritucharya), immunity support and Rasayana therapies for everyday wellbeing.",
    mediaLabel: "Wellness"
  }
];

export const why = [
  { icon: "award", title: "Qualified Physician", text: "Care delivered by a registered BAMS Ayurvedic doctor." },
  { icon: "leaf", title: "Authentic Formulations", text: "Classical herbal medicines sourced from trusted manufacturers." },
  { icon: "users", title: "Personalised Plans", text: "No two constitutions are alike — neither are our treatment plans." },
  { icon: "shield", title: "Ethical Practice", text: "Honest guidance, transparent timelines and no guaranteed outcomes." },
  { icon: "heart", title: "Comfortable Setting", text: "A calm clinic experience designed to put you at ease." },
  { icon: "spa", title: "Therapy Expertise", text: "Trained therapists for traditional Panchakarma and allied therapies." }
];

export const testimonialsNote =
  "Testimonials will be published only with genuine patient consent. No results are guaranteed.";

/* No verified patient testimonials have been supplied, so the list stays empty.
   The Testimonials section renders only the note above until genuine,
   consented testimonials are provided. */
export const testimonials = [];

export const faqs = [
  {
    q: "What should I expect during my first consultation?",
    a: "Your first visit is an in-depth assessment. The physician reviews your medical history, current concerns, diet, sleep and routine, and examines pulse (Nadi), tongue and constitution (Prakriti). You will leave with a personalised treatment approach and clear next steps."
  },
  {
    q: "Are Ayurvedic treatments safe alongside my current medication?",
    a: "Please bring a complete list of your current medicines. Ayurvedic treatment can often be integrated, but any changes are decided by the physician with your safety in mind. Do not stop prescribed medication on your own."
  },
  {
    q: "How long does treatment take?",
    a: "Timelines vary by condition, constitution and how consistently the plan is followed. Your physician will give you a realistic, individualised estimate during consultation rather than a fixed promise."
  },
  {
    q: "What is Panchakarma?",
    a: "Panchakarma is a set of five classical cleansing procedures. It is recommended only after assessment and is supervised throughout. Not every patient is a suitable candidate, and it is never recommended indiscriminately."
  },
  {
    q: "How do I book an appointment?",
    a: "You can send an appointment enquiry through the form or reach us on WhatsApp. An enquiry confirms that we have received your request; our team then contacts you to confirm the actual appointment slot."
  }
];

export const contact = {
  label: "Visit Our Clinic",
  title: "Book your consultation",
  desc: "Share your preferred date and we will help you find a suitable time. Send an enquiry on WhatsApp — our team will confirm your slot."
};

/* --------------------------------------------------------------------------
   Products — displayed without medical claims.
   The clinic's product photograph (Kidney Care Syrup) is served from
   /images/kidney-care-syrup.jpg when the file is present. The copy below
   describes only that it is a clinic product available on prescription /
   consultation, with no claim that it cures kidney disease or any other
   condition, and no contact details copied from any label.
   -------------------------------------------------------------------------- */

export const products = {
  label: "Clinic Products",
  title: "Herbal products",
  titleAccent: "at the clinic.",
  desc: "Classical herbal products dispensed at the clinic as part of a doctor-led treatment plan. Ask the physician whether a product is appropriate for you.",
  items: [
    {
      name: "Kidney Care Syrup",
      tag: "Clinic product",
      text: "A herbal syrup available at Sri Bhuvaneshwari Ayurveda Peedam. Use only as directed by the physician after consultation.",
      image: { src: "/images/kidney-care-syrup.jpg", alt: "Kidney Care Syrup — clinic product display" }
    }
  ],
  note: "Products are dispensed after consultation. No product is a substitute for medical advice — follow the physician's directions and do not stop prescribed medication on your own."
};

/* --------------------------------------------------------------------------
   Cinematic redesign content.
   Imagery: real photographs from Wikimedia Commons (CC licences — see
   credits in the gallery section and footer). Captions describe the subject
   of each photo only; no photo is presented as the clinic's own premises,
   staff or patients.
   -------------------------------------------------------------------------- */

export const intro = {
  label: "The Science of Life",
  title: "Ayurveda, practised",
  titleAccent: "the classical way.",
  paragraphs: [
    "Ayurveda — the science of life — understands health as balance between body, mind and daily routine. At Sri Bhuvaneshwari Ayurveda Peedam, that understanding guides every consultation: unhurried, personal and grounded in classical method.",
    "From the first Nadi and Prakriti assessment to herbal formulations prepared to traditional standards, care here follows time-honoured practice with honest, clearly explained expectations."
  ],
  image: {
    src: "/images/tulsi-grove.jpg",
    alt: "Tulsi (holy basil) leaves photographed in soft natural light"
  }
};

export const herbs = {
  label: "Materia Medica",
  title: "Drawn from",
  titleAccent: "the botanical world.",
  desc: "Classical formulations begin with plants — identified, prepared and combined according to traditional method. A glimpse of the botanical world behind the clinic's herbal medicine.",
  cards: [
    {
      title: "Tulsi",
      latin: "Ocimum tenuiflorum",
      text: "Holy basil, among the most revered plants of the classical tradition, photographed in flower.",
      image: { src: "/images/tulsi-macro.jpg", alt: "Close-up of a Tulsi flowering spike" }
    },
    {
      title: "Prepared to tradition",
      latin: "Stone-ground formulations",
      text: "Herbs ground and blended in the traditional manner before being prepared as prescribed medicine.",
      image: { src: "/images/mortar-sun.jpg", alt: "Stone mortar and pestle in warm sunlight" }
    }
  ]
};

export const gallery = {
  label: "Gallery",
  title: "A botanical",
  titleAccent: "study.",
  desc: "Light, leaf and flame — the raw materials of classical practice.",
  images: [
    { src: "/images/hero-diyo.jpg", alt: "Flame of a traditional brass oil lamp", caption: "Deepam — the clinic lamp", credit: "BRPever, CC BY-SA 4.0, via Wikimedia Commons" },
    { src: "/images/tulsi-grove.jpg", alt: "Tulsi leaves in soft natural light", caption: "Tulsi in the garden", credit: "Challiyan, CC BY-SA 2.5, via Wikimedia Commons" },
    { src: "/images/tulsi-macro.jpg", alt: "Close-up of a Tulsi flowering spike", caption: "Tulsi in flower", credit: "Muhammad Mahdi Karim, CC BY-SA 2.5, via Wikimedia Commons" },
    { src: "/images/mortar-sun.jpg", alt: "Stone mortar and pestle in warm sunlight", caption: "Stone-ground preparation", credit: "Takeaway, CC BY-SA 3.0, via Wikimedia Commons" },
    { src: "/images/tulsi-spike.jpg", alt: "Tulsi flower spike against a dark background", caption: "Manjari — the flower spike", credit: "Vaikoovery, CC BY 3.0, via Wikimedia Commons" },
    { src: "/images/tulsi-sprout.jpg", alt: "Young Tulsi leaves against mossy bark", caption: "New growth", credit: "Vengolis, CC BY-SA 4.0, via Wikimedia Commons" }
  ]
};
