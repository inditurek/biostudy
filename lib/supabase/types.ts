// Este archivo se genera automáticamente con:
//   npx supabase gen types typescript --local > lib/supabase/types.ts
//
// Ejecutar ese comando cada vez que cambie el schema de base de datos (Subagente 3).
// No editar manualmente.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
