import { TiptapCollabProvider } from '@hocuspocus/provider'
import { Editor } from '@tiptap/core'
// import { Language } from '@tiptap-pro/extension-ai'
import * as Y from 'yjs'

export interface TiptapProps {
  aiToken?: string
  hasCollab?: boolean
  ydoc?: Y.Doc
  provider?: TiptapCollabProvider | null | undefined
  initialContent?: string
  onEditorUpdate?: (editor: Editor) => void
  isEditable?: boolean
  showHeader?: boolean
}

export type EditorUser = {
  clientId: string
  name: string
  color: string
  initials?: string
}

export type LanguageOption = {
  name: string
  label: string
  value: any
}

export type AiTone =
  | 'academic'
  | 'business'
  | 'casual'
  | 'childfriendly'
  | 'conversational'
  | 'emotional'
  | 'humorous'
  | 'informative'
  | 'inspirational'
  | string

export type AiPromptType = 'SHORTEN' | 'EXTEND' | 'SIMPLIFY' | 'TONE'

export type AiToneOption = {
  name: string
  label: string
  value: AiTone
}

export type AiImageStyle = {
  name: string
  label: string
  value: string
}
