/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>
  export default content
}
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  [key: string]: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}