import type { FieldType } from '../types/schema'
import {
  Type, AlignLeft, Hash, Mail, Phone, Link, Eye,
  ChevronDown, Circle, CheckSquare, Calendar, Upload, ImageIcon,
  PenLine, Star, MapPin, Minus,
  Heading1, AlignJustify, Repeat, Calculator, Clock, Sliders,
  LayoutTemplate, EyeOff, List
} from 'lucide-react'

export interface FieldDefinition {
  type: FieldType
  label: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  category: 'basic' | 'selection' | 'datetime' | 'advanced' | 'layout' | 'special'
  defaultConfig: Record<string, unknown>
}

export const FIELD_REGISTRY: Record<string, FieldDefinition> = {
  text:        { type: 'text',        label: 'Short Text',     icon: Type,          category: 'basic',     defaultConfig: { placeholder: 'Enter text...' } },
  textarea:    { type: 'textarea',    label: 'Long Text',      icon: AlignLeft,     category: 'basic',     defaultConfig: { placeholder: 'Enter text...', rows: 4 } },
  number:      { type: 'number',      label: 'Number',         icon: Hash,          category: 'basic',     defaultConfig: { placeholder: '0' } },
  email:       { type: 'email',       label: 'Email',          icon: Mail,          category: 'basic',     defaultConfig: { placeholder: 'email@example.com' } },
  phone:       { type: 'phone',       label: 'Phone',          icon: Phone,         category: 'basic',     defaultConfig: { placeholder: '+91 9876543210' } },
  url:         { type: 'url',         label: 'URL',            icon: Link,          category: 'basic',     defaultConfig: { placeholder: 'https://' } },
  password:    { type: 'password',    label: 'Password',       icon: Eye,           category: 'basic',     defaultConfig: {} },
  select:      { type: 'select',      label: 'Dropdown',       icon: ChevronDown,   category: 'selection', defaultConfig: { options: [{ label: 'Option 1', value: 'option_1' }], searchable: false } },
  multiselect: { type: 'multiselect', label: 'Multi-Select',   icon: List,          category: 'selection', defaultConfig: { options: [{ label: 'Option 1', value: 'option_1' }] } },
  radio:       { type: 'radio',       label: 'Radio Group',    icon: Circle,        category: 'selection', defaultConfig: { options: [{ label: 'Option 1', value: 'option_1' }], layout: 'vertical' } },
  checkbox:    { type: 'checkbox',    label: 'Checkbox Group', icon: CheckSquare,   category: 'selection', defaultConfig: { options: [{ label: 'Option 1', value: 'option_1' }] } },
  date:        { type: 'date',        label: 'Date',           icon: Calendar,      category: 'datetime',  defaultConfig: {} },
  time:        { type: 'time',        label: 'Time',           icon: Clock,         category: 'datetime',  defaultConfig: {} },
  datetime:    { type: 'datetime',    label: 'Date & Time',    icon: Calendar,      category: 'datetime',  defaultConfig: {} },
  file:        { type: 'file',        label: 'File Upload',    icon: Upload,        category: 'advanced',  defaultConfig: { maxSize: 5, acceptedTypes: ['.pdf', '.jpg', '.png'], maxFiles: 1 } },
  image:       { type: 'image',       label: 'Image Upload',   icon: ImageIcon,     category: 'advanced',  defaultConfig: { maxSize: 2, acceptedTypes: ['.jpg', '.png', '.webp'] } },
  signature:   { type: 'signature',   label: 'Signature',      icon: PenLine,       category: 'advanced',  defaultConfig: {} },
  rating:      { type: 'rating',      label: 'Rating',         icon: Star,          category: 'advanced',  defaultConfig: { max: 5 } },
  slider:      { type: 'slider',      label: 'Slider',         icon: Sliders,       category: 'advanced',  defaultConfig: { min: 0, max: 100, step: 1 } },
  address:     { type: 'address',     label: 'Address',        icon: MapPin,        category: 'advanced',  defaultConfig: {} },
  hidden:      { type: 'hidden',      label: 'Hidden Field',   icon: EyeOff,        category: 'advanced',  defaultConfig: {} },
  heading:     { type: 'heading',     label: 'Heading',        icon: Heading1,      category: 'layout',    defaultConfig: { level: 2, text: 'Section Heading' } },
  paragraph:   { type: 'paragraph',   label: 'Paragraph',      icon: AlignJustify,  category: 'layout',    defaultConfig: { text: 'Add your description here.' } },
  divider:     { type: 'divider',     label: 'Divider',        icon: Minus,         category: 'layout',    defaultConfig: {} },
  spacer:      { type: 'spacer',      label: 'Spacer',         icon: LayoutTemplate, category: 'layout',   defaultConfig: { height: 24 } },
  repeater:    { type: 'repeater',    label: 'Repeater',       icon: Repeat,        category: 'special',   defaultConfig: { fields: [], addButtonLabel: 'Add Item' } },
  calculation: { type: 'calculation', label: 'Calculation',    icon: Calculator,    category: 'special',   defaultConfig: { formula: '' } },
}

export const FIELD_CATEGORIES = [
  { id: 'basic',     label: 'Basic Fields' },
  { id: 'selection', label: 'Selection' },
  { id: 'datetime',  label: 'Date & Time' },
  { id: 'advanced',  label: 'Advanced' },
  { id: 'layout',    label: 'Layout' },
  { id: 'special',   label: 'Special' },
] as const