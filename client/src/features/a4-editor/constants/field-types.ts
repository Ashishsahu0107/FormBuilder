import type { ElementType } from "../types/element";

export interface FieldLibraryItem {
  type: ElementType;
  label: string;
  icon: string;
  defaultContent: string;
  defaultWidth: number;
  defaultHeight: number;
  group: string;
}

export const FIELD_LIBRARY: FieldLibraryItem[] = [
  // Layout & Text
  {
    type: "heading",
    label: "Heading",
    icon: "H1",
    defaultContent: "Form Title",
    defaultWidth: 698,
    defaultHeight: 48,
    group: "Text",
  },
  {
    type: "subheading",
    label: "Sub Heading",
    icon: "H2",
    defaultContent: "Section Title",
    defaultWidth: 698,
    defaultHeight: 36,
    group: "Text",
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: "Â¶",
    defaultContent: "Add your description here...",
    defaultWidth: 698,
    defaultHeight: 60,
    group: "Text",
  },
  {
    type: "field_divider",
    label: "Divider",
    icon: "â€”",
    defaultContent: "",
    defaultWidth: 698,
    defaultHeight: 16,
    group: "Text",
  },
  // Fields
  {
    type: "field_name",
    label: "Name",
    icon: "ðŸ‘¤",
    defaultContent: "Full Name",
    defaultWidth: 320,
    defaultHeight: 60,
    group: "Fields",
  },
  {
    type: "field_email",
    label: "Email",
    icon: "âœ‰",
    defaultContent: "Email Address",
    defaultWidth: 320,
    defaultHeight: 60,
    group: "Fields",
  },
  {
    type: "field_phone",
    label: "Phone",
    icon: "ðŸ“ž",
    defaultContent: "Phone Number",
    defaultWidth: 320,
    defaultHeight: 60,
    group: "Fields",
  },
  {
    type: "field_number",
    label: "Number",
    icon: "#",
    defaultContent: "Number",
    defaultWidth: 200,
    defaultHeight: 60,
    group: "Fields",
  },
  {
    type: "field_address",
    label: "Address",
    icon: "ðŸ“",
    defaultContent: "Address",
    defaultWidth: 698,
    defaultHeight: 80,
    group: "Fields",
  },
  {
    type: "field_date",
    label: "Date",
    icon: "ðŸ“…",
    defaultContent: "Date",
    defaultWidth: 200,
    defaultHeight: 60,
    group: "Fields",
  },
  {
    type: "field_textarea",
    label: "Text Area",
    icon: "âœ",
    defaultContent: "Message",
    defaultWidth: 698,
    defaultHeight: 100,
    group: "Fields",
  },
  {
    type: "field_checkbox",
    label: "Checkbox",
    icon: "â˜‘",
    defaultContent: "I agree to the terms and conditions",
    defaultWidth: 400,
    defaultHeight: 32,
    group: "Fields",
  },
  {
    type: "field_dropdown",
    label: "Dropdown",
    icon: "â–¼",
    defaultContent: "Select option",
    defaultWidth: 320,
    defaultHeight: 60,
    group: "Fields",
  },
  {
    type: "field_signature",
    label: "Signature",
    icon: "âœ",
    defaultContent: "Signature",
    defaultWidth: 320,
    defaultHeight: 80,
    group: "Fields",
  },
  {
    type: "field_image_placeholder",
    label: "Image / Logo",
    icon: "ðŸ–¼",
    defaultContent: "Logo / Image",
    defaultWidth: 160,
    defaultHeight: 100,
    group: "Media",
  },
];

export const FIELD_GROUPS = ["Text", "Fields", "Media"];
