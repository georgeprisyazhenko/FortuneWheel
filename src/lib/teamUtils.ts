import { supabase } from "./supabaseClient";
import { slugify } from "./slugify";

export async function slugExists(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  
  if (error && error.code !== "PGRST116") {
    throw error;
  }
  
  return Boolean(data);
}

export async function getUniqueSlug(base: string): Promise<string> {
  let candidate = base || "team";
  let suffix = 2;
  
  while (await slugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  
  return candidate;
}

export async function createTeam(name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Team name cannot be empty");
  }
  
  const baseSlug = slugify(trimmed);
  const uniqueSlug = await getUniqueSlug(baseSlug);
  
  const { error, data } = await supabase
    .from("teams")
    .insert({ name: trimmed, slug: uniqueSlug })
    .select("slug")
    .single();
  
  if (error) {
    throw error;
  }
  
  return data.slug;
}
