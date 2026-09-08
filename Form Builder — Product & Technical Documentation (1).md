# Form Builder — Product & Technical Documentation

## 1. Overview

### 1.1 Purpose

The Form Builder is a configurable platform that allows authorized users to visually create, configure, publish, and manage different types of digital forms without writing frontend code.

The system should support forms ranging from simple contact forms to complex multi-step workflows such as:

- Student Admission Forms
- Enquiry Forms
- Registration Forms
- Application Forms
- Feedback Forms
- Survey Forms
- Employee Forms
- Event Registration Forms
- Leave Forms
- Complaint Forms
- Assessment Forms
- Data Collection Forms
- Consent Forms
- Custom Internal Forms

The primary interface will be a **visual drag-and-drop form builder**.

---

# 2. Core Product Concept

The Form Builder consists of five major areas:

```text
Form Builder
│
├── Form Management
│   ├── Create Form
│   ├── Drafts
│   ├── Published Forms
│   ├── Archived Forms
│   └── Templates
│
├── Form Designer
│   ├── Field Library
│   ├── Canvas
│   ├── Property Panel
│   ├── Sections
│   ├── Logic
│   └── Settings
│
├── Form Lifecycle
│   ├── Draft
│   ├── Review
│   ├── Approval
│   ├── Published
│   ├── Deactivated
│   └── Archived
│
├── Form Distribution
│   ├── Public URL
│   ├── QR Code
│   ├── Embed
│   └── Internal Access
│
└── Submission Management
    ├── Submission List
    ├── Submission Details
    ├── Filters
    ├── Export
    └── Workflow
```

---

# 3. Recommended Technology Stack

For an enterprise implementation:

### Frontend

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- TanStack Table
- dnd-kit
- Lucide React
- Framer Motion where animation is required

### Backend

- Node.js
- REST API or tRPC
- PostgreSQL
- Prisma ORM

### Storage

Use object storage for:

- Uploaded documents
- Images
- Form attachments
- Generated files

---

# 4. Architecture

Use a feature-based architecture.

```text
src/
│
├── app/
│   ├── forms/
│   │   ├── page.tsx
│   │   ├── new/
│   │   ├── [formId]/
│   │   │   ├── builder/
│   │   │   ├── submissions/
│   │   │   ├── settings/
│   │   │   └── preview/
│   │   └── templates/
│   │
│   └── public/
│       └── forms/
│           └── [slug]/
│
├── features/
│   └── form-builder/
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       ├── types/
│       ├── utils/
│       ├── constants/
│       └── services/
│
├── components/
│   ├── ui/
│   ├── common/
│   └── layout/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── validation/
│   └── utils/
│
└── types/
```

---

# 5. Form Builder UI

The builder should use a three-panel layout.

```text
┌─────────────────────────────────────────────────────────────────┐
│ Form Name       Draft       Preview    Save    Publish          │
├───────────────┬───────────────────────────────┬─────────────────┤
│               │                               │                 │
│ Field Library │           Form Canvas         │  Properties     │
│               │                               │                 │
│ Text          │ ┌─────────────────────────┐   │ Label           │
│ Number        │ │ Student Information     │   │ Placeholder     │
│ Email         │ ├─────────────────────────┤   │ Required        │
│ Phone         │ │ Full Name               │   │ Validation      │
│ Date          │ │ [___________________]   │   │ Visibility      │
│ Dropdown      │ │                         │   │ Default Value   │
│ Checkbox      │ │ Email                   │   │ Help Text       │
│ Radio         │ │ [___________________]   │   │                 │
│ File Upload   │ │                         │   │                 │
│ Signature     │ └─────────────────────────┘   │                 │
│               │                               │                 │
└───────────────┴───────────────────────────────┴─────────────────┘
```

---

# 6. Builder Header

The header should contain:

### Left

- Back button
- Form name
- Form status
- Last saved indicator

Example:

```text
← Forms / Admission Application

Admission Application
● Draft
Last saved 2 minutes ago
```

### Right

- Undo
- Redo
- Preview
- Save
- Submit for Review
- Publish

For published forms:

```text
Preview | More | Deactivate
```

---

# 7. Field Library

The field library should be categorized.

## Basic Fields

```text
Short Text
Long Text
Number
Email
Phone
URL
Password
```

## Selection Fields

```text
Dropdown
Radio Group
Checkbox Group
Single Checkbox
Multi Select
Yes / No
```

## Date & Time

```text
Date
Time
Date & Time
Date Range
```

## Advanced

```text
File Upload
Image Upload
Signature
Rating
Slider
Color Picker
Address
Location
Currency
```

## Layout

```text
Section
Heading
Paragraph
Divider
Spacer
```

## Special

```text
Repeater
Calculation
Hidden Field
Terms & Conditions
Captcha
```

---

# 8. Field Drag & Drop Behavior

A field should be draggable from the library to the canvas.

```text
Field Library
      │
      │ drag
      ▼
┌───────────────────────────────┐
│ Form Canvas                   │
│                               │
│  Name                         │
│  ┌─────────────────────────┐  │
│  │                         │  │
│  └─────────────────────────┘  │
│                               │
│        ↓ Drop here             │
│                               │
└───────────────────────────────┘
```

