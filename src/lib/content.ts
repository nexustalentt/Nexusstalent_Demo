export type ServiceItem = {
  slug: string;
  title: string;
  description: string;
  detail: string;
};

export const services: ServiceItem[] = [
  {
    slug: "talent-consulting",
    title: "Talent Consulting",
    description: "Helping organizations identify, attract and acquire the right talent.",
    detail:
      "Workforce planning, competency mapping and hiring strategy built around the roles that actually move your business forward.",
  },
  {
    slug: "it-consulting",
    title: "IT Consulting",
    description: "Skilled technology professionals and hands-on consulting expertise.",
    detail:
      "Architecture, delivery and modernisation support from consultants who have run the same programmes inside large enterprises.",
  },
  {
    slug: "contract-staffing",
    title: "Contract Staffing",
    description: "Flexible staffing for short-term and long-term requirements.",
    detail:
      "Compliant contract resourcing with transparent commercials, fast onboarding and full lifecycle administration.",
  },
  {
    slug: "recruitment",
    title: "Recruitment",
    description: "End-to-end recruitment and talent acquisition delivery.",
    detail:
      "Sourcing, structured assessment, offer management and joining support run as a single accountable process.",
  },
  {
    slug: "staff-augmentation",
    title: "Staff Augmentation",
    description: "Specialised professionals who strengthen your existing teams.",
    detail:
      "Embedded specialists who work inside your delivery model, your tooling and your governance from day one.",
  },
  {
    slug: "managed-services",
    title: "Managed Services",
    description: "Flexible workforce and technology solutions under one owner.",
    detail:
      "Outcome-based engagements where we own capacity, quality and reporting against agreed service levels.",
  },
];

export const industries = [
  { name: "Information Technology", note: "Product, platform and services organizations" },
  { name: "Banking & Financial Services", note: "Core banking, payments and risk" },
  { name: "Healthcare", note: "Providers, payers and life sciences" },
  { name: "Retail", note: "Omnichannel commerce and supply chain" },
  { name: "Manufacturing", note: "Plant systems, ERP and industrial engineering" },
  { name: "Telecommunications", note: "Network, OSS/BSS and customer platforms" },
  { name: "Insurance", note: "Underwriting, claims and regulated delivery" },
  { name: "Consulting", note: "Advisory firms scaling delivery capacity" },
];

export const whyChooseUs = [
  {
    title: "Experienced Professionals",
    description: "Consultants and recruiters with a decade or more inside enterprise delivery.",
  },
  {
    title: "Enterprise-Focused Solutions",
    description: "Processes built for procurement, compliance and multi-stakeholder governance.",
  },
  {
    title: "Fast Talent Deployment",
    description: "Pre-qualified talent pools that shorten time-to-offer without cutting rigour.",
  },
  {
    title: "Quality-Driven Recruitment",
    description: "Structured assessment and scorecards instead of volume CV forwarding.",
  },
  {
    title: "Industry Expertise",
    description: "Domain-specific screening across technology, finance, healthcare and industry.",
  },
  {
    title: "Long-Term Partnerships",
    description: "Most of our revenue comes from clients we have served for over three years.",
  },
];

export const hiringProcess = [
  {
    step: "01",
    title: "Explore Opportunities",
    description: "Browse current openings and shortlist the roles that match your profile.",
  },
  {
    step: "02",
    title: "Submit Application",
    description: "Apply through the role's application form — no account, no password.",
  },
  {
    step: "03",
    title: "Application Review",
    description: "Our recruiters assess your experience against the client's requirement.",
  },
  {
    step: "04",
    title: "Interview",
    description: "Structured interviews with our team and then with the client stakeholders.",
  },
  {
    step: "05",
    title: "Selection",
    description: "Offer, documentation and onboarding support through to your first day.",
  },
];

export const workModes = ["On-site", "Hybrid", "Remote"];
export const employmentTypes = ["Full Time", "Contract", "Part Time", "Internship"];
export const experienceBands = [
  { label: "0 – 2 Years", min: 0, max: 2 },
  { label: "2 – 5 Years", min: 2, max: 5 },
  { label: "5 – 8 Years", min: 5, max: 8 },
  { label: "8+ Years", min: 8, max: 99 },
];

