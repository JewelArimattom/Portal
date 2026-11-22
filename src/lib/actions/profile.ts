"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStudentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: preferences },
    { data: educations },
    { data: academicResults },
    { data: subjects },
    { data: languages },
    { data: documents },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("student_preferences").select("*").eq("student_id", user.id).single(),
    supabase.from("educations").select("*").eq("student_id", user.id).order("display_order"),
    supabase.from("academic_results").select("*").eq("student_id", user.id),
    supabase.from("subjects").select("*").eq("student_id", user.id).order("semester_number"),
    supabase.from("language_certificates").select("*").eq("student_id", user.id),
    supabase.from("documents").select("*").eq("student_id", user.id),
  ]);

  return {
    user,
    profile,
    preferences,
    educations: educations || [],
    academicResults: academicResults || [],
    subjects: subjects || [],
    languages: languages || [],
    documents: documents || [],
  };
}