The builder should support:

- Add field
- Remove field
- Duplicate field
- Reorder field
- Move field between sections
- Copy/paste field
- Drag field above/below another field
- Multi-column layout
- Undo/redo

---

# 9. Field Selection

When a field is selected, the property panel opens.

Example:

```text
Text Field

Label
[ Student Name                 ]

Placeholder
[ Enter student name           ]

Description
[ Enter your full legal name  ]

Required
[ ON ]

Validation
[ Minimum length: 3            ]

Default Value
[                              ]

Visibility
[ Always visible               ]
```

---

# 10. Common Field Properties

Every field should support a common configuration model.

```ts
interface BaseField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  validation?: ValidationRule[];
  visibility?: VisibilityRule[];
}
```

---

# 11. Text Field Configuration

```text
Label
Placeholder
Help Text
Default Value

Required
Min Length
Max Length

Pattern
Regex

Prefix
Suffix
```

Example:

```text
Field: Student Name

Label:
Student Name

Placeholder:
Enter student name

Required:
Yes

Minimum Length:
3

Maximum Length:
100
```

---

# 12. Number Field

Configuration:

```text
Minimum
Maximum
Step
Decimal Places
Prefix
Suffix
Default Value
```

Example:

```text
Age
Minimum: 3
Maximum: 100
```

---

# 13. Email Field

Support:

```text
Required
Email validation
Allowed domains
Blocked domains
```

---

# 14. Phone Field

Support:

```text
Country Code
Phone Format
Minimum Length
Maximum Length
Validation
```

Example:

```text
+91
[ 9876543210 ]
```

---

# 15. Dropdown

Configuration:

```text
Label
Placeholder
Options
Default Option
Required
Searchable
Allow Multiple
```

Options can be:

### Static

```text
Male
Female
Other
```

### Dynamic

```text
API
Database
Another field
External source
```

---

# 16. Radio Group

Example:

```text
Gender

○ Male
○ Female
○ Other
```

Properties:

```text
Options
Layout
Required
Default Value
```

Layout:

```text
Vertical
Horizontal
```

---

# 17. Checkbox Group

Example:

```text
Select Activities

☐ Sports
☐ Music
☐ Dance
☐ Art
```

Support:

```text
Minimum selections
Maximum selections
Required
Options
```

---

# 18. File Upload

Configuration:

```text
Accepted File Types
Maximum File Size
Maximum Number of Files
Required
Upload Instructions
```

Example:

```text
Upload Birth Certificate

Allowed:
PDF, JPG, PNG

Maximum:
5 MB
```

---

# 19. Image Upload

Support:

```text
Image preview
Maximum size
Maximum dimensions
Allowed formats
Crop
Multiple images
```

---

# 20. Signature Field

Support:

- Draw signature
- Upload signature
- Clear signature
- Required

---

# 21. Rating Field

Example:

```text
How satisfied are you?

☆ ☆ ☆ ☆ ☆
```

Configuration:

```text
Minimum
Maximum
Icon
Default Value
Required
```

---

# 22. Date Field

Configuration:

```text
Minimum Date
Maximum Date
Default Date
Disable Past Dates
Disable Future Dates
```

---

# 23. Address Field

An address should be modeled either as one field or a composite field.

Example:

```text
Address
Address Line 1
Address Line 2
City
State
Country
Postal Code
```

---

# 24. Layout System

Forms should not be limited to one field per row.

Support:

```text
1 Column
2 Columns
3 Columns
4 Columns
```

Example:

```text
┌──────────────────┬──────────────────┐
│ First Name       │ Last Name        │
└──────────────────┴──────────────────┘

┌──────────────────┬──────────────────┐
│ Email            │ Phone            │
└──────────────────┴──────────────────┘
```

On mobile:

```text
First Name
Last Name

Email
Phone
```

---

# 25. Sections

Sections group related fields.

Example:

```text
Student Information

Full Name
Date of Birth
Gender
Blood Group


Parent Information

Father Name
Mother Name
Phone
Email


Address

Address
City
State
PIN Code
```

Section properties:

```text
Title
Description
Collapsible
Visibility Rules
Layout
```

---

# 26. Multi-Step Forms

The builder should support wizard-style forms.

```text
Step 1
Personal Information

Step 2
Parent Information

Step 3
Address

Step 4
Documents

Step 5
Review & Submit
```

Builder configuration:

```text
Steps
├── Personal Information
├── Parent Information
├── Address
├── Documents
└── Review
```

---

# 27. Conditional Logic

This is one of the most important features.

Example:

```text
Do you have previous school experience?

○ Yes
○ No
```

If:

```text
Answer = Yes
```

show:

```text
Previous School Name
Previous Class
Transfer Certificate
```

If:

```text
Answer = No
```

hide those fields.

---

# 28. Logic Builder

Use a visual rule builder.

```text
WHEN

[ Previous School ] [ equals ] [ Yes ]

THEN

[ Show ] [ Previous School Name ]

AND

[ Show ] [ Previous Class ]
```

Support operators:

```text
equals
not equals
contains
does not contain
starts with
ends with
greater than
less than
greater than or equal
less than or equal
is empty
is not empty
```

