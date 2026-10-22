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
  { label: "About Us", to: "/about" },
  { label: "Treatments", to: "/treatments" },
  { label: "Products", to: "/products" },
  { label: "Diseases", to: "/diseases" },
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
  /* Extended "About Us" story — admin-editable copy. */
  story: {
    title: "Our Story",
    paragraphs: [
      "Sri Bhuvaneshwari Ayurveda Peedam was founded in Pasupathipalayam, Karur, on a simple belief: Ayurvedic care should feel personal, unhurried and honest. The clinic brings classical practice — Nadi and Prakriti assessment, authentic herbal formulations and time-honoured therapies — into a calm, respectful setting that patients can return to.",
      "Every consultation begins with listening. The physician reviews your medical history, current medicines, daily routine and sleep, and only then proposes a plan. Where a condition needs specialist or hospital care, we say so plainly and help you reach it — the aim is always your wellbeing, never a longer list of prescriptions."
    ]
  },
  /* The four-step patient journey. */
  journey: {
    title: "Your Visit, Step by Step",
    steps: [
      { title: "Enquiry", text: "Send a WhatsApp or web enquiry with your preferred date. Our team confirms a suitable appointment slot." },
      { title: "Assessment", text: "A detailed consultation covering medical history, pulse (Nadi), tongue, constitution (Prakriti) and daily routine." },
      { title: "Your Plan", text: "A written plan combining herbal preparations, diet and routine guidance, and therapies where appropriate." },
      { title: "Follow-up", text: "Scheduled reviews to assess progress and adjust the plan. Progress is monitored, never assumed." }
    ]
  },
  /* Core values shown on the About page. */
  values: [
    { title: "Evidence & Experience", text: "Classical method, applied by a qualified BAMS physician with continuing clinical practice." },
    { title: "Clear Communication", text: "Plain-language explanations of what we recommend, why, and what to expect." },
    { title: "Safety First", text: "All current medicines are reviewed with you. Nothing is changed or stopped without clinical advice." },
    { title: "Confidentiality", text: "Your health details are discussed privately and shared only with your consent." },
    { title: "No False Promises", text: "We set realistic expectations. No cure is guaranteed and no result is promised." },
    { title: "Whole-Person Care", text: "Sleep, stress, digestion and routine are treated as part of the picture, not afterthoughts." }
  ],
  /* Body systems the clinic focuses on (plain-language focus areas). */
  specialities: [
    "Respiratory health",
    "Skin & scalp care",
    "Digestive health",
    "Metabolic & lifestyle care",
    "Musculoskeletal pain",
    "Women's & reproductive health",
    "Urinary health",
    "General wellness & prevention"
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
  note: "Products are dispensed after consultation. No product is a substitute for medical advice — follow the physician's directions and do not stop prescribed medication on your own.",
  items: [
    {
      slug: "kidney-care-syrup",
      name: "Kidney Care Syrup",
      price: "",
      tag: "Clinic product",
      category: "Herbal syrup",
      text: "A herbal syrup available at Sri Bhuvaneshwari Ayurveda Peedam. Use only as directed by the physician after consultation.",
      details:
        "A classical herbal syrup prepared for oral use and dispensed by the clinic after consultation. The physician reviews your current medicines and advises the dose and duration that suits your constitution and current condition.",
      highlights: [
        "Liquid herbal preparation, easy to measure",
        "Dispensed only after consultation",
        "Dose and duration decided by the physician",
        "Reviewed alongside your current medication"
      ],
      usage:
        "Take only in the dose and for the duration advised by the physician. If you are pregnant, breastfeeding, managing a chronic condition or taking regular medication, mention this before use.",
      disclaimer:
        "This preparation is not a cure for kidney disease or any other condition, and it does not replace prescribed medical treatment. Kidney complaints require proper medical evaluation and, where needed, specialist care.",
      image: { src: "/images/kidney-care-syrup.jpg", alt: "Kidney Care Syrup — clinic product display" },
      gallery: [{ src: "/images/kidney-care-syrup.jpg", alt: "Kidney Care Syrup — clinic product display" }]
    },
    {
      slug: "anti-ageing-serum",
      name: "Anti-Ageing Serum",
      price: "",
      tag: "Clinic product",
      category: "External preparation",
      text: "A topical classical preparation for external use, dispensed with clear application guidance after consultation.",
      details:
        "A classical herbal external preparation used as part of a daily skin-care routine recommended by the physician. Skin ageing, dryness and sensitivity are assessed first, because product strength and frequency depend on your skin type and any medicines you already use.",
      highlights: [
        "For external use only",
        "Application frequency set by the physician",
        "Suitability checked against current medication",
        "Used alongside a simple daily skin routine"
      ],
      usage:
        "Apply to clean, dry skin in the quantity and frequency advised. Patch-test on a small area before wider use, and stop if irritation develops.",
      disclaimer:
        "An external preparation used for skin care. It does not reverse ageing, remove wrinkles permanently or treat skin disease. Persistent skin concerns should be assessed by a dermatologist.",
      image: { src: "/images/products/anti-ageing-serum.jpg", alt: "Anti-Ageing Serum — clinic product display" },
      gallery: [{ src: "/images/products/anti-ageing-serum.jpg", alt: "Anti-Ageing Serum — clinic product display" }]
    },
    {
      slug: "skin-care-psoriasis-support",
      name: "Skin Care & Psoriasis Support",
      price: "",
      tag: "Clinic product",
      category: "External preparation",
      text: "A classical external preparation dispensed as supportive care alongside the treatment your doctor has prescribed.",
      details:
        "An Ayurvedic external preparation used for supportive skin care. Psoriasis and other chronic skin conditions are managed with the treatment your prescribing doctor has already set, with Ayurvedic preparations used alongside for comfort, dryness and routine care — never in place of prescribed therapy.",
      highlights: [
        "Used as supportive care with prescribed treatment",
        "Formulated for dry, scaling and itchy skin",
        "Reviewed with your current medication",
        "Application guidance given at dispense"
      ],
      usage:
        "Apply as directed to affected areas, avoiding broken skin unless advised otherwise. Tell the physician about any products you use on the same area.",
      disclaimer:
        "Supportive skin care only. It is not a cure for psoriasis, eczema or any other skin condition, and it does not replace dermatological treatment or prescription medicines.",
      image: { src: "/images/products/skin-care-psoriasis-product.jpg", alt: "Skin care and psoriasis support preparation — clinic product display" },
      gallery: [{ src: "/images/products/skin-care-psoriasis-product.jpg", alt: "Skin care and psoriasis support preparation — clinic product display" }]
    },
    {
      slug: "ulcer-drops",
      name: "Ulcer Drops",
      price: "",
      tag: "Clinic product",
      category: "Herbal drops",
      text: "A classical liquid preparation dispensed for use exactly as directed by the physician.",
      details:
        "A classical herbal drops preparation dispensed by the clinic. Ulcer complaints — gastric, duodenal or oral — need proper medical assessment first, and any drops are given as part of that ongoing care, with dose and duration decided by the physician.",
      highlights: [
        "Dispensed after consultation",
        "Dose and duration decided by the physician",
        "Used alongside your prescribed treatment",
        "Not suitable for self-medication"
      ],
      usage:
        "Use only as advised. Report any new or worsening pain, vomiting, bleeding or difficulty eating to your doctor promptly.",
      disclaimer:
        "Not a cure for gastric, duodenal or oral ulcers. If you have symptoms of an ulcer, seek medical evaluation first and continue any prescribed medication.",
      image: { src: "/images/products/ulcer-drops.jpg", alt: "Ulcer Drops — clinic product display" },
      gallery: [{ src: "/images/products/ulcer-drops.jpg", alt: "Ulcer Drops — clinic product display" }]
    },
    {
      slug: "pimple-drops",
      name: "Pimple Drops",
      price: "",
      tag: "Clinic product",
      category: "Herbal drops",
      text: "A classical liquid preparation for acne-prone skin, dispensed with clear usage guidance after consultation.",
      details:
        "A classical herbal drops preparation dispensed for acne-prone skin. The cause of breakouts differs from person to person — hormones, digestion, stress and routine all play a part — so the preparation is paired with practical diet and routine advice rather than used on its own.",
      highlights: [
        "Formulated for acne-prone skin",
        "Paired with diet and routine guidance",
        "Suitability reviewed with current medication",
        "Clear usage guidance at dispense"
      ],
      usage:
        "Use as directed, usually on a clean, dry skin. Do not apply to broken or infected skin. Consistency matters more than quantity.",
      disclaimer:
        "Supportive care for acne-prone skin. It is not a cure for acne and does not replace dermatological treatment. Severe or painful acne needs a dermatologist's assessment.",
      image: { src: "/images/products/pimple-drops.jpg", alt: "Pimple Drops — clinic product display" },
      gallery: [{ src: "/images/products/pimple-drops.jpg", alt: "Pimple Drops — clinic product display" }]
    },
    {
      slug: "child-fertility-support",
      name: "Child Fertility Support",
      price: "",
      tag: "Clinic product",
      category: "Clinic product",
      text: "A classical preparation dispensed only after a full assessment of both partners. It supports general wellbeing and does not treat infertility.",
      details:
        "A classical preparation dispensed only after a detailed consultation with both partners. Fertility concerns are sensitive and multifactorial, so the physician reviews your medical history, cycle and routine, checks for correctable factors, and advises on the investigations that matter — while this preparation supports general nourishment and balance.",
      highlights: [
        "Prescribed only after a joint consultation",
        "Supports general nourishment and balance",
        "Paired with practical routine guidance",
        "Not a substitute for fertility investigation"
      ],
      usage:
        "Use only as advised after consultation. Both partners should mention any current medication or existing medical condition.",
      disclaimer:
        "This preparation does not treat infertility and cannot be relied on to achieve pregnancy. Infertility requires proper investigation by a qualified doctor, and no preparation should be used in place of that assessment.",
      image: { src: "/images/products/child-fertility-product.jpg", alt: "Child fertility support preparation — clinic product display" },
      gallery: [{ src: "/images/products/child-fertility-product.jpg", alt: "Child fertility support preparation — clinic product display" }]
    },
    {
      slug: "ayurvedic-hair-oil",
      name: "Ayurvedic Hair Oil",
      price: "",
      tag: "Clinic product",
      category: "External preparation",
      text: "A classical oil preparation for scalp and hair care, dispensed with massage and routine guidance.",
      details:
        "A classical herbal oil prepared for external use on the scalp and hair. Scalp health is closely linked to digestion, sleep and stress, so the oil is recommended alongside simple routine guidance rather than used as a standalone answer to hair fall.",
      highlights: [
        "For external use on scalp and hair",
        "Application and massage guidance provided",
        "Paired with diet and routine advice",
        "Reviewed alongside any current medication"
      ],
      usage:
        "Apply to the scalp as directed and massage gently. Wash after the advised interval. Avoid contact with eyes; rinse immediately if contact occurs.",
      disclaimer:
        "A hair and scalp care preparation. It does not treat androgenetic hair loss, alopecia or any underlying disease, and it cannot restore hair lost to an established medical condition.",
      image: { src: "/images/products/ayurvedic-hair-oil.jpg", alt: "Ayurvedic Hair Oil — clinic product display" },
      gallery: [{ src: "/images/products/ayurvedic-hair-oil.jpg", alt: "Ayurvedic Hair Oil — clinic product display" }]
    },
    {
      slug: "ayurvedic-eye-drops",
      name: "Ayurvedic Eye Drops",
      price: "",
      tag: "Clinic product",
      category: "Herbal drops",
      text: "A classical eye preparation dispensed only after an eye assessment, with strict usage guidance.",
      details:
        "A classical eye preparation dispensed by the clinic only after an assessment of the eyes and the complaint. Because the eye is a delicate organ, this preparation is given with clear guidance on duration, frequency and hygiene — and only where the physician judges it appropriate.",
      highlights: [
        "Dispensed only after an eye assessment",
        "Clear hygiene and duration guidance",
        "Used alongside any prescribed eye treatment",
        "Not shared between patients"
      ],
      usage:
        "Use only as advised, with clean hands and the dropper tip not touching the eye. Discard and seek advice if the eyes become red, painful or vision changes.",
      disclaimer:
        "Not a cure for eye disease and not a substitute for an ophthalmologist's assessment. Eye pain, sudden vision change or continuous redness needs urgent medical review.",
      image: { src: "/images/products/ayurvedic-eye-drops.jpg", alt: "Ayurvedic Eye Drops — clinic product display" },
      gallery: [{ src: "/images/products/ayurvedic-eye-drops.jpg", alt: "Ayurvedic Eye Drops — clinic product display" }]
    },
    {
      slug: "liver-care",
      name: "Liver Care",
      price: "",
      tag: "Clinic product",
      category: "Clinic product",
      text: "A classical herbal preparation dispensed as supportive care with clear dietary and lifestyle guidance.",
      details:
        "A classical herbal preparation dispensed as supportive care. Liver complaints are assessed medically before any Ayurvedic plan is set, and this preparation is used alongside that care together with practical guidance on diet, alcohol, sleep and routine.",
      highlights: [
        "Supportive care alongside medical management",
        "Paired with diet and routine guidance",
        "Dose and duration decided by the physician",
        "Reviewed against current medication"
      ],
      usage:
        "Use as directed. If you have an existing liver condition or take regular medication, tell the physician before starting.",
      disclaimer:
        "Not a treatment for liver disease. Liver problems require medical assessment and continued prescribed care; this preparation must not be used in place of that treatment.",
      image: { src: "/images/products/liver-care.jpg", alt: "Liver Care — clinic product display" },
      gallery: [{ src: "/images/products/liver-care.jpg", alt: "Liver Care — clinic product display" }]
    },
    {
      slug: "anti-alcohol-powder",
      name: "Anti Alcohol Powder",
      price: "",
      tag: "Clinic product",
      category: "Clinic product",
      text: "A classical powder dispensed as part of a supervised plan that includes practical support for reducing alcohol intake.",
      details:
        "A classical powder dispensed as part of a supervised plan for reducing alcohol intake. Alcohol withdrawal is a medical matter, so the physician reviews your health, assesses dependence and discusses safe reduction with you — and refers for medical or addiction support where it is needed.",
      highlights: [
        "Part of a supervised reduction plan",
        "Dependence and health reviewed first",
        "Paired with practical and referral support",
        "Not for unsupervised use"
      ],
      usage:
        "Use only as advised. Seek immediate medical help if you experience shaking, sweating, confusion, seizures or hallucinations — these can be signs of withdrawal needing hospital care.",
      disclaimer:
        "A supportive preparation, not a treatment for alcohol dependence or withdrawal. Do not stop heavy alcohol use abruptly without medical advice, and do not use this product without consultation.",
      image: { src: "/images/products/anti-alcohol-powder.jpg", alt: "Anti Alcohol Powder — clinic product display" },
      gallery: [{ src: "/images/products/anti-alcohol-powder.jpg", alt: "Anti Alcohol Powder — clinic product display" }]
    }
  ]
};

