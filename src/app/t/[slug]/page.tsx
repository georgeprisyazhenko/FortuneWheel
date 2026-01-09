"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { poolForToday, pickRandom, type Member } from "@/lib/selection";
import { calculateWheelRotation } from "@/lib/wheelUtils";
import { useTeam } from "@/hooks/useTeam";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { WinnerAnimation } from "./WinnerAnimation";
import { EditableTitle } from "@/components/EditableTitle";
import { FortuneWheel } from "@/components/FortuneWheel";
import { MembersList } from "@/components/MembersList";
import type { Team } from "@/types";
import {
  WHEEL_ANIMATION_DURATION,
  WHEEL_ANIMATION_DELAY,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string };
};

export default function TeamPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { team, members, loading, error, setTeam, refreshMembers } = useTeam(slug);
  const {
    newMember,
    setNewMember,
    handleAddMember: baseHandleAddMember,
    handleToggleVacation: baseHandleToggleVacation,
    handleDeleteMember: baseHandleDeleteMember,
  } = useTeamMembers(team, async () => {
    if (team) {
      await refreshMembers(team.id);
    }
  });

  const [savingName, setSavingName] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [message, setMessage] = useState("");
  const [wheelRotation, setWheelRotation] = useState(0);

  const pool = useMemo(() => poolForToday(members, null), [members]);

  const wheelMembers = useMemo(
    () => members.filter((m) => !m.vacation),
    [members]
  );

  const handleSaveName = async (name: string) => {
    if (!team) return;
    
    const trimmed = name.trim();
    if (!trimmed || trimmed === team.name) return;
    
    setSavingName(true);
    const { error: updErr } = await supabase
      .from("teams")
      .update({ name: trimmed })
      .eq("id", team.id);
    
    if (updErr) {
      console.error(updErr);
      // Можно добавить обработку ошибки через setError
    } else {
      setTeam({ ...team, name: trimmed });
    }
    
    setSavingName(false);
  };

  const handleSpin = async () => {
    if (!team) return;
    
    if (!pool.length) {
      setMessage(SUCCESS_MESSAGES.ADD_MEMBERS);
      return;
    }

    const selected = pickRandom(pool);
    if (!selected) return;

    const winnerIdx = wheelMembers.findIndex((m) => m.id === selected.id);
    if (winnerIdx === -1) {
      console.error("Winner not found in wheelMembers", {
        selected,
        wheelMembers,
      });
      return;
    }

    const targetRotation = calculateWheelRotation(
      winnerIdx,
      wheelMembers.length,
      wheelRotation
    );

    setSpinning(true);
    setWinnerId(null);
    setMessage("");
    setWheelRotation(targetRotation);

    setTimeout(async () => {
      setSpinning(false);
      
      setTimeout(() => {
        setWinnerId(selected.id);
        setWinnerName(selected.name);
        setShowAnimation(true);
      }, WHEEL_ANIMATION_DELAY);

      const { error: updErr } = await supabase
        .from("teams")
        .update({ last_winner_member_id: selected.id })
        .eq("id", team.id);
      
      if (updErr) {
        console.error(updErr);
        // Можно добавить обработку ошибки
      } else {
        setTeam({ ...team, last_winner_member_id: selected.id });
      }
    }, WHEEL_ANIMATION_DURATION);
  };

  const handleAddMember = baseHandleAddMember;

  const handleToggleVacation = async (member: Member, value: boolean) => {
    await baseHandleToggleVacation(member, value);
  };

  const handleDeleteMember = async (member: Member) => {
    if (!team) return;
    await baseHandleDeleteMember(member, team, setTeam);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-red-600">
          {error || ERROR_MESSAGES.TEAM_NOT_FOUND}
        </p>
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white"
          onClick={() => router.push("/")}
        >
          На главную
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col gap-4 px-2 py-3 sm:px-3 sm:py-4">
      <header className="flex items-start justify-between gap-2 w-full">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl sm:text-2xl font-semibold whitespace-nowrap">Колесо фортуны</span>
          <EditableTitle
            name={team.name}
            onSave={handleSaveName}
            saving={savingName}
          />
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-xs sm:text-sm text-indigo-600 hover:underline whitespace-nowrap ml-2"
        >
          Создать новую комнату
        </button>
      </header>

      <section className="flex flex-col md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-4 w-full">
        <div className="rounded-xl bg-white p-3 sm:p-4 shadow flex flex-col items-center w-full">
          <FortuneWheel
            members={wheelMembers}
            spinning={spinning}
            winnerId={winnerId}
            poolLength={pool.length}
            rotation={wheelRotation}
          />
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="mt-3 rounded-full bg-emerald-600 px-6 py-2.5 text-sm sm:text-base font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60 w-full sm:w-auto"
          >
            Ему повезёт
          </button>
          {message && <p className="mt-3 text-sm text-emerald-700 text-center">{message}</p>}
          {showAnimation && winnerName && (
            <WinnerAnimation
              winnerName={winnerName}
              onComplete={() => {
                setShowAnimation(false);
                setMessage(SUCCESS_MESSAGES.WINNER(winnerName));
              }}
            />
          )}
        </div>

        <MembersList
          team={team}
          members={members}
          newMember={newMember}
          onNewMemberChange={setNewMember}
          onAddMember={handleAddMember}
          onToggleVacation={handleToggleVacation}
          onDeleteMember={handleDeleteMember}
        />
      </section>
    </main>
  );
}