Actions:

```text
Show
Hide
Enable
Disable
Require
Make Optional
Set Value
```

---

# 29. Multiple Conditions

Support:

```text
ALL conditions
ANY condition
```

Example:

```text
IF

Age >= 18
AND
Nationality = Indian

THEN

Show Aadhaar Number
```

---

# 30. Calculated Fields

Forms should support calculations.

Example:

```text
Quantity × Price = Total
```

For an admission form:

```text
Tuition Fee
+ Transport Fee
+ Activity Fee
= Total Fee
```

Calculation configuration:

```text
Formula:

field_1 + field_2 + field_3
```

---

# 31. Repeater Fields

A repeater allows users to add multiple records.

Example:

```text
Previous Schools

School Name
Class
Year

[ + Add Another School ]
```

The user can add:

```text
School 1
School 2
School 3
```

This is important for:

- Family members
- Previous education
- Work experience
- References
- Multiple addresses
- Multiple children

---

# 32. Form Settings

The form should have a dedicated settings panel.

## General

```text
Form Name
Description
Category
Tags
```

## Submission

```text
Allow submissions
Maximum submissions
Submission confirmation
Redirect URL
```

## Security

```text
Captcha
Authentication required
Domain restrictions
Rate limiting
```

## Notifications

```text
Email notification
SMS notification
Internal notification
Webhook
```

## Appearance

```text
Theme
Logo
Primary color
Button style
Font
Background
```

---

# 33. Submission Settings

After submission:

### Option 1

```text
Show success message
```

### Option 2

```text
Redirect to URL
```

### Option 3

```text
Open another form
```

Example:

```text
Thank you!

Your enquiry has been successfully submitted.

Reference ID:
ENQ-2026-00124
```

---

# 34. Form Status Lifecycle

Forms should have a controlled lifecycle.

```text
DRAFT
   ↓
SUBMITTED_FOR_REVIEW
   ↓
APPROVED
   ↓
PUBLISHED
   ↓
ACTIVE
   ↓
DEACTIVATED
   ↓
ARCHIVED
```

A form should never directly jump from draft to active when approval is required.

---

# 35. Approval Workflow

For your school ERP use case, this is especially important.

For example, the **Enquiry Form Builder** can follow:

```text
Tech Person
    │
    │ Create Form
    ▼
DRAFT
    │
    │ Submit
    ▼
ADMIN / PRINCIPAL
    │
    ├── Reject → Draft
    │
    └── Approve
           │
           ▼
       APPROVED
           │
           ▼
         ACTIVE
```

An approved form can then be distributed through:

```text
Public URL
QR Code
Website
Portal
```

Submissions can flow into:

```text
Form Submission
       ↓
Reception
       ↓
Counselling
       ↓
Admission Pipeline
```

---

# 36. Versioning

Never modify a published form directly.

Use versions.

```text
Admission Form

v1
Published

v2
Draft

v3
Draft
```

When a published form is edited:

```text
Published v1
      ↓
Create v2
      ↓
Edit v2
      ↓
Submit for Review
      ↓
Publish v2
```

Existing submissions remain associated with the version they were submitted against.

---

# 37. Form Preview

Preview should render the actual form using the same rendering engine as the public form.

Modes:

```text
Desktop
Tablet
Mobile
```

Actions:

```text
Preview
Test Submission
Reset
```

This avoids the problem where the builder looks different from the final form.

---

# 38. Form Renderer

The most important architectural decision is:

> The builder should generate a JSON form schema, and the same schema should be rendered by a reusable Form Renderer.

Architecture:

```text
                 Form Schema
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     Form Builder          Form Renderer
          │                     │
          ▼                     ▼
    Admin Interface        Public Form
```

This means you do not build the form twice.

---

# 39. Form Schema

Example:

```ts
interface FormSchema {
  id: string;
  version: number;
  title: string;
  description?: string;

  settings: FormSettings;

  sections: FormSection[];

  logic: LogicRule[];
}
```

Section:

```ts
interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
}
```

Field:

```ts
interface FormField {
  id: string;
  type: FieldType;
  name: string;

  label: string;
  description?: string;
  placeholder?: string;

  required?: boolean;
  disabled?: boolean;

  defaultValue?: unknown;

  options?: FieldOption[];

  validation?: ValidationRule[];

  layout?: {
    columns?: number;
  };
}
```

---

# 40. Field Type

Use a strongly typed union.

```ts
type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "url"
  | "password"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "date"
  | "time"
  | "datetime"
  | "file"
  | "image"
  | "signature"
  | "rating"
  | "slider"
  | "address"
  | "hidden"
  | "heading"
  | "paragraph"
  | "divider"
  | "section"
  | "repeater"
  | "calculation";
```

---

# 41. Validation Architecture

Validation should exist at two levels.

### Client

Used for immediate UX.

```text
Required
Invalid email
Minimum length
Maximum length
Invalid file
```

### Server

Always validate again.

Never trust client-side validation.

Example:

```ts
const schema = z.object({
  studentName: z
    .string()
    .min(3)
    .max(100),

  email: z
    .string()
    .email(),
});
```

