import { nanoid } from "nanoid";
import type { CanvasElement } from "../types/element";
import { DEFAULT_STYLE } from "../types/element";

function el(
  type: CanvasElement["type"],
  x: number,
  y: number,
  width: number,
  height: number,
  content: string,
  overrides: Partial<CanvasElement> = {},
): CanvasElement {
  return {
    id: nanoid(8),
    type,
    x,
    y,
    width,
    height,
    content,
    style: { ...DEFAULT_STYLE },
    ...overrides,
  };
}

function h(content: string, x: number, y: number, size = 28): CanvasElement {
  return el("heading", x, y, 698, 48, content, {
    style: {
      ...DEFAULT_STYLE,
      fontSize: size,
      fontWeight: "bold",
      textAlign: "center",
    },
  });
}

function sub(content: string, x: number, y: number): CanvasElement {
  return el("subheading", x, y, 698, 32, content, {
    style: {
      ...DEFAULT_STYLE,
      fontSize: 13,
      fontWeight: "bold",
      color: "#4b5563",
    },
  });
}

function field(
  type: CanvasElement["type"],
  label: string,
  x: number,
  y: number,
  width = 320,
  height = 64,
): CanvasElement {
  return el(type, x, y, width, height, label, { label, placeholder: label });
}

function divider(x: number, y: number): CanvasElement {
  return el("field_divider", x, y, 698, 1, "", {
    style: { ...DEFAULT_STYLE, bgColor: "#e5e7eb", borderWidth: 0 },
  });
}

