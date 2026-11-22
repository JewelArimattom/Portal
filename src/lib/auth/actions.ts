"use server"

import { createClient } from "@/lib/supabase/server"
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth"
import { redirect } from "next/navigation"

export async function signIn(formData: { email: string; password: string }) {
  const result = loginSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Validation failed" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signUp(formData: {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}) {
  const result = signupSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Validation failed" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  redirect("/login")
}

export async function resetPassword(formData: { email: string }) {
  const result = forgotPasswordSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Validation failed" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: {
  password: string
  confirmPassword: string
}) {
  const result = resetPasswordSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Validation failed" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
