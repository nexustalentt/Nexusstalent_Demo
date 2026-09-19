export type ExtractedJobData = {
  title?: string;
  department?: string;
  location?: string;
  employment_type?: string;
  work_mode?: string;
  salary?: string;
  experience_min?: number | null;
  experience_max?: number | null;
  skills?: string[];
  short_description?: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  preferred_qualifications?: string;
  benefits?: string;
  google_form_url?: string;
  company_name?: string;
};

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "React Native", "Next.js", "Vue.js", "Angular",
  "Node.js", "Express", "Python", "Django", "FastAPI", "Java", "Spring Boot", "Kotlin",
  "C++", "C#", ".NET", "Golang", "Rust", "PHP", "Laravel", "Ruby", "Rails",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "GraphQL", "REST API",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "Terraform",
  "Linux", "Tailwind CSS", "HTML5", "CSS3", "Redux", "Jest", "Cypress", "Selenium",
  "Playwright", "Manual Testing", "Automation Testing", "Agile", "Scrum", "Jira",
  "Machine Learning", "Deep Learning", "NLP", "Pandas", "NumPy", "TensorFlow", "PyTorch",
  "Figma", "UI/UX", "System Design", "Microservices", "Data Structures", "Algorithms"
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

function htmlToCleanText(html: string): string {
  if (!html) return "";
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");

  text = decodeHtmlEntities(text);
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
}

function findJsonLdJobPosting(json: any): any | null {
  if (!json) return null;
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = findJsonLdJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof json === "object") {
    const type = json["@type"];
    if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) {
      return json;
    }
    if (json["@graph"] && Array.isArray(json["@graph"])) {
      return findJsonLdJobPosting(json["@graph"]);
    }
    for (const key of Object.keys(json)) {
      if (typeof json[key] === "object") {
        const found = findJsonLdJobPosting(json[key]);
        if (found) return found;
      }
    }
  }
  return null;
}

function normalizeEmploymentType(raw?: string): string {
  if (!raw) return "Full-time";
  const s = raw.toUpperCase();
  if (s.includes("PART") || s.includes("PART_TIME")) return "Part-time";
  if (s.includes("CONTRACT") || s.includes("FREELANCE")) return "Contract";
  if (s.includes("INTERN")) return "Internship";
  if (s.includes("TEMP")) return "Temporary";
  return "Full-time";
}

function normalizeWorkMode(raw?: string, telecommute?: boolean): string {
  if (telecommute) return "Remote";
  if (!raw) return "On-site";
  const s = raw.toLowerCase();
  if (s.includes("remote") || s.includes("telecommute") || s.includes("work from home")) return "Remote";
  if (s.includes("hybrid") || s.includes("flexible")) return "Hybrid";
  return "On-site";
}

