import { z } from "zod";

export const demoFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be under 50 characters")
    .regex(/^[a-zA-Z\s-']+$/, "First name contains invalid characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be under 50 characters")
    .regex(/^[a-zA-Z\s-']+$/, "Last name contains invalid characters"),
  email: z
    .string()
    .min(1, "Work email is required")
    .email("Enter a valid work email"),
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be under 100 characters"),
  teamSize: z.string().min(1, "Select your team size"),
  jobTitle: z
    .string()
    .min(1, "Job title is required")
    .max(100, "Job title must be under 100 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+\d][\d\s\-().]{6,20}$/, "Enter a valid phone number"),
  country: z.string().min(1, "Select your country"),
  useCase: z
    .string()
    .min(1, "Select your primary use case"),
  preferredDate: z
    .string()
    .min(1, "Select a preferred date"),
  preferredTime: z
    .string()
    .min(1, "Select a preferred time"),
  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
});

export type DemoFormValues = z.infer<typeof demoFormSchema>;

export const TEAM_SIZES = [
  { value: "1", label: "Just me (1)" },
  { value: "2-5", label: "Small team (2–5)" },
  { value: "6-20", label: "Growing team (6–20)" },
  { value: "21-50", label: "Mid-size team (21–50)" },
  { value: "51-200", label: "Large team (51–200)" },
  { value: "201+", label: "Enterprise (201+)" },
] as const;

export const USE_CASES = [
  { value: "social-media-management", label: "Social Media Management" },
  { value: "content-generation", label: "AI Content Generation" },
  { value: "team-collaboration", label: "Team Collaboration & Workflows" },
  { value: "analytics-reporting", label: "Analytics & Reporting" },
  { value: "multi-location", label: "Multi-Location / Agency" },
  { value: "enterprise", label: "Enterprise / Custom Solution" },
  { value: "migration", label: "Migration from Another Tool" },
  { value: "other", label: "Other" },
] as const;

export const TIME_SLOTS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "09:30", label: "09:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "10:30", label: "10:30 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "12:30", label: "12:30 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "13:30", label: "01:30 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "14:30", label: "02:30 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "15:30", label: "03:30 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "16:30", label: "04:30 PM" },
  { value: "17:00", label: "05:00 PM" },
] as const;

export type FormState = {
  status: "idle" | "error" | "success";
  message: string;
  errors: Record<string, string>;
};

export const initialState: FormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "IE", label: "Ireland" },
  { value: "NZ", label: "New Zealand" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "UAE" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
  { value: "HK", label: "Hong Kong" },
  { value: "ID", label: "Indonesia" },
  { value: "MY", label: "Malaysia" },
  { value: "PH", label: "Philippines" },
  { value: "TH", label: "Thailand" },
  { value: "VN", label: "Vietnam" },
  { value: "ZA", label: "South Africa" },
  { value: "EG", label: "Egypt" },
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "DZ", label: "Algeria" },
  { value: "MA", label: "Morocco" },
  { value: "TN", label: "Tunisia" },
  { value: "LY", label: "Libya" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "PE", label: "Peru" },
  { value: "VE", label: "Venezuela" },
  { value: "UY", label: "Uruguay" },
  { value: "PY", label: "Paraguay" },
  { value: "BO", label: "Bolivia" },
  { value: "EC", label: "Ecuador" },
  { value: "PA", label: "Panama" },
  { value: "CR", label: "Costa Rica" },
  { value: "GT", label: "Guatemala" },
  { value: "HN", label: "Honduras" },
  { value: "NI", label: "Nicaragua" },
  { value: "SV", label: "El Salvador" },
  { value: "BZ", label: "Belize" },
  { value: "PK", label: "Pakistan" },
  { value: "other", label: "Other" },
] as const;