---

# 42. Dynamic Validation

A form can contain validation rules generated from the builder.

Example:

```json
{
  "field": "age",
  "rules": [
    {
      "type": "min",
      "value": 5
    },
    {
      "type": "max",
      "value": 18
    }
  ]
}
```

The server converts these rules into executable validation.

---

# 43. Form Database Model

Recommended entities:

```text
Form
FormVersion
FormField
FormSubmission
FormSubmissionValue
FormTemplate
FormApproval
FormDistribution
FormWebhook
FormNotification
FormAuditLog
```

---

# 44. Form Entity

```text
Form
├── id
├── name
├── slug
├── description
├── category
├── status
├── currentVersionId
├── createdBy
├── createdAt
├── updatedAt
└── deletedAt
```

---

# 45. Form Version

```text
FormVersion
├── id
├── formId
├── versionNumber
├── schema
├── status
├── createdBy
├── approvedBy
├── publishedAt
├── createdAt
└── updatedAt
```

Store the complete schema as JSON rather than reconstructing it from dozens of database tables during rendering.

---

# 46. Submission Entity

```text
FormSubmission
├── id
├── formId
├── formVersionId
├── referenceNumber
├── submittedBy
├── status
├── submittedAt
├── ipAddress
├── userAgent
└── metadata
```

Values:

```text
FormSubmissionValue
├── id
├── submissionId
├── fieldId
├── value
└── metadata
```

For complex forms, storing the submitted snapshot alongside normalized searchable data is also useful.

---

# 47. Submission Management

Each form should have a submissions page.

```text
Submissions

Search
Filters
Date
Status

──────────────────────────────────────────────

Reference     Name          Status      Date
ENQ-001       Rahul         New         Aug 08
ENQ-002       Riya          Reviewed    Aug 08
ENQ-003       Amit          Closed      Aug 07
```

Actions:

```text
View
Edit
Delete
Export
Change Status
Assign
Print
Download
```

---

# 48. Submission Detail

Use a structured detail view rather than displaying raw JSON.

```text
Submission #ENQ-001

Personal Information
─────────────────────
Student Name     Rahul Sharma
Date of Birth    12/03/2015
Gender           Male

Parent Information
────────────────────
Father Name      Amit Sharma
Phone            9876543210

Documents
─────────
Birth Certificate    View
Photo                View
```

---

# 49. Search and Filtering

Submission tables should support:

```text
Global Search
Status
Date Range
Field Value
Assigned User
Submission Source
Form Version
```

Dynamic filtering can be generated from form fields.

Example:

```text
Class = Class 8
Gender = Female
City = Bhopal
Status = New
```

---

# 50. Form Distribution

Every published form should provide distribution options.

```text
Share Form

Public URL
QR Code
Embed Code
Copy Link
```

Example:

```text
https://school.com/forms/admission-2026
```

QR code can be generated from the public URL.

---

# 51. Public Form

Public form architecture:

```text
/forms/[slug]
```

The public renderer should:

1. Load active form
2. Load published version
3. Render schema
4. Apply conditional logic
5. Validate data
6. Submit data
7. Generate reference ID
8. Trigger notifications
9. Show success page

---

# 52. Form Security

Security should be treated as a first-class feature.

Implement:

```text
Authentication
Authorization
RBAC
CSRF protection
Rate limiting
Captcha
Input validation
File validation
File size limits
Malicious file detection
Audit logging
Submission throttling
```

Never trust:

```text
field names
field IDs
validation rules
submitted values
redirect URLs
uploaded files
```

from the browser.

---

# 53. RBAC

Example permissions:

```text
FORM_VIEW
FORM_CREATE
FORM_EDIT
FORM_DELETE
FORM_SUBMIT_FOR_REVIEW
FORM_APPROVE
FORM_PUBLISH
FORM_DEACTIVATE
FORM_VIEW_SUBMISSIONS
FORM_EXPORT_SUBMISSIONS
FORM_MANAGE_TEMPLATES
```

Roles:

```text
Super Admin
Form Builder
Admin
Approver
Viewer
```

For your school workflow:

```text
Tech Person
    → Create / Edit

Admin / Principal
    → Review / Approve / Activate

Reception / Counselling
    → View / Process submissions
```

---

# 54. Audit Log

Every important action should be logged.

Example:

```text
Aug 08, 12:10
Prasoon created Admission Form

Aug 08, 12:25
Form submitted for approval

Aug 08, 13:05
Admin approved version 1

Aug 08, 13:10
Form activated
```

Audit events:

```text
FORM_CREATED
FORM_UPDATED
VERSION_CREATED
SUBMITTED_FOR_REVIEW
APPROVED
REJECTED
PUBLISHED
ACTIVATED
DEACTIVATED
SUBMISSION_CREATED
SUBMISSION_UPDATED
SUBMISSION_EXPORTED
```

---

# 55. Templates

The builder should provide templates.

Example:

```text
Templates

Admission Form
Enquiry Form
Registration Form
Feedback Form
Survey Form
Event Registration
Employee Registration
Leave Application
Contact Form
Complaint Form
```

When creating:

```text
Create Form

○ Start from Blank
○ Use Template
```