/* --------------------------------------------------------------------------
   Diseases we specialise in — educational content only.
   Each entry describes a condition in general terms, the features people
   commonly notice, and how classical Ayurveda approaches it as SUPPORTIVE
   care. Nothing here claims a cure, guarantees a result, or replaces
   diagnosis or prescribed treatment. The physician decides at consultation
   whether Ayurvedic management is appropriate for a given patient.
   -------------------------------------------------------------------------- */

export const diseases = {
  label: "Diseases We Specialise In",
  title: "Conditions we support,",
  titleAccent: "with honest expectations.",
  desc: "An educational overview of the conditions we see most often, how classical Ayurveda approaches them, and what supportive care looks like alongside your doctor's treatment.",
  note:
    "This information is educational and does not replace a medical consultation or diagnosis. Ayurveda is used as supportive care and never in place of prescribed treatment. Please do not stop or alter any medication on your own.",
  categories: [
    "All",
    "Respiratory",
    "Skin & Scalp",
    "Digestive",
    "Metabolic",
    "Musculoskeletal",
    "Urinary",
    "Vascular",
    "Reproductive"
  ],
  items: [
    {
      slug: "asthma",
      name: "Asthma",
      category: "Respiratory",
      summary:
        "A long-term condition in which the airways narrow and become inflamed, making breathing harder. Ayurveda approaches it as supportive care alongside the inhalers and other medicines your doctor has prescribed.",
      symptoms: [
        "Breathlessness, especially after activity or at night",
        "A persistent cough, sometimes worse at night or early morning",
        "Wheezing, chest tightness and reduced exercise tolerance",
        "Symptoms that come and go in episodes"
      ],
      approach:
        "Classical management looks at the balance of the respiratory tract, digestion and daily routine together. The physician reviews your medicines and trigger patterns, then advises on breathing-friendly routine, warm nourishing diet where appropriate, and specific classical preparations selected for your constitution. Where lung function is significantly affected, we work alongside your treating physician rather than instead of them.",
      lifestyle: [
        "Keep warm and avoid dust, smoke and strong fragrance",
        "Steam inhalation and gentle pranayama as advised",
        "Regular light activity rather than sudden exertion",
        "Frequent warm fluids and easily digestible meals"
      ],
      disclaimer:
        "Asthma is a serious condition that requires medical care and usually daily medication. Never stop inhalers or other prescribed medicines because of any Ayurvedic advice.",
      image: { src: "/images/diseases/asthma.jpg", alt: "Illustration of the lungs used to represent asthma" },
      credit: "Asthma (Lungs) by BruceBlaus, CC BY-SA 4.0, via Wikimedia Commons"
    },
    {
      slug: "cough-and-cold",
      name: "Cough & Cold",
      category: "Respiratory",
      summary:
        "A common seasonal illness with cough, runny or blocked nose, sore throat and mild tiredness. Most cases settle naturally, and Ayurvedic care focuses on comfort, recovery and preventing complications.",
      symptoms: [
        "Cough, dry or with phlegm, worse at night",
        "Blocked or runny nose and sneezing",
        "Sore throat, mild hoarseness or body ache",
        "Low fever and tiredness, usually settling within days"
      ],
      approach:
        "Ayurveda describes cough and cold as conditions of Kapha and Vata imbalance, and manages them mainly through warmth, light nourishment, rest and simple classical preparations for the throat and respiratory tract. The physician also checks for anything more serious — persistent cough, breathlessness or fever lasting more than a few days needs medical evaluation.",
      lifestyle: [
        "Rest, warmth and plenty of warm fluids",
        "Light, easily digestible meals; avoid heavy and oily food",
        "Steam inhalation and honey-based soothing measures",
        "Avoid cold drinks and direct draughts"
      ],
      disclaimer:
        "Seek medical advice for breathlessness, chest pain, coughing blood, high or persistent fever, or symptoms lasting beyond about two weeks.",
      image: { src: "/images/diseases/cough-and-cold.jpg", alt: "Illustration of the human respiratory system used to represent cough and cold" },
      credit: "Respiratory System (Illustration) by BruceBlaus, CC BY-SA 4.0, via Wikimedia Commons"
    },
    {
      slug: "sinusitis",
      name: "Sinusitis",
      category: "Respiratory",
      summary:
        "Inflammation of the air-filled cavities around the nose and eyes, usually after an infection, causing facial pressure and congestion. Ayurveda offers supportive care alongside prescribed treatment.",
      symptoms: [
        "Facial pain or pressure, especially over the cheeks, forehead or eyes",
        "Blocked nose with thick discharge, often one-sided",
        "Reduced sense of smell and a feeling of fullness in the face",
        "Cough worse at night and post-nasal drip"
      ],
      approach:
        "Classical care focuses on clearing the nasal passages, easing congestion and supporting the immune response through steam, nasal therapies such as Nasya where appropriate, and herbal preparations chosen for the individual's pattern. Long-standing or recurrent sinusitis needs ENT assessment, and the physician will say so if that is required.",
      lifestyle: [
        "Steam inhalation two to three times daily",
        "Warm salty-water nasal rinse if advised",
        "Avoid dust, pollution and cold draughts",
        "Warm nourishing meals and adequate hydration"
      ],
      disclaimer:
        "This is supportive care. Antibiotics and other prescribed treatment should be continued as directed by your doctor, and severe pain, swelling around the eye or visual change needs urgent review.",
      image: { src: "/images/diseases/sinusitis.jpg", alt: "Illustration of the sinuses used to represent sinusitis" },
      credit: "Blausen 0800 Sinusitis by Blausen Medical Communications, CC BY 3.0, via Wikimedia Commons"
    },
    {
      slug: "piles-and-fistula",
      name: "Piles & Fistula",
      category: "Digestive",
      summary:
        "Swollen veins in the anal area (piles or haemorrhoids) and abnormal tunnels that sometimes form near the anus (fistula). Ayurveda offers classical management alongside surgical care where it is required.",
      symptoms: [
        "Bright red blood after passing stool",
        "Itching, irritation or soreness around the anus",
        "A soft lump that may come and go",
        "Pain, discharge or recurring swelling in the case of a fistula"
      ],
      approach:
        "Classical management concentrates on digestion, stool consistency and local care — dietary and lifestyle measures to avoid straining, sitz-style care, and specific herbal preparations for the condition. A fistula, in particular, usually needs surgical assessment; Ayurveda is used to support healing and comfort around that care, not to replace it.",
      lifestyle: [
        "High-fibre diet with plenty of water to keep stool soft",
        "Avoid straining and prolonged sitting on the toilet",
        "Gentle local hygiene and warm sitz baths",
        "Regular activity to support digestion"
      ],
      disclaimer:
        "Persistent bleeding, severe pain, fever or discharge needs prompt medical assessment. Do not rely on any preparation instead of a surgeon's or gastroenterologist's review.",
      image: { src: "/images/diseases/piles-and-fistula.jpg", alt: "Illustration of haemorrhoids used to represent piles and fistula" },
      credit: "Blausen 0408 Hemorrhoids by Blausen Medical Communications, CC BY 3.0, via Wikimedia Commons"
    },
    {
      slug: "gastric-ulcer",
      name: "Gastric Ulcer",
      category: "Digestive",
      summary:
        "An open sore in the lining of the stomach, commonly linked to Helicobacter pylori infection or anti-inflammatory medicines. Ayurveda is used as supportive care while your doctor treats the cause.",
      symptoms: [
        "Burning pain in the upper abdomen, often related to meals",
        "Feeling full soon after eating, with bloating or nausea",
        "Indigestion, reflux or heartburn",
        "In some cases dark stools or vomiting blood — a medical emergency"
      ],
      approach:
        "Classical care supports the digestive fire (Agni) with a calm, easily digestible routine, regular meal timing, and specific herbal preparations selected for the pattern. The physician always reviews medicines, because anti-inflammatory painkillers and anti-acid treatment are frequently involved and must continue as prescribed.",
      lifestyle: [
        "Small, regular meals at consistent times",
        "Avoid alcohol, tobacco, very spicy and fried food",
        "Avoid long gaps and late-night eating",
        "Rest well, manage stress and eat your largest meal earlier in the day"
      ],
      disclaimer:
        "Vomiting blood, black stools, sudden severe abdominal pain or unexplained weight loss need emergency medical care. Do not stop prescribed ulcer medication.",
      image: { src: "/images/diseases/gastric-ulcer.jpg", alt: "Illustration of a gastric ulcer in the stomach lining" },
      credit: "Gastric Ulcer by BruceBlaus, CC BY-SA 4.0, via Wikimedia Commons"
    },
    {
      slug: "diabetes-mellitus",
      name: "Diabetes Mellitus",
      category: "Metabolic",
      summary:
        "A condition where blood glucose stays higher than it should, managed with medicines, diet and monitoring. Ayurveda focuses on daily balance and works strictly alongside your treating physician.",
      symptoms: [
        "Increased thirst and frequent urination",
        "Unexplained tiredness and blurred vision",
        "Slow-healing cuts, sores or frequent infections",
        "Tingling or numbness in the hands and feet"
      ],
      approach:
        "Ayurveda considers diabetes a metabolic and lifestyle disorder involving digestion, tissue quality and routine. The physician reviews your blood sugar readings, medicines, diet and activity, then advises on a classical dietary and daily routine, appropriate preparations, and practices such as light, regular movement. Your HbA1c, medication and monitoring stay with your physician — they are never replaced.",
      lifestyle: [
        "Consistent meal timing with a balanced, lower-refined-carbohydrate plate",
        "Regular activity matched to your doctor's advice",
        "Daily monitoring of blood sugar as prescribed",
        "Sleep, stress management and avoidance of tobacco"
      ],
      disclaimer:
        "Never stop or reduce diabetes medication without your doctor's instruction. Ayurvedic care here is supportive; glucose control and complication screening must stay with your medical team.",
      image: { src: "/images/diseases/diabetes-mellitus.jpg", alt: "Illustration of the pancreas used to represent diabetes mellitus" },
      credit: "Blausen 0308 Diabetes Type 1 by Blausen Medical Communications, CC BY 3.0, via Wikimedia Commons"
    },
    {
      slug: "infertility",
      name: "Infertility",
      category: "Reproductive",
      summary:
        "Difficulty conceiving after a year of regular unprotected intercourse (or six months for women over 35). It is a medical investigation, not a single condition — and Ayurveda is used as supportive care only.",
      symptoms: [
        "No conception after a year of regular unprotected intercourse",
        "Irregular or absent periods, or unusually light or heavy bleeding",
        "Changes in libido, erectile difficulty or painful intercourse",
        "A history of pelvic infection, surgery or injury"
      ],
      approach:
        "Before any Ayurvedic plan, the physician strongly recommends investigation by a qualified doctor, since treatable causes — thyroid, PCOS, semen factors, tubal patency — need medical attention and some need timed intervention. Ayurvedic care then focuses on general nourishment, cycle regularity where relevant, stress and routine, and classical preparations chosen for both partners.",
      lifestyle: [
        "Regular sleep and a routine that supports both partners",
        "Balanced nourishing diet with adequate fats and micronutrients",
        "Manage stress together and avoid excessive heat exposure",
        "Moderate, consistent activity rather than intense training"
      ],
      disclaimer:
        "Ayurvedic preparations do not treat infertility and cannot be relied on to achieve pregnancy. Please complete the recommended medical investigations first and continue any fertility treatment you have been given.",
      image: { src: "/images/diseases/infertility.jpg", alt: "Illustration of the female reproductive system used to represent infertility" },
      credit: "Female reproductive anatomy by Bonnie Urquhart Gruenberg, CC BY-SA 4.0, via Wikimedia Commons"
    },
    {
      slug: "hair-fall",
      name: "Hair Fall",
      category: "Skin & Scalp",
      summary:
        "Increased shedding or thinning of hair, often linked to stress, nutritional gaps, hormonal change or scalp conditions. Ayurveda addresses the causes it can influence and checks for the ones it cannot.",
      symptoms: [
        "More hair in the comb, brush or on the pillow",
        "Visible thinning at the crown or parting",
        "Scalp itching, flaking or tenderness",
        "Hair that feels brittle, dry or breaks easily"
      ],
      approach:
        "Classical management looks at the scalp, digestion, sleep and stress as one picture. The physician checks diet for protein, iron and vitamin D adequacy, reviews thyroid and other causes with your doctor, and recommends scalp oiling, gentle hair care and specific preparations for your constitution — while being clear when a dermatologist's assessment is the right next step.",
      lifestyle: [
        "Adequate protein, iron and vitamins through daily meals",
        "Gentle scalp oiling and regular washing as advised",
        "Avoid tight styles, heat and chemical treatments",
        "Adequate sleep and stress management"
      ],
      disclaimer:
        "Sudden or patchy hair loss, hair loss with scalp scarring or redness, or shedding with other symptoms needs a dermatologist's assessment. Do not start strong supplements or medicines without medical advice.",
      image: { src: "/images/diseases/hair-fall.jpg", alt: "Diagram of the hair follicle used to represent hair fall" },
      credit: "Schematic representations of the anatomy of the hair follicle by Cuevas-Diaz Duran et al., CC BY 4.0, via Wikimedia Commons"
    },
    {
      slug: "dandruff",
      name: "Dandruff",
      category: "Skin & Scalp",
      summary:
        "Flaking of the scalp with itching, often caused by a yeast overgrowth, sebum change or irritation. It is common and treatable, though recurrent cases deserve a proper look.",
      symptoms: [
        "White or yellowish flakes on the scalp and in the hair",
        "Itching, especially after washing",
        "An oily or dry scalp that flakes easily",
        "Sometimes redness or tenderness where scratching occurs"
      ],
      approach:
        "Ayurveda relates dandruff to scalp dryness, excess oily secretion and ama accumulation. The physician advises a cleansing and oiling routine matched to your scalp type, dietary and routine corrections, and classical preparations for scalp health. Where flaking is severe, itchy or spreading, a dermatologist's opinion is recommended.",
      lifestyle: [
        "Regular gentle washing with a suitable cleanser",
        "Avoid scratching and harsh chemical products",
        "Reduce excess oil, sugar and refined foods in the diet",
        "Manage stress and keep the scalp dry after washing"
      ],
      disclaimer:
        "Supportive scalp care only. Persistent, severe or infected dandruff — and any hair loss with it — needs a dermatologist's assessment and medical treatment.",
      image: { src: "/images/diseases/dandruff.jpg", alt: "Illustration of types of dandruff and scalp conditions" },
      credit: "Different types of Dandruff, Seborrhea & Different Scalp Conditions by Click2pharmacy.co.uk Images, CC BY 2.0, via Wikimedia Commons"
    },
    {
      slug: "leucoderma",
      name: "Leucoderma (Vitiligo)",
      category: "Skin & Scalp",
      summary:
        "A condition in which areas of skin lose pigment and become white or pale. It is not contagious and not caused by anything a person has done.",
      symptoms: [
        "Pale or white patches of skin with a clear or soft edge",
        "Patches that may spread slowly or remain stable",
        "Occasional itching or burning in the affected area",
        "Changes in hair colour within the patch"
      ],
      approach:
        "Ayurveda views pigment change as a condition involving skin, blood and bile (Pitta). Classical management supports the skin with specific oil-based therapies, dietary and routine corrections, and herbal preparations, alongside the topical and phototherapy care your dermatologist recommends. Progress is usually gradual and the physician will be honest about the timeline.",
      lifestyle: [
        "Protect the affected skin from sun and avoid sunburn",
        "Avoid chemical bleaching and harsh skin products",
        "Support the skin with nourishing diet and adequate hydration",
        "Manage stress, which can affect the course of the condition"
      ],
      disclaimer:
        "Ayurvedic care here is supportive and cannot reverse pigment loss on its own. Continue any dermatologist-prescribed treatment, including phototherapy, without interruption.",
      image: { src: "/images/diseases/leucoderma.jpg", alt: "Illustration of vitiligo affecting the skin" },
      credit: "Vitiligo by Osidor, CC BY-SA 4.0, via Wikimedia Commons"
    },
    {
      slug: "psoriasis",
      name: "Psoriasis",
      category: "Skin & Scalp",
      summary:
        "A chronic immune-mediated condition that causes red, scaly plaques on the skin, commonly on elbows, knees and scalp. Ayurveda offers supportive care alongside dermatological treatment.",
      symptoms: [
        "Red patches of skin covered with silvery or white scales",
        "Itching, burning or soreness, sometimes with bleeding",
        "Dry, cracked skin that bleeds on contact",
        "Nail changes and joint involvement in some people"
      ],
      approach:
        "Classical management concentrates on skin comfort, scaling control and detoxification, using medicated oils, classical preparations and dietary correction. Because psoriasis is immune-mediated and can affect joints and general health, the physician works alongside your dermatologist and rheumatologist and will always say when a preparation is supportive only.",
      lifestyle: [
        "Daily moisturising with a plain, fragrance-free emollient",
        "Avoid skin trauma, harsh soaps and very hot bathing",
        "Anti-inflammatory, simple diet with less alcohol and tobacco",
        "Stress management and regular, moderate activity"
      ],
      disclaimer:
        "Supportive care only. Continue prescribed topical steroids, biologics or other dermatological treatment, and report joint pain or swelling promptly.",
      image: { src: "/images/diseases/psoriasis.jpg", alt: "Photograph of an arm affected by plaque psoriasis" },
      credit: "An Arm Covered With Plaque Type Psoriasis by MediaJet, CC BY-SA 3.0, via Wikimedia Commons"
    },
    {
      slug: "eczema",
      name: "Eczema (Dermatitis)",
      category: "Skin & Scalp",
      summary:
        "Inflamed, dry, itchy skin that may blister, crack or thicken. It often flares with heat, stress, fragrance or irritants, and needs a plan that addresses both the skin and the trigger.",
      symptoms: [
        "Dry, rough, itchy patches of skin",
        "Redness, swelling and small blisters that may weep",
        "Thickened, cracked skin from repeated scratching",
        "Flares triggered by heat, stress, soaps or clothing"
      ],
      approach:
        "Ayurveda addresses eczema as a skin and rasa disorder, managing it with external oils and classical preparations, cooling and soothing measures, and dietary correction aimed at the individual pattern. The physician also reviews hygiene, clothing, stress and any medicines that may be irritating the skin.",
      lifestyle: [
        "Gentle, fragrance-free cleanser and lukewarm bathing",
        "Frequent moisturising, including immediately after bathing",
        "Loose cotton clothing and avoidance of known irritants",
        "Reduce heat, sweating and scratching"
      ],
      disclaimer:
        "Supportive skin care. Widespread, weeping or infected eczema needs a dermatologist, and prescribed steroid or emollient treatment should be continued as directed.",
      image: { src: "/images/diseases/eczema.jpg", alt: "Illustration of eczema showing redness, blisters and flaking" },
      credit: "Eczema by BruceBlaus, CC BY-SA 4.0, via Wikimedia Commons"
    },
    {
      slug: "kidney-stone",
      name: "Kidney Stone",
      category: "Urinary",
      summary:
        "Hard deposits that form in the kidneys and cause pain when they move. It needs medical assessment and imaging; Ayurvedic care focuses on comfort, hydration and reducing the risk of recurrence.",
      symptoms: [
        "Sudden severe pain in the side or back, coming in waves",
        "Pain radiating to the lower abdomen or groin",
        "Blood in the urine, sometimes with nausea and vomiting",
        "Restlessness and inability to lie still during the pain"
      ],
      approach:
        "The physician always arranges proper medical assessment and imaging for a suspected stone before any Ayurvedic plan. Alongside that care, classical management focuses on comfort during recovery, adequate hydration, dietary guidance on calcium, oxalate and salt, and specific preparations to support urinary tract comfort — and reducing the chance of recurrence.",
      lifestyle: [
        "Plenty of water through the day unless fluid restriction is advised",
        "Limit salt, packaged food and excess animal protein",
        "Normalise calcium intake through food rather than supplements alone",
        "Do not hold urine — empty the bladder regularly"
      ],
      disclaimer:
        "Stone pain with fever, chills, vomiting, inability to pass urine or a single kidney needs emergency care. Do not rely on any preparation instead of urological assessment.",
      image: { src: "/images/diseases/kidney-stone.jpg", alt: "Radiograph-style image of a kidney stone" },
      credit: "Nefrolit by Robert R. Wal, public domain, via Wikimedia Commons"
    },
    {
      slug: "rheumatoid-arthritis",
      name: "Rheumatoid Arthritis",
      category: "Musculoskeletal",
      summary:
        "An autoimmune condition in which the lining of the joints becomes inflamed, causing pain, swelling and stiffness. Ayurvedic care is supportive and works with rheumatology treatment.",
      symptoms: [
        "Painful, swollen and stiff joints, often in both hands",
        "Morning stiffness lasting more than an hour",
        "Tender, warm joints and reduced grip strength",
        "Tiredness and, later, involvement of other organs"
      ],
      approach:
        "Classical care focuses on easing joint stiffness and pain, improving circulation around affected joints, and restoring sleep and routine, using medicated oil therapies (Abhyanga with Swedana), classical preparations and dietary guidance. The physician is explicit that this complements, and never replaces, disease-modifying treatment from a rheumatologist.",
      lifestyle: [
        "Gentle daily movement and range-of-motion exercises as advised",
        "Warm oil massage before movement, avoiding acute swollen joints",
        "Anti-inflammatory, simple diet with adequate vitamin D and calcium",
        "Adequate rest, joint protection and pacing of activity"
      ],
      disclaimer:
        "Rheumatoid arthritis needs rheumatology care. Do not stop disease-modifying medicines. A hot, red, acutely swollen joint with fever needs urgent assessment for infection.",
      image: { src: "/images/diseases/rheumatoid-arthritis.jpg", alt: "Historical illustration of inflammation of the synovial membrane of the knee joint" },
      credit: "Acute inflammation of the synovial membrane of the knee joint by Andrew Melville McWhinnie, CC BY 4.0, via Wikimedia Commons"
    },
    {
      slug: "osteoarthritis",
      name: "Osteoarthritis",
      category: "Musculoskeletal",
      summary:
        "Wear-and-tear changes in joint cartilage, most often affecting the knees, hips or spine, causing pain that builds with use and eases with rest.",
      symptoms: [
        "Joint pain that increases with activity and eases with rest",
        "Brief morning stiffness, usually under half an hour",
        "Reduced range of movement and creaking in the joint",
        "Hardening of small bone joints at the fingers"
      ],
      approach:
        "Ayurvedic management for osteoarthritis centres on oil therapies to reduce stiffness, gentle strengthening, weight and posture guidance, and classical preparations selected for the pattern. Pain relief from Ayurvedic care is supportive; structural joint changes need orthopaedic assessment, and any worsening is referred on.",
      lifestyle: [
        "Low-impact activity such as walking or swimming, as tolerated",
        "Oil massage and gentle stretching each morning",
        "Healthy weight management to reduce load on the joints",
        "Simple anti-inflammatory dietary pattern"
      ],
      disclaimer:
        "Supportive pain and mobility care. A hot swollen joint, fever, or joint that suddenly gives way needs urgent medical review, and prescribed joint protection should continue.",
      image: { src: "/images/diseases/osteoarthritis.jpg", alt: "Illustration comparing a normal knee with an osteoarthritic knee" },
      credit: "Osteoarthritis by BruceBlaus, CC BY-SA 4.0, via Wikimedia Commons"
    },
    {
      slug: "cervical-spondylosis",
      name: "Cervical Spondylosis",
      category: "Musculoskeletal",
      summary:
        "Age-related wear of the discs and joints of the neck, often causing neck pain, stiffness and sometimes pain that travels into the arm.",
      symptoms: [
        "Neck pain and stiffness, worse after long desk work",
        "Pain radiating into the shoulder, arm or between the shoulder blades",
        "Tingling or numbness in the fingers",
        "Headache starting at the back of the neck, sometimes dizziness"
      ],
      approach:
        "Classical care for cervical spondylosis combines oil therapies and fomentation to ease stiffness, gentle neck and shoulder movements, posture correction, and classical preparations for the involved tissues. The physician checks for neurological involvement and will refer for imaging or specialist review when strength loss, persistent numbness or severe symptoms are present.",
      lifestyle: [
        "Neutral neck posture and screen height adjusted to eye level",
        "Short, frequent breaks from prolonged desk work",
        "Gentle neck strengthening and warm oil massage",
        "Pillow height adjusted for sleeping position"
      ],
      disclaimer:
        "Weakness in an arm, persistent numbness, difficulty walking, loss of bladder or bowel control, or severe neck pain after injury needs urgent medical assessment.",
      image: { src: "/images/diseases/cervical-spondylosis.jpg", alt: "Anatomical illustration of the cervical vertebrae" },
      credit: "723 Cervical Vertebrae by OpenStax College, CC BY 3.0, via Wikimedia Commons"
    },
    {
      slug: "lumbar-spondylosis",
      name: "Lumbar Spondylosis",
      category: "Musculoskeletal",
      summary:
        "Age-related changes in the lower back discs and facet joints, a common cause of lower back ache and stiffness, particularly in the mornings.",
      symptoms: [
        "Lower back ache and stiffness, worse in the mornings",
        "Pain aggravated by prolonged standing or lifting",
        "Muscle tightness in the lower back and buttocks",
        "Occasionally pain down the leg with nerve irritation"
      ],
      approach:
        "Ayurvedic management focuses on reducing stiffness, easing muscular spasm and strengthening the surrounding muscles through medicated oil therapies, gentle stretches, and classical preparations. The physician also corrects posture, lifting technique and daily loading patterns, and refers on for imaging when nerve symptoms or persistent pain warrant it.",
      lifestyle: [
        "Gentle daily stretching and core strengthening as advised",
        "Warm oil massage before activity in the morning",
        "Avoid prolonged sitting and heavy lifting without technique",
        "Supportive footwear and a firm, flat sleeping surface"
      ],
      disclaimer:
        "Back pain with numbness around the groin, difficulty passing urine, loss of bladder or bowel control, fever or severe night pain needs emergency care.",
      image: { src: "/images/diseases/lumbar-spondylosis.jpg", alt: "Anatomical illustration of the lumbar vertebrae" },
      credit: "Lumbar vertebrae anterior by Anatomography, CC BY-SA 2.1 JP, via Wikimedia Commons"
    },
    {
      slug: "varicose-veins",
      name: "Varicose Veins",
      category: "Vascular",
      summary:
        "Enlarged, twisted veins most often in the legs, caused by weakened vein valves. They are often cosmetic, but aching, swelling or skin changes need assessment.",
      symptoms: [
        "Raised, twisted or bulging veins, often in the calf or thigh",
        "Aching, heaviness or throbbing in the legs, worse by evening",
        "Swelling, especially after standing for long periods",
        "Dry, discoloured or itchy skin over the affected vein"
      ],
      approach:
        "Classical care supports vein health through circulation-promoting therapies, external oil applications, dietary and routine corrections, and specific preparations. The physician also reviews weight, activity and compression needs, and refers for vascular assessment where the veins are painful, ulcerated or the skin is changing.",
      lifestyle: [
        "Regular walking and calf-muscle exercise",
        "Elevate the legs when resting and avoid long periods standing",
        "Graduated compression stockings as advised",
        "Limit prolonged sitting and crossed legs"
      ],
      disclaimer:
        "Supportive care only. Sudden swelling or pain in one leg, a hot red tender vein, or a non-healing ulcer needs urgent medical assessment.",
      image: { src: "/images/diseases/varicose-veins.jpg", alt: "Illustration of varicose veins and normal vein valves" },
      credit: "Blausen 0891 VaricoseVein by Blausen Medical Communications, CC BY 3.0, via Wikimedia Commons"
    }
  ]
};