import sapLogo from "@/assets/logos/sap.svg";
import ltiLogo from "@/assets/logos/ltimindtree.svg";
import wiproLogo from "@/assets/logos/wipro.svg";
import accentureLogo from "@/assets/logos/accenture.svg";
import capgeminiLogo from "@/assets/logos/capgemini.svg";
import benzLogo from "@/assets/logos/mercedes-benz.svg";

export type ClientLogo = {
  name: string;
  mark: string;
  note: string;
  logo?: string;
};

export const clients: ClientLogo[] = [
  { name: "SAP", mark: "SAP", note: "Enterprise Software", logo: sapLogo },
  { name: "LTIMindtree", mark: "LTI", note: "IT Services", logo: ltiLogo },
  { name: "Wipro", mark: "WP", note: "Technology Consulting", logo: wiproLogo },
  { name: "Accenture", mark: "ACN", note: "Global Consulting", logo: accentureLogo },
  { name: "Capgemini", mark: "CG", note: "Digital Engineering", logo: capgeminiLogo },
  { name: "Mercedes-Benz", mark: "MB", note: "Automotive", logo: benzLogo },
  { name: "Yuva Pay", mark: "YP", note: "Fintech Startup" },
  { name: "Entity Data", mark: "ED", note: "Data & Analytics" },
];

export type DigitalServiceItem = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  highlights: string[];
};

export const digitalServices: DigitalServiceItem[] = [
  {
    id: "business-websites",
    title: "Business Website Development",
    tagline: "High-performance & conversion-focused",
    description: "Modern, responsive websites designed specifically for small businesses to showcase offerings and attract inbound customers.",
    iconName: "Globe",
    highlights: ["Custom domain setup", "Ultra-fast load speeds", "Lead capture forms", "Analytics ready"],
  },
  {
    id: "website-design",
    title: "Website Design",
    tagline: "Clean, brand-centric UI/UX",
    description: "Clean, professional, and user-friendly designs that represent your brand and establish immediate credibility.",
    iconName: "Layout",
    highlights: ["Modern visual identity", "Intuitive navigation", "Accessible typography", "Engaging hero sections"],
  },
  {
    id: "mobile-friendly",
    title: "Mobile-Friendly Websites",
    tagline: "Flawless across all viewports",
    description: "Websites that work smoothly across phones, tablets, and desktops with zero layout friction.",
    iconName: "Smartphone",
    highlights: ["Touch-optimized controls", "Adaptive images", "App-like fluid feel", "Cross-browser tested"],
  },
  {
    id: "seo-visibility",
    title: "SEO & Online Visibility",
    tagline: "Get discovered on search engines",
    description: "Help your business improve its online presence and get discovered by local and global potential customers.",
    iconName: "Search",
    highlights: ["On-page search optimization", "Google Business ready", "Structured schema markup", "Speed optimization"],
  },
  {
    id: "growth-solutions",
    title: "Business Growth Solutions",
    tagline: "Drive enquiries and conversions",
    description: "Digital solutions focused on generating more enquiries, customers, and opportunities through automated funnels.",
    iconName: "TrendingUp",
    highlights: ["WhatsApp/Click-to-Call", "Lead notifications", "CRM & email integration", "Conversion tracking"],
  },
  {
    id: "website-maintenance",
    title: "Website Maintenance",
    tagline: "Zero downtime peace of mind",
    description: "Ongoing updates, security improvements, technical support, and content maintenance after launch.",
    iconName: "ShieldCheck",
    highlights: ["Routine backups", "Security patching", "Content updates on demand", "Priority technical help"],
  },
];

export type ProductBuildItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  deliverables: string[];
  badge: string;
};

