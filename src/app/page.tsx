"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTeam } from "@/lib/teamUtils";
import { CreateTeamModal } from "@/components/CreateTeamModal";
import { ERROR_MESSAGES } from "@/constants";

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async (name: string) => {
    setLoading(true);
    setErrorMsg("");
    
    try {
      const slug = await createTeam(name);
      router.push(`/t/${slug}`);
    } catch (e) {
      console.error(e);
      setErrorMsg(ERROR_MESSAGES.FAILED_TO_CREATE_TEAM);
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
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium shadow hover:bg-indigo-700 transition"
          >
            Создать новую команду
          </button>
        </div>
      </div>

      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrorMsg("");
        }}
        onCreate={handleCreate}
        loading={loading}
        errorMsg={errorMsg}
      />
    </main>
  );
}