/* --------------------------------------------------------------------------
   Image credits for the medical illustrations used on the Diseases pages.
   Every image is reused under the licence shown here, from Wikimedia Commons.
   -------------------------------------------------------------------------- */

export const credits = {
  label: "Image credits",
  note:
    "The medical illustrations on this site are reused from Wikimedia Commons under the licence shown with each image. They are general educational illustrations and are not photographs of any patient or of the clinic.",
  items: [
    { name: "Asthma (Lungs)", author: "BruceBlaus", license: "CC BY-SA 4.0" },
    { name: "Respiratory System (Illustration)", author: "BruceBlaus", license: "CC BY-SA 4.0" },
    { name: "Blausen 0800 Sinusitis", author: "Blausen Medical Communications", license: "CC BY 3.0" },
    { name: "Blausen 0408 Hemorrhoids", author: "Blausen Medical Communications", license: "CC BY 3.0" },
    { name: "Gastric Ulcer", author: "BruceBlaus", license: "CC BY-SA 4.0" },
    { name: "Blausen 0308 Diabetes Type 1", author: "Blausen Medical Communications", license: "CC BY 3.0" },
    { name: "Female reproductive anatomy", author: "Bonnie Urquhart Gruenberg", license: "CC BY-SA 4.0" },
    { name: "Schematic representations of the anatomy of the hair follicle", author: "Cuevas-Diaz Duran et al.", license: "CC BY 4.0" },
    { name: "Different types of Dandruff, Seborrhea & Different Scalp Conditions", author: "Click2pharmacy.co.uk Images", license: "CC BY 2.0" },
    { name: "Vitiligo", author: "Osidor", license: "CC BY-SA 4.0" },
    { name: "An Arm Covered With Plaque Type Psoriasis", author: "MediaJet", license: "CC BY-SA 3.0" },
    { name: "Eczema", author: "BruceBlaus", license: "CC BY-SA 4.0" },
    { name: "Nefrolit", author: "Robert R. Wal", license: "Public domain" },
    { name: "Acute inflammation of the synovial membrane of the knee joint", author: "Andrew Melville McWhinnie", license: "CC BY 4.0" },
    { name: "Osteoarthritis", author: "BruceBlaus", license: "CC BY-SA 4.0" },
    { name: "723 Cervical Vertebrae", author: "OpenStax College", license: "CC BY 3.0" },
    { name: "Lumbar vertebrae anterior", author: "Anatomography", license: "CC BY-SA 2.1 JP" },
    { name: "Blausen 0891 VaricoseVein", author: "Blausen Medical Communications", license: "CC BY 3.0" }
  ]
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

/* --------------------------------------------------------------------------
   Default content document.
   This is the bundled fallback used whenever the site is hosted statically
   (no /api/content endpoint) or before the stored document has loaded. The
   admin panel stores overrides on the server; the client merges them over
   these defaults at runtime.
   -------------------------------------------------------------------------- */

export const defaultContent = {
  clinic,
  siteSettings,
  nav,
  hero,
  strip,
  about,
  treatmentCategories,
  treatments,
  why,
  testimonialsNote,
  testimonials,
  faqs,
  contact,
  products,
  diseases,
  credits,
  intro,
  herbs,
  gallery
};
