"use client";

import { useState } from "react";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  loading: boolean;
  errorMsg: string;
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onCreate,
  loading,
  errorMsg,
}: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");

  const handleSubmit = async () => {
    const trimmed = teamName.trim();
    if (!trimmed) return;
    await onCreate(trimmed);
    setTeamName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Новая команда</h2>
        <input
          autoFocus
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Название команды"
          className="w-full rounded border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
        />
        {errorMsg && (
          <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 border border-slate-200 hover:bg-slate-50"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? "Создаём..." : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
}