Templates should create a new independent form version.

---

# 56. Reusable Components

Allow users to save commonly used field groups.

Example:

```text
Saved Blocks

Student Information
Parent Information
Address
Emergency Contact
Document Upload
Bank Details
```

A block can contain multiple fields.

Example:

```text
Student Information
├── Full Name
├── Date of Birth
├── Gender
├── Blood Group
└── Photo
```

Drag the entire block into a new form.

---

# 57. Dynamic Data Sources

Some fields should be connected to application data.

Example:

```text
Class
   ↓
API
   ↓
Class 1
Class 2
Class 3
...
```

Other examples:

```text
Students
Teachers
Departments
Countries
States
Cities
Courses
Branches
```

Configuration:

```text
Data Source

○ Static Options
○ API
○ Internal Entity
```

---

# 58. API Data Source

Example:

```ts
interface DataSource {
  type: "api" | "entity" | "static";

  endpoint?: string;

  valueKey?: string;

  labelKey?: string;
}
```

For example:

```json
{
  "type": "api",
  "endpoint": "/api/classes",
  "valueKey": "id",
  "labelKey": "name"
}
```

---

# 59. Dependent Dropdowns

Support cascading fields.

Example:

```text
Country
   ↓
State
   ↓
City
```

When country changes:

```text
Reload State options
```

When state changes:

```text
Reload City options
```

This should be supported by the form engine itself.

---

# 60. Notifications

After submission:

```text
Submission
    │
    ├── Email
    ├── SMS
    ├── Internal Notification
    └── Webhook
```

Example:

```text
New Admission Enquiry

Reference:
ENQ-2026-0024

Student:
Rahul Sharma

Class:
Class 8
```

---

# 61. Webhooks

Forms should optionally send submission data to external systems.

Example:

```text
POST /webhook/admission

{
  "formId": "...",
  "submissionId": "...",
  "data": {
    "studentName": "Rahul Sharma"
  }
}
```

Webhook configuration:

```text
URL
Method
Headers
Authentication
Events
Retry Policy
```

---

# 62. Autosave

The builder should automatically save changes.

Recommended behavior:

```text
User changes field
      ↓
Local state update
      ↓
Debounce
      ↓
Autosave
      ↓
Server
```

UI:

```text
Saving...
Saved
```

Never block the builder while saving.

---

# 63. Undo / Redo

Undo/redo is essential for a visual builder.

Actions should include:

```text
Add field
Delete field
Move field
Duplicate field
Change property
Add section
Delete section
Change layout
Add logic
```

Use an action/history model rather than saving entire form state for every click.

---

# 64. Copy / Paste

Support:

```text
Copy field
Paste field
Duplicate field
Copy section
Duplicate section
```

When duplicating:

```text
Original ID
field_123

New ID
field_124
```

The field name must also be regenerated safely.

---

# 65. Responsive Builder

The builder itself should support:

```text
Desktop
Tablet
Mobile
```

The final form must be responsive regardless of builder viewport.

Grid configuration:

```text
Desktop: 2 columns
Tablet: 2 columns
Mobile: 1 column
```

---

# 66. Accessibility

The generated forms should support:

- Keyboard navigation
- Proper labels
- ARIA attributes
- Screen readers
- Focus management
- Error announcements
- Accessible drag-and-drop alternatives
- Visible focus states
- Sufficient contrast

Drag-and-drop must not be the only way to add/reorder fields.

Provide actions such as:

```text
Move Up
Move Down
Duplicate
Delete
```

---

# 67. Error Handling

Builder errors:

```text
Unable to save changes
Invalid field configuration
Duplicate field name
Invalid logic rule
```

Form submission errors:

```text
Please correct the highlighted fields.
```

System errors:

```text
Something went wrong.
Please try again.
```

Never expose backend stack traces.

---

# 68. Empty States

Forms page:

```text
No forms yet

Create your first form to start collecting information.

[ Create Form ]
```

Submission page:

```text
No submissions yet

Once someone submits this form,
their responses will appear here.
```

---

# 69. Form List Page

Recommended layout:

```text
Forms

[ Search forms... ]      [ Filter ] [ + Create Form ]

────────────────────────────────────────────────────

Form Name             Status       Responses    Updated

Admission Form        Active       324          Today
Enquiry Form          Active       182          Today
Feedback Form         Draft        —            Yesterday
```

Tabs:

```text
All
Drafts
Pending Review
Published
Inactive
Archived
```

---

# 70. Form Creation Flow

```text
Forms
 ↓
Create Form
 ↓
Choose:
 ├── Blank Form
 └── Template
 ↓
Form Builder
 ↓
Configure Fields
 ↓
Configure Logic
 ↓
Configure Settings
 ↓
Preview
 ↓
Save
 ↓
Submit for Review
```

---

# 71. Complete Form Lifecycle

```text
CREATE
  │
  ▼
DRAFT
  │
  ▼
DESIGN
  │
  ├───────────────┐
  │               │
  ▼               ▼
PREVIEW        VALIDATE
  │               │
  └───────┬───────┘
          ▼
SUBMIT FOR REVIEW
          │
     ┌────┴─────┐
     ▼          ▼
  APPROVED    REJECTED
     │          │
     │          ▼
     │        DRAFT
     │
     ▼
  PUBLISHED
     │
     ▼
   ACTIVE
     │
     ▼
 DEACTIVATED
     │
     ▼
  ARCHIVED
```