export const builtProducts: ProductBuildItem[] = [
  {
    id: "websites",
    title: "Websites",
    subtitle: "High-impact digital front doors",
    description: "Professional business websites and conversion-focused landing pages engineered for speed, polish, and lead generation.",
    iconName: "Monitor",
    deliverables: ["Landing Pages", "Corporate Portals", "Product Showcase", "Booking Microsites"],
    badge: "Fast Launch",
  },
  {
    id: "web-apps",
    title: "Web Applications",
    subtitle: "Interactive cloud software",
    description: "Custom web applications designed around business requirements, client portals, and administrative workflows.",
    iconName: "Layers",
    deliverables: ["Customer Dashboards", "Internal Admin Tools", "SaaS MVPs", "Role-based Portals"],
    badge: "Scalable",
  },
  {
    id: "business-products",
    title: "Business Products",
    subtitle: "Turnkey digital utilities",
    description: "Digital products and tools that solve specific operational friction, automate repetitive tasks, and unlock revenue.",
    iconName: "Sparkles",
    deliverables: ["Order & Booking Systems", "Inventory Trackers", "Custom Calculators", "Automated Workflows"],
    badge: "Automation",
  },
  {
    id: "custom-solutions",
    title: "Custom Solutions",
    subtitle: "Tailored to your exact workflow",
    description: "Technology solutions built according to your unique workflow, integrating with existing tools and databases.",
    iconName: "Cpu",
    deliverables: ["API Integrations", "Database Architecture", "Legacy Modernization", "Proprietary Systems"],
    badge: "Bespoke",
  },
];

export type AudienceItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  features: string[];
  iconName: string;
  accentColor: string;
};

export const targetAudiences: AudienceItem[] = [
  {
    id: "restaurants-cafes",
    category: "Food & Hospitality",
    title: "Restaurants & Cafés",
    description: "Menus, location mapping, contact details, table reservations, and an appetizing online presence that attracts diners.",
    features: ["Interactive digital menus", "Table reservation links", "Direct calling & WhatsApp order links", "Google Maps embed & hours"],
    iconName: "Utensils",
    accentColor: "from-amber-500/10 to-orange-500/10",
  },
  {
    id: "local-businesses",
    category: "Services & Trade",
    title: "Local Businesses",
    description: "Services, transparent pricing, project gallery, contact forms, and local SEO to become the go-to provider in your area.",
    features: ["Service rate cards & catalogues", "Quote request forms", "Customer review showcases", "Neighborhood search optimization"],
    iconName: "Store",
    accentColor: "from-blue-500/10 to-cyan-500/10",
  },
  {
    id: "startups",
    category: "New Ventures & Tech",
    title: "Startups & Emerging Brands",
    description: "Professional landing pages and web apps to introduce breakthrough products, capture waitlists, and pitch to investors.",
    features: ["High-converting waitlist funnels", "Interactive product demos", "Investor-grade brand design", "Modern responsive architecture"],
    iconName: "Rocket",
    accentColor: "from-emerald-500/10 to-teal-500/10",
  },
  {
    id: "professionals",
    category: "Consultants & Creators",
    title: "Independent Professionals",
    description: "Portfolio websites, personal branding, case studies, fee structures, and streamlined client enquiry workflows.",
    features: ["Curated case studies & portfolio", "Direct calendar scheduling integration", "Credential & testimonial grids", "Client inquiry routing"],
    iconName: "Briefcase",
    accentColor: "from-indigo-500/10 to-violet-500/10",
  },
];

export const digitalProcessSteps = [
  {
    step: "01",
    name: "Understand",
    title: "Discovery & Requirements",
    description: "We dive deep into your business model, customer goals, and specific technical requirements.",
  },
  {
    step: "02",
    name: "Plan",
    title: "Strategy & Architecture",
    description: "We map out the user journeys, wireframes, sitemap, tech stack, and deliver a transparent timeline.",
  },
  {
    step: "03",
    name: "Build",
    title: "Design & Development",
    description: "Our dedicated developers and designers engineer your solution with clean code and modern aesthetics.",
  },
  {
    step: "04",
    name: "Launch",
    title: "Deployment & Optimization",
    description: "We configure custom domains, set up analytics, verify mobile responsiveness, and push live.",
  },
  {
    step: "05",
    name: "Grow",
    title: "Support & Iteration",
    description: "We provide ongoing support, security updates, and feature upgrades as your business scales.",
  },
];


