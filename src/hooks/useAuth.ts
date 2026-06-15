import { supabase } from "@/lib/supabase";
import { Profile, UserRole } from "@/types/user";
import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";


interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
        else {
          setIsLoading(false)
        }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session?.user) fetchProfile(session.user.id)
          else {
            setProfile(null)
            setIsLoading(false)
          }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile({
        ...data,
        role: data.role as UserRole,
      })
    }
  
    setIsLoading(false)
  }

  return {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isAdmin: profile?.role === 'admin'
  }
}