---

# 72. API Design

Recommended API structure:

```text
/api/forms
```

### Form APIs

```http
GET    /api/forms
POST   /api/forms
GET    /api/forms/:id
PATCH  /api/forms/:id
DELETE /api/forms/:id
```

### Version APIs

```http
POST /api/forms/:id/versions
GET  /api/forms/:id/versions
GET  /api/forms/:id/versions/:versionId
```

### Workflow APIs

```http
POST /api/forms/:id/submit-review
POST /api/forms/:id/approve
POST /api/forms/:id/reject
POST /api/forms/:id/publish
POST /api/forms/:id/activate
POST /api/forms/:id/deactivate
```

### Submission APIs

```http
GET    /api/forms/:id/submissions
POST   /api/forms/:id/submissions
GET    /api/forms/:id/submissions/:submissionId
PATCH  /api/forms/:id/submissions/:submissionId
DELETE /api/forms/:id/submissions/:submissionId
```

---

# 73. Public APIs

Public form:

```http
GET /api/public/forms/:slug
```

Submission:

```http
POST /api/public/forms/:slug/submit
```

The public API should only expose the currently active published version.

Never expose internal draft versions.

---

# 74. Example Submission Request

```json
{
  "formVersion": 3,
  "values": {
    "studentName": "Rahul Sharma",
    "email": "rahul@example.com",
    "class": "8",
    "gender": "male"
  }
}
```

Server response:

```json
{
  "success": true,
  "submissionId": "sub_123",
  "referenceNumber": "ENQ-2026-0024"
}
```

---

# 75. State Management

Separate state into:

### Builder State

```text
Current schema
Selected field
Selected section
History
UI state
```

### Server State

Use TanStack Query for:

```text
Forms
Versions
Templates
Submissions
Data sources
```

### Form Runtime State

React Hook Form should manage:

```text
Field values
Touched fields
Errors
Dirty state
Submission state
```

---

# 76. Builder State Example

```ts
interface BuilderState {
  schema: FormSchema;

  selectedFieldId?: string;

  selectedSectionId?: string;

  history: BuilderAction[];

  historyIndex: number;

  isDirty: boolean;

  isSaving: boolean;
}
```

---

# 77. Form Rendering Engine

Create a central component:

```tsx
<FormRenderer schema={schema} />
```

Internally:

```tsx
switch (field.type) {
  case "text":
    return <TextField {...field} />;

  case "email":
    return <EmailField {...field} />;

  case "select":
    return <SelectField {...field} />;

  case "file":
    return <FileField {...field} />;

  default:
    return null;
}
```

But for a large application, prefer a field registry instead of an increasingly large switch statement.

Example:

```ts
const fieldRegistry = {
  text: TextField,
  email: EmailField,
  number: NumberField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  file: FileField,
};
```

---

# 78. Field Registry

Each field type should define:

```ts
interface FieldDefinition {
  type: FieldType;

  label: string;

  icon: LucideIcon;

  component: React.ComponentType;

  defaultConfig: Partial<FormField>;

  validateConfig: (field: FormField) => boolean;
}
```

This makes the system extensible.

Adding a new field becomes:

```text
Create field component
       ↓
Create configuration
       ↓
Register field
       ↓
Automatically available in builder
```

---

# 79. Builder Components

Recommended components:

```text
FormBuilder
├── BuilderHeader
├── FieldLibrary
│   ├── FieldCategory
│   └── FieldLibraryItem
│
├── FormCanvas
│   ├── CanvasSection
│   ├── CanvasField
│   ├── DropIndicator
│   └── EmptyCanvas
│
├── PropertiesPanel
│   ├── GeneralProperties
│   ├── ValidationProperties
│   ├── LogicProperties
│   └── AdvancedProperties
│
├── LogicBuilder
├── PreviewPanel
├── DevicePreview
└── BuilderSettings
```

---

# 80. Drag & Drop Architecture

Use `dnd-kit`.

Recommended draggable types:

```text
FIELD
SECTION
FIELD_GROUP
```

Drop targets:

```text
CANVAS
SECTION
FIELD
```

Drag operations:

```text
FIELD_LIBRARY → CANVAS
FIELD_LIBRARY → SECTION
FIELD → FIELD
FIELD → SECTION
SECTION → SECTION
```

---

# 81. Drag State

During dragging show:

```text
Drop indicator
Insertion position
Highlighted section
```

Example:

```text
Email
──────────────
↓ Drop field here
──────────────
Phone
```

Do not move the actual field until the drop operation completes.

---

# 82. Builder UX Rules

The builder should feel like a professional design tool.

Important behaviors:

- Click field → select
- Double-click field → edit label
- Drag → move
- Duplicate → instant duplicate
- Delete → instant delete
- Escape → deselect
- Cmd/Ctrl + Z → undo
- Cmd/Ctrl + Shift + Z → redo
- Cmd/Ctrl + C → copy
- Cmd/Ctrl + V → paste

