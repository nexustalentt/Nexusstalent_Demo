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
  { name: "Mercedes-Benz", mark: "MB", note: "Automotive", logo: benzAsset.url },
  { name: "Yuva Pay", mark: "YP", note: "Fintech Startup" },
  { name: "Entity Data", mark: "ED", note: "Data & Analytics" },
];