export interface FormTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  elements: CanvasElement[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "contact",
    name: "Contact Form",
    category: "General",
    description: "Simple contact form with name, email, and message.",
    color: "#3b82f6",
    elements: [
      h("Contact Us", 48, 48, 28),
      el(
        "paragraph",
        48,
        108,
        698,
        40,
        "Fill out the form below and we will get back to you shortly.",
        {
          style: {
            ...DEFAULT_STYLE,
            fontSize: 13,
            color: "#6b7280",
            textAlign: "center",
          },
        },
      ),
      divider(48, 164),
      field("field_name", "Full Name", 48, 188, 320, 64),
      field("field_email", "Email Address", 390, 188, 308, 64),
      field("field_phone", "Phone Number", 48, 268, 320, 64),
      el("field_dropdown", 48, 268 + 80, 698, 64, "Subject", {
        label: "Subject",
        options: ["General Inquiry", "Support", "Sales", "Partnership"],
      }),
      field("field_textarea", "Message", 48, 268 + 160, 698, 120),
    ],
  },
  {
    id: "registration",
    name: "Event Registration",
    category: "Event",
    description: "Professional event registration form.",
    color: "#8b5cf6",
    elements: [
      h("Event Registration Form", 48, 48, 26),
      el(
        "paragraph",
        48,
        104,
        698,
        36,
        "Please complete all fields to register for the event.",
        {
          style: {
            ...DEFAULT_STYLE,
            fontSize: 12,
            color: "#6b7280",
            textAlign: "center",
          },
        },
      ),
      divider(48, 152),
      sub("Personal Information", 48, 168),
      field("field_name", "First Name", 48, 200, 330, 60),
      field("field_name", "Last Name", 390, 200, 308, 60),
      field("field_email", "Email Address", 48, 276, 698, 60),
      field("field_phone", "Phone Number", 48, 352, 330, 60),
      field("field_name", "Organization / Company", 390, 352, 308, 60),
      divider(48, 428),
      sub("Event Details", 48, 444),
      el("field_dropdown", 48, 476, 698, 60, "Select Event Session", {
        label: "Event Session",
        options: [
          "Morning Session (9AM-12PM)",
          "Afternoon Session (2PM-5PM)",
          "Full Day",
        ],
      }),
      field(
        "field_checkbox",
        "I understand the event is in-person and will attend in compliance with all guidelines.",
        48,
        552,
        698,
        32,
      ),
      divider(48, 600),
      sub("Dietary Requirements", 48, 616),
      el("field_dropdown", 48, 648, 698, 60, "Dietary Preference", {
        label: "Dietary Preference",
        options: [
          "No Preference",
          "Vegetarian",
          "Vegan",
          "Gluten-Free",
          "Halal",
          "Kosher",
        ],
      }),
      divider(48, 724),
      sub("Declaration", 48, 740),
      field("field_signature", "Signature", 48, 772, 320, 80),
      field("field_date", "Date", 390, 772, 200, 80),
    ],
  },
  {
    id: "job_application",
    name: "Job Application",
    category: "HR",
    description: "Professional job application form with signature.",
    color: "#059669",
    elements: [
      el("field_image_placeholder", 48, 48, 120, 80, "Company Logo", {
        style: {
          ...DEFAULT_STYLE,
          bgColor: "#f3f4f6",
          borderColor: "#d1d5db",
          borderWidth: 1,
        },
      }),
      h("Job Application Form", 188, 64, 22),
      divider(48, 144),
      sub("Personal Details", 48, 164),
      field("field_name", "Full Name", 48, 196, 330, 60),
      field("field_date", "Date of Birth", 390, 196, 308, 60),
      field("field_email", "Email Address", 48, 272, 330, 60),
      field("field_phone", "Phone Number", 390, 272, 308, 60),
      field("field_address", "Residential Address", 48, 348, 698, 72),
      divider(48, 436),
      sub("Position Applied For", 48, 456),
      field("field_name", "Position Title", 48, 488, 698, 60),
      el("field_dropdown", 48, 564, 698, 60, "Employment Type", {
        label: "Employment Type",
        options: [
          "Full-Time",
          "Part-Time",
          "Contract",
          "Internship",
          "Freelance",
        ],
      }),
      divider(48, 640),
      sub("Experience & Qualifications", 48, 660),
      field(
        "field_textarea",
        "Brief description of relevant experience and qualifications...",
        48,
        692,
        698,
        120,
      ),
      divider(48, 828),
      sub("Declaration", 48, 848),
      el(
        "field_checkbox",
        48,
        880,
        698,
        32,
        "I declare that all information provided is true and accurate.",
        { required: true },
      ),
      field("field_signature", "Applicant Signature", 48, 924, 320, 80),
      field("field_date", "Date", 390, 924, 200, 80),
    ],
  },
  {
    id: "admission",
    name: "Student Admission",
    category: "Education",
    description: "Student admission form for schools and colleges.",
    color: "#dc2626",
    elements: [
      el("field_image_placeholder", 48, 48, 80, 80, "Logo", {
        style: {
          ...DEFAULT_STYLE,
          bgColor: "#fef2f2",
          borderColor: "#fca5a5",
          borderWidth: 1,
        },
      }),
      h("Student Admission Form", 140, 52, 22),
      el(
        "paragraph",
        140,
        88,
        606,
        36,
        "Academic Year 2025–26 | Admissions Office",
        { style: { ...DEFAULT_STYLE, fontSize: 12, color: "#6b7280" } },
      ),
      divider(48, 144),
      sub("Student Information", 48, 164),
      field("field_name", "Student Full Name", 48, 196, 698, 60),
      field("field_date", "Date of Birth", 48, 272, 330, 60),
      el("field_dropdown", 390, 272, 308, 60, "Gender", {
        label: "Gender",
        options: ["Male", "Female", "Other", "Prefer not to say"],
      }),
      field("field_address", "Residential Address", 48, 348, 698, 72),
      divider(48, 436),
      sub("Parent / Guardian Information", 48, 456),
      field("field_name", "Parent/Guardian Full Name", 48, 488, 698, 60),
      field("field_phone", "Contact Number", 48, 564, 330, 60),
      field("field_email", "Email Address", 390, 564, 308, 60),
      divider(48, 640),
      sub("Academic Information", 48, 660),
      field("field_name", "Previous School / Institution", 48, 692, 698, 60),
      el("field_dropdown", 48, 768, 698, 60, "Applying for Grade/Class", {
        label: "Grade / Class",
        options: [
          "Grade 1",
          "Grade 2",
          "Grade 3",
          "Grade 4",
          "Grade 5",
          "Grade 6",
          "Grade 7",
          "Grade 8",
          "Grade 9",
          "Grade 10",
          "Grade 11",
          "Grade 12",
        ],
      }),
      divider(48, 844),
      sub("Declaration", 48, 864),
      el(
        "field_checkbox",
        48,
        896,
        698,
        32,
        "I confirm the above information is accurate and complete.",
        { required: true },
      ),
      field("field_signature", "Parent/Guardian Signature", 48, 940, 320, 80),
      field("field_date", "Date", 390, 940, 200, 80),
    ],
  },
  {
    id: "feedback",
    name: "Feedback Form",
    category: "General",
    description: "Customer or event feedback form with ratings.",
    color: "#f59e0b",
    elements: [
      h("Feedback Form", 48, 48, 26),
      el(
        "paragraph",
        48,
        104,
        698,
        40,
        "Your feedback helps us improve. Please take a moment to share your experience.",
        {
          style: {
            ...DEFAULT_STYLE,
            fontSize: 13,
            color: "#6b7280",
            textAlign: "center",
          },
        },
      ),
      divider(48, 156),
      sub("About You", 48, 176),
      field("field_name", "Full Name (Optional)", 48, 208, 330, 60),
      field("field_email", "Email (Optional)", 390, 208, 308, 60),
      field("field_date", "Date of Visit/Event", 48, 284, 330, 60),
      divider(48, 360),
      sub("Your Experience", 48, 380),
      el("paragraph", 48, 412, 698, 24, "Overall Satisfaction:", {
        style: { ...DEFAULT_STYLE, fontSize: 13, fontWeight: "bold" },
      }),
      el("field_checkbox", 48, 440, 200, 32, "Excellent", {}),
      el("field_checkbox", 260, 440, 150, 32, "Good", {}),
      el("field_checkbox", 420, 440, 150, 32, "Average", {}),
      el("field_checkbox", 580, 440, 150, 32, "Poor", {}),
      el("paragraph", 48, 488, 698, 24, "Would you recommend us?", {
        style: { ...DEFAULT_STYLE, fontSize: 13, fontWeight: "bold" },
      }),
      el("field_checkbox", 48, 516, 200, 32, "Yes, definitely", {}),
      el("field_checkbox", 260, 516, 200, 32, "Maybe", {}),
      el("field_checkbox", 470, 516, 200, 32, "No", {}),
      divider(48, 564),
      sub("Additional Comments", 48, 584),
      field(
        "field_textarea",
        "Please share any additional comments or suggestions...",
        48,
        616,
        698,
        140,
      ),
      divider(48, 772),
      field("field_signature", "Signature", 48, 796, 280, 72),
      field("field_date", "Date", 350, 796, 200, 72),
    ],
  },
  {
    id: "blank",
    name: "Blank Form",
    category: "General",
    description: "Start from scratch with a blank A4 canvas.",
    color: "#6b7280",
    elements: [
      h("Untitled Form", 48, 48, 26),
      el("paragraph", 48, 108, 698, 36, "Form description goes here...", {
        style: {
          ...DEFAULT_STYLE,
          fontSize: 13,
          color: "#9ca3af",
          textAlign: "center",
        },
      }),
      divider(48, 160),
    ],
  },
];