---

# 83. Mobile Builder

On smaller screens, do not keep three panels visible.

Use:

```text
Canvas
   ↓
Field Library Drawer
   ↓
Properties Drawer
```

Example:

```text
┌────────────────────────────┐
│ Form Builder               │
├────────────────────────────┤
│                            │
│        Canvas              │
│                            │
│                            │
├────────────────────────────┤
│ + Add Field     Settings   │
└────────────────────────────┘
```

---

# 84. Form Preview Architecture

Preview should use:

```text
Same Form Schema
       ↓
Same Form Renderer
       ↓
Preview Container
```

Do not create a separate preview implementation.

---

# 85. Testing Strategy

### Unit Tests

Test:

```text
Field configuration
Validation
Logic engine
Calculation engine
Schema transformation
Field registry
```

### Integration Tests

Test:

```text
Create form
Save form
Create version
Submit for review
Approve
Publish
Submit form
Retrieve submission
```

### E2E Tests

Important flow:

```text
Create form
→ Drag fields
→ Configure fields
→ Add conditional logic
→ Preview
→ Save
→ Submit for approval
→ Approve
→ Publish
→ Open public URL
→ Submit
→ Verify submission
```

---

# 86. Performance Requirements

The builder should remain responsive with large forms.

Target:

```text
100+ fields
20+ sections
Complex conditional logic
Large option lists
```

Use:

- Memoized field components
- Virtualized field library where necessary
- Debounced autosave
- Lazy-loaded configuration panels
- Optimistic UI
- Efficient drag state
- Schema diffing

---

# 87. Form Schema Migration

Schema versions may change as the application evolves.

Example:

```text
Schema v1
     ↓
Migration
     ↓
Schema v2
```

Never assume old forms automatically match the latest schema.

Create migration utilities:

```ts
migrateFormSchema(
  schema,
  fromVersion,
  toVersion
);
```

---

# 88. Analytics

Each form should optionally provide:

```text
Total Views
Started
Completed
Abandoned
Conversion Rate
Average Completion Time
```

Example:

```text
Admission Form

Views              1,245
Started              820
Completed            624
Abandoned             196
Conversion Rate      50.1%
```

---

# 89. Form Analytics Funnel

```text
Views
  ↓
Started
  ↓
Fields Completed
  ↓
Review
  ↓
Submitted
```

For multi-step forms:

```text
Step 1 → 100%
Step 2 → 84%
Step 3 → 72%
Step 4 → 61%
Submit → 58%
```

This helps identify where users abandon the form.

---

# 90. Draft Recovery

If the public user closes the browser accidentally, optionally preserve unfinished forms.

Use:

```text
localStorage
```

or authenticated server-side drafts.

Example:

```text
Your previous response was found.

[Continue]
[Start Over]
```

---

# 91. Autosave Public Forms

For long forms, optionally save incomplete submissions.

Example:

```text
Draft saved at 12:34 PM
```

This should be configurable per form.

---

# 92. Internationalization

The builder should eventually support:

```text
Multiple languages
RTL
Localized labels
Localized validation messages
Localized date formats
Currency
```

Schema example:

```json
{
  "label": {
    "en": "Student Name",
    "hi": "विद्यार्थी का नाम"
  }
}
```

---

# 93. Theme Configuration

Forms should support configurable themes.

```text
Theme
├── Primary Color
├── Background
├── Text Color
├── Border Radius
├── Button Style
├── Font
└── Layout
```

Provide predefined themes:

```text
Default
Minimal
Professional
Modern
School
```

---

# 94. Form Embed

Support embedding:

```html
<iframe
  src="https://school.com/forms/admission-2026">
</iframe>
```

Optional JavaScript SDK:

```js
FormBuilder.embed({
  form: "admission-2026",
  container: "#form"
});
```

---

# 95. Form Access Modes

A form can have:

```text
Public
Authenticated
Internal
Restricted
```

### Public

Anyone can submit.

### Authenticated

User must log in.

### Internal

Only authorized employees.

### Restricted

Only users matching configured conditions.

---

# 96. Submission Workflow

Submission status should be independent from form status.

Example:

```text
NEW
↓
UNDER_REVIEW
↓
APPROVED
↓
REJECTED
↓
CLOSED
```

For admission:

```text
Submitted
↓
Reception
↓
Counselling
↓
Assessment
↓
Management Decision
↓
Admission
```

The Form Builder itself should remain generic.

The consuming module controls domain-specific workflow.

---

# 97. Important Architectural Principle

Do **not** put admission-specific logic inside the generic Form Builder.

Bad:

```text
Form Builder
 └── AdmissionDecision
```

Good:

```text
Form Builder
 └── Generic form engine

Admission Module
 └── Uses Form Builder

Enquiry Module
 └── Uses Form Builder

Employee Module
 └── Uses Form Builder
```

This allows one Form Builder to power the entire ERP.

---

# 98. Example: Enquiry Form

The Enquiry Form Builder can create:

```text
Student Information
├── Student Name
├── Date of Birth
├── Gender
├── Applying Class
└── Previous School

Parent Information
├── Parent Name
├── Phone
├── Email
└── Occupation

Address
├── Address
├── City
├── State
└── PIN Code

Requirements
├── Transport Required
├── Hostel Required
└── Additional Notes
```