function extractExperience(text: string): { min: number | null; max: number | null } {
  // e.g. "3-5 years", "3 to 5 years", "3 - 5 yrs"
  const rangeMatch = text.match(/(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    if (!isNaN(min) && !isNaN(max) && min <= max) {
      return { min, max };
    }
  }

  // e.g. "5+ years", "minimum 3 years", "at least 2 years"
  const singleMatch = text.match(/(?:minimum|at least|min\.?)?\s*(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i);
  if (singleMatch && singleMatch[1]) {
    const min = parseInt(singleMatch[1], 10);
    if (!isNaN(min) && min >= 0 && min <= 40) {
      return { min, max: null };
    }
  }

  return { min: null, max: null };
}

function extractSkillsFromText(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();

  for (const skill of COMMON_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(lower)) {
      found.add(skill);
    }
  }

  return Array.from(found).slice(0, 25);
}

function extractSectionContent(text: string, sectionKeywords: string[]): string {
  const lines = text.split("\n");
  const extracted: string[] = [];
  let capturing = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || "";
    const isHeading = sectionKeywords.some((kw) => {
      const reg = new RegExp(`^(?:#+\\s*)?(?:key\\s+)?${kw}(?:\\s*:|\\s*-)?$`, "i");
      return reg.test(line);
    });

    if (isHeading) {
      capturing = true;
      continue;
    }

    if (capturing) {
      // Check if another major heading starts
      const isOtherHeading = /^(?:#+\s*)?(?:requirements?|responsibilities|qualifications|benefits|what we offer|about us|who you are|skills|perks)\b/i.test(line);
      if (isOtherHeading && extracted.length > 0) {
        break;
      }
      if (line) {
        extracted.push(line.replace(/^[•\-\*]\s*/, ""));
      }
    }
  }

  return extracted.slice(0, 15).join("\n");
}

export async function extractJobDetails(url: string): Promise<ExtractedJobData> {
  const parsedUrl = new URL(url);
  const response = await fetch(parsedUrl.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch job posting (${response.status}: ${response.statusText})`);
  }

  const html = await response.text();

  let jsonLdJob: any = null;
  const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1] || "");
      const found = findJsonLdJobPosting(parsed);
      if (found) {
        jsonLdJob = found;
        break;
      }
    } catch {
      // ignore JSON parse errors in script tags
    }
  }

  // Meta tags fallback
  const getMeta = (name: string): string => {
    const reg = new RegExp(`<meta\\s+[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
    const m = html.match(reg);
    return m && m[1] ? decodeHtmlEntities(m[1].trim()) : "";
  };

  const titleMeta = getMeta("og:title") || getMeta("twitter:title");
  const descMeta = getMeta("og:description") || getMeta("description") || getMeta("twitter:description");

  // Title extraction
  let title = jsonLdJob?.title || titleMeta;
  if (!title) {
    const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleTagMatch && titleTagMatch[1]) {
      title = decodeHtmlEntities(titleTagMatch[1].trim());
      // Clean up common suffixes like " - Careers", " | Company Name"
      title = title.split(/\s*[-–|•]\s*/)[0]?.trim() || title;
    }
  }

  // Company Name
  const company =
    jsonLdJob?.hiringOrganization?.name ||
    getMeta("og:site_name") ||
    "";

  // Location
  let location = "";
  if (jsonLdJob?.jobLocation?.address) {
    const addr = jsonLdJob.jobLocation.address;
    const parts = [
      addr.addressLocality,
      addr.addressRegion,
      addr.addressCountry,
    ].filter(Boolean);
    location = parts.join(", ");
  }
  if (!location) {
    const locMeta = getMeta("job:location") || getMeta("place:location:latitude");
    if (locMeta) location = locMeta;
  }

  // Employment Type
  const rawEmploymentType =
    (Array.isArray(jsonLdJob?.employmentType)
      ? jsonLdJob.employmentType[0]
      : jsonLdJob?.employmentType) || "";
  const employment_type = normalizeEmploymentType(rawEmploymentType || html);

  // Work Mode
  const isTelecommute =
    jsonLdJob?.jobLocationType === "TELECOMMUTE" ||
    /remote/i.test(location) ||
    /telecommute/i.test(html);
  const work_mode = normalizeWorkMode(location || html, isTelecommute);

  // Full clean text of job
  const cleanBodyText = htmlToCleanText(html);
  const descriptionHtml = jsonLdJob?.description ? htmlToCleanText(jsonLdJob.description) : "";
  const fullDescription = descriptionHtml || cleanBodyText.slice(0, 4000);

  // Salary
  let salary = "";
  if (jsonLdJob?.baseSalary) {
    const bs = jsonLdJob.baseSalary;
    const currency = bs.currency || "USD";
    if (bs.value) {
      if (typeof bs.value === "object") {
        const min = bs.value.minValue;
        const max = bs.value.maxValue;
        const unit = bs.value.unitText ? ` / ${bs.value.unitText.toLowerCase()}` : "";
        if (min && max) {
          salary = `${currency} ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()}${unit}`;
        } else if (min || max) {
          salary = `${currency} ${Number(min || max).toLocaleString()}${unit}`;
        }
      } else if (typeof bs.value === "number" || typeof bs.value === "string") {
        salary = `${currency} ${bs.value}`;
      }
    }
  }
  if (!salary) {
    const salMatch = cleanBodyText.match(/(?:salary|ctc|compensation|pay|rate)[:\s]*([$₹€£][\d,kK\.\s\-–toLPA]+(?:\s*\/\s*(?:year|yr|month|hr|annum))?)/i);
    if (salMatch && salMatch[1]) {
      salary = salMatch[1].trim();
    }
  }

  // Experience
  const expSource = (jsonLdJob?.experienceRequirements ? String(jsonLdJob.experienceRequirements) : "") + " " + fullDescription;
  const { min: experience_min, max: experience_max } = extractExperience(expSource);

  // Skills
  let skills: string[] = [];
  if (Array.isArray(jsonLdJob?.skills)) {
    skills = jsonLdJob.skills.map((s: any) => String(s).trim()).filter(Boolean);
  }
  if (skills.length === 0) {
    skills = extractSkillsFromText(fullDescription);
  }

  // Sections
  const responsibilities =
    (jsonLdJob?.responsibilities ? htmlToCleanText(String(jsonLdJob.responsibilities)) : "") ||
    extractSectionContent(fullDescription, ["responsibilities", "what you'll do", "key responsibilities", "role & responsibilities", "duties"]);

  const requirements =
    (jsonLdJob?.qualifications ? htmlToCleanText(String(jsonLdJob.qualifications)) : "") ||
    extractSectionContent(fullDescription, ["requirements", "what we're looking for", "qualifications", "required skills", "must have", "basic qualifications"]);

  const preferred_qualifications = extractSectionContent(fullDescription, [
    "preferred qualifications",
    "nice to have",
    "bonus points",
    "preferred skills",
    "good to have",
  ]);

  const benefits = extractSectionContent(fullDescription, [
    "benefits",
    "what we offer",
    "perks",
    "compensation & benefits",
    "why join us",
  ]);

  const short_description = (descMeta || fullDescription.slice(0, 280)).replace(/\s+/g, " ").trim();

  return {
    title: title?.slice(0, 140) || undefined,
    company_name: company || undefined,
    department: jsonLdJob?.occupationalCategory || company || undefined,
    location: location?.slice(0, 120) || undefined,
    employment_type,
    work_mode,
    salary: salary?.slice(0, 120) || undefined,
    experience_min,
    experience_max,
    skills: skills.slice(0, 25),
    short_description: short_description ? short_description.slice(0, 300) : undefined,
    description: fullDescription.slice(0, 6000) || undefined,
    responsibilities: responsibilities ? responsibilities.slice(0, 4000) : undefined,
    requirements: requirements ? requirements.slice(0, 4000) : undefined,
    preferred_qualifications: preferred_qualifications ? preferred_qualifications.slice(0, 4000) : undefined,
    benefits: benefits ? benefits.slice(0, 4000) : undefined,
    google_form_url: url,
  };
}
