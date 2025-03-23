import { createServerComponentClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  try {
    const supabase = await createServerComponentClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    // Fetch profile data
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("Erro ao buscar perfil:", error)
      // Se não encontrar o perfil, criar um com dados básicos
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
          },
        ])
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return (
        <div className="container max-w-4xl py-10">
          <h1 className="text-2xl font-bold mb-6">Seu Perfil</h1>
          <ProfileForm profile={newProfile} />
        </div>
      )
    }

    return (
      <div className="container max-w-4xl py-10">
        <h1 className="text-2xl font-bold mb-6">Seu Perfil</h1>
        <ProfileForm profile={profile} />
      </div>
    )
  } catch (error) {
    console.error("Erro na página de perfil:", error)
    redirect("/login")
  }
}

