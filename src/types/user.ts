export type UserRole = 'client' | 'admin';

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  car_brand: string | null
  car_model: string | null
  car_year: number | null
  role: UserRole
  created_at: string
  updated_at: string
}