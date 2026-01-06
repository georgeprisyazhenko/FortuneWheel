"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { slugify } from "@/lib/slugify";

async function slugExists(slug: string) {
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

async function getUniqueSlug(base: string) {
  let candidate = base || "team";
  let suffix = 2;
  while (await slugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    const trimmed = teamName.trim();
    if (!trimmed) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const baseSlug = slugify(trimmed);
      const uniqueSlug = await getUniqueSlug(baseSlug);
      const { error } = await supabase
        .from("teams")
        .insert({ name: trimmed, slug: uniqueSlug });
      if (error) throw error;
      router.push(`/t/${uniqueSlug}`);
    } catch (e) {
      console.error(e);
      setErrorMsg("Не удалось создать команду. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4">
      <div className="rounded-xl bg-white p-10 shadow-lg w-full max-w-xl">
        <h1 className="text-3xl font-semibold mb-4 text-center">
          Колесо удачи для команд
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Создайте ссылку для команды, добавьте участников и жмите «Ему повезёт».
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium shadow hover:bg-indigo-700 transition"
          >
            Создать новую команду
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Новая команда</h2>
            <input
              autoFocus
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
              placeholder="Название команды"
              className="w-full rounded border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
            />
            {errorMsg && (
              <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded px-4 py-2 border border-slate-200 hover:bg-slate-50"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-70"
              >
                {loading ? "Создаём..." : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