Once approved and activated:

```text
QR Code
   ↓
Public Enquiry Form
   ↓
Submission
   ↓
Reception / Counselling
   ↓
Admission Pipeline
```

---

# 99. Form Builder Dashboard

Recommended dashboard:

```text
Form Builder

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Total Forms│ │ Active     │ │ Submissions │
│    24      │ │    18      │ │   2,482     │
└────────────┘ └────────────┘ └────────────┘

Forms
─────────────────────────────────────────────

Admission Form       Active       624
Enquiry Form         Active       482
Feedback Form        Draft          —
Registration Form    Active       312
```

Keep dashboard metrics generic rather than embedding domain-specific admission metrics.

---

# 100. Recommended MVP

Do not implement every advanced feature in the first release.

### Phase 1 — Core Builder

Implement:

```text
✓ Form CRUD
✓ Drag & drop
✓ Text
✓ Textarea
✓ Number
✓ Email
✓ Phone
✓ Select
✓ Radio
✓ Checkbox
✓ Date
✓ File Upload
✓ Sections
✓ Field properties
✓ Required validation
✓ Preview
✓ Save draft
```

### Phase 2 — Production Workflow

```text
✓ Form versions
✓ Approval
✓ Publish
✓ Activate / deactivate
✓ Public URL
✓ QR code
✓ Submission management
✓ Export
✓ RBAC
✓ Audit logs
```

### Phase 3 — Advanced Builder

```text
✓ Conditional logic
✓ Multi-step forms
✓ Repeater
✓ Calculations
✓ Dynamic data sources
✓ Dependent dropdowns
✓ Reusable blocks
✓ Templates
```

### Phase 4 — Enterprise

```text
✓ Webhooks
✓ API integrations
✓ Analytics
✓ Multilingual forms
✓ Form embedding
✓ Draft recovery
✓ Advanced access rules
✓ Schema migrations
```

---

# 101. MVP Acceptance Criteria

The MVP is complete when:

### Builder

- User can create a form.
- User can drag fields into the canvas.
- User can reorder fields.
- User can delete fields.
- User can duplicate fields.
- User can configure field properties.
- User can create sections.
- User can preview the form.
- User can save a draft.

### Runtime

- Form renders correctly from JSON schema.
- Validation works.
- Required fields work.
- Submission works.
- Error messages are displayed.
- Success state is displayed.

### Workflow

- Draft can be submitted for review.
- Authorized user can approve.
- Approved form can be published.
- Published form can be activated.
- Active form has a public URL.
- QR code can open the form.
- Submissions are stored.

### Security

- Unauthorized users cannot edit forms.
- Draft forms cannot be accessed publicly.
- Only active published versions can receive public submissions.
- Server-side validation is enforced.

---

# 102. Recommended Development Order

Build in this order:

```text
1. Form Schema
       ↓
2. Field Registry
       ↓
3. Form Renderer
       ↓
4. Basic Field Components
       ↓
5. Builder Canvas
       ↓
6. Drag & Drop
       ↓
7. Properties Panel
       ↓
8. Validation Engine
       ↓
9. Preview
       ↓
10. Persistence
       ↓
11. Versioning
       ↓
12. Approval Workflow
       ↓
13. Public Form
       ↓
14. Submission Engine
       ↓
15. Submission Management
       ↓
16. Conditional Logic
       ↓
17. Advanced Fields
       ↓
18. Templates
       ↓
19. Dynamic Data
       ↓
20. Analytics / Integrations
```

---

# 103. Final Architecture

The complete platform should ultimately look like:

```text
                         FORM PLATFORM
                              │
              ┌───────────────┴────────────────┐
              │                                │
        FORM MANAGEMENT                  FORM BUILDER
              │                                │
       ┌──────┼──────┐                 ┌───────┼────────┐
       │      │      │                 │       │        │
     Draft  Review Published        Fields  Logic   Settings
                                      │
                                      ▼
                                FORM SCHEMA
                                      │
                       ┌──────────────┼──────────────┐
                       │              │              │
                       ▼              ▼              ▼
                   Preview       Public Form     Internal Form
                                      │
                                      ▼
                                  Submission
                                      │
                       ┌──────────────┼──────────────┐
                       │              │              │
                       ▼              ▼              ▼
                   Database      Notifications    Webhooks
                                      │
                                      ▼
                              MODULE WORKFLOW
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
                 Enquiry          Admission         Feedback
                 Module            Module            Module
```

# 104. Key Design Principle

The most important principle for this project is:

> **The Form Builder should be generic, while business modules should consume forms and own their business workflows.**

The Form Builder owns:

```text
Fields
Layout
Validation
Logic
Schema
Versions
Publishing
Submissions
Distribution
```

The individual modules own:

```text
Business meaning
Business workflow
Business decisions
Assignments
Approvals
Domain-specific statuses
```

This architecture allows the same builder to power **Enquiry, Admission, Employee, Feedback, Survey, Registration, Assessment, and future ERP modules** without continuously modifying the core form engine.
