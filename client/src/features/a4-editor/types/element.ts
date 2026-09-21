// A4 at 96 DPI = 794 x 1123 px
export const A4_WIDTH = 794
export const A4_HEIGHT = 1123
// A3 at 96 DPI = 1123 x 1587 px
export const A3_WIDTH = 1123
export const A3_HEIGHT = 1587

export const A4_PADDING = 48

export type PaperSize = 'A4' | 'A3'
export type ElementType =
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'field_name'
  | 'field_email'
  | 'field_phone'
  | 'field_address'
  | 'field_date'
  | 'field_number'
  | 'field_textarea'
  | 'field_checkbox'
  | 'field_dropdown'
  | 'field_signature'
  | 'field_divider'
  | 'field_image_placeholder'

export interface ElementStyle {
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontFamily: string
  color: string
  textAlign: 'left' | 'center' | 'right'
  borderColor: string
  borderWidth: number
  bgColor: string
  opacity: number
  italic: boolean
  underline: boolean
  letterSpacing: number
  lineHeight: number
  paddingX: number
  paddingY: number
}

export interface CanvasElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  content: string
  label?: string
  placeholder?: string
  required?: boolean
  options?: string[]
  style: ElementStyle
  locked?: boolean
  _overlapping?: boolean  // transient flag — collision state during drag
}

export const DEFAULT_STYLE: ElementStyle = {
  fontSize: 14,
  fontWeight: 'normal',
  fontFamily: 'Inter, sans-serif',
  color: '#1f2937',
  textAlign: 'left',
  borderColor: '#d1d5db',
  borderWidth: 1,
  bgColor: 'transparent',
  opacity: 1,
  italic: false,
  underline: false,
  letterSpacing: 0,
  lineHeight: 1.5,
  paddingX: 0,
  paddingY: 0,
}

export interface A4EditorState {
  elements: CanvasElement[]
  selectedId: string | null
  templateName: string
  templateCategory: string
}