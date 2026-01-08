"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { poolForToday, pickRandom, Member } from "@/lib/selection";

export const dynamic = 'force-dynamic';

type Team = {
  id: string;
  name: string;
  slug: string;
  last_winner_member_id: string | null;
};

type PageProps = {
  params: { slug: string };
};

export default function TeamPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMember, setNewMember] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: teamRow, error: teamErr } = await supabase
          .from("teams")
          .select("id,name,slug,last_winner_member_id")
          .eq("slug", slug)
          .single();
        if (teamErr || !teamRow) throw teamErr || new Error("not found");
        setTeam(teamRow);
        await refreshMembers(teamRow.id);
      } catch (e) {
        console.error(e);
        setError("Команда не найдена. Создайте новую на главной.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const refreshMembers = async (teamId: string) => {
    const { data, error: mErr } = await supabase
      .from("members")
      .select("id,name,vacation")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });
    if (mErr) {
      console.error(mErr);
      setError("Не удалось загрузить участников");
      return;
    }
    setMembers(data || []);
  };

  const handleAddMember = async () => {
    if (!team) return;
    const trimmed = newMember.trim();
    if (!trimmed) return;
    const { error: addErr } = await supabase
      .from("members")
      .insert({ team_id: team.id, name: trimmed });
    if (addErr) {
      console.error(addErr);
      setError("Не удалось добавить участника");
      return;
    }
    setNewMember("");
    await refreshMembers(team.id);
  };

  const handleToggleVacation = async (member: Member, value: boolean) => {
    const { error: updErr } = await supabase
      .from("members")
      .update({ vacation: value })
      .eq("id", member.id);
    if (updErr) {
      console.error(updErr);
      setError("Не удалось обновить отпуск");
      return;
    }
    if (team) await refreshMembers(team.id);
  };

  const handleDeleteMember = async (member: Member) => {
    if (!team) return;
    const { error: delErr } = await supabase
      .from("members")
      .delete()
      .eq("id", member.id);
    if (delErr) {
      console.error(delErr);
      setError("Не удалось удалить участника");
      return;
    }
    if (team.last_winner_member_id === member.id) {
      await supabase
        .from("teams")
        .update({ last_winner_member_id: null })
        .eq("id", team.id);
      setTeam({ ...team, last_winner_member_id: null });
    }
    await refreshMembers(team.id);
  };

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
      setError("Не удалось сохранить название");
    } else {
      setTeam({ ...team, name: trimmed });
    }
    setSavingName(false);
  };

  const pool = useMemo(
    () => poolForToday(members, team?.last_winner_member_id ?? null),
    [members, team?.last_winner_member_id],
  );

  const handleSpin = async () => {
    if (!team) return;
    if (!pool.length) {
      setMessage("Добавьте участников");
      return;
    }
    const selected = pickRandom(pool);
    if (!selected) return;
    setSpinning(true);
    setWinnerId(null);
    setMessage("");

    setTimeout(async () => {
      setWinnerId(selected.id);
      setMessage(`Тебе повезло, ${selected.name}! 🎉`);
      const { error: updErr } = await supabase
        .from("teams")
        .update({ last_winner_member_id: selected.id })
        .eq("id", team.id);
      if (updErr) {
        console.error(updErr);
        setError("Не удалось сохранить результат");
      } else {
        setTeam({ ...team, last_winner_member_id: selected.id });
      }
      setSpinning(false);
    }, 2200);
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
        <p className="text-red-600">{error || "Команда не найдена"}</p>
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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-3 py-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <EditableTitle name={team.name} onSave={handleSaveName} saving={savingName} />
        <button
          onClick={() => router.push("/")}
          className="text-sm text-indigo-600 hover:underline"
        >
          Создать новую комнату
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-xl bg-white p-4 shadow flex flex-col items-center">
          <h3 className="mb-3 text-lg font-semibold">Колесо фортуны</h3>
          <FortuneWheel
            members={pool}
            spinning={spinning}
            winnerId={winnerId}
            lastWinnerId={team.last_winner_member_id}
          />
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="mt-3 rounded-full bg-emerald-600 px-6 py-2.5 text-base font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
          >
            Ему повезёт
          </button>
          {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
        </div>

        <div className="rounded-xl bg-white p-4 shadow flex flex-col gap-4">
          <div>
            <h3 className="mb-2 text-base font-semibold">Добавить участника</h3>
            <div className="flex gap-2">
              <input
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddMember();
                }}
                placeholder="Имя"
                className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddMember}
                className="whitespace-nowrap rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Добавить
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="mb-2 text-base font-semibold">Участники</h3>
            <div className="max-h-[340px] space-y-1 overflow-auto pr-1 text-sm">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded border border-slate-100 px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={member.vacation}
                      onChange={(e) =>
                        handleToggleVacation(member, e.target.checked)
                      }
                    />
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      {team.last_winner_member_id === member.id && (
                        <span className="text-[11px] text-amber-600">
                          Был в прошлый раз
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMember(member)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              ))}
              {!members.length && (
                <p className="text-xs text-slate-500">Пока нет участников.</p>
              )}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

function EditableTitle({
  name,
  onSave,
  saving,
}: {
  name: string;
  onSave: (value: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(name);
  return (
    <div className="flex items-center gap-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onSave(value)}
        className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-indigo-300 outline-none"
      />
      {saving && <span className="text-sm text-slate-500">Сохраняем...</span>}
    </div>
  );
}

function FortuneWheel({
  members,
  spinning,
  winnerId,
  lastWinnerId,
}: {
  members: Member[];
  spinning: boolean;
  winnerId: string | null;
  lastWinnerId: string | null;
}) {
  const colors = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e", "#06b6d4", "#a855f7", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316"];
  const gradient = useMemo(() => {
    if (!members.length) return "conic-gradient(#e2e8f0 0deg 360deg)";
    const slice = 360 / members.length;
    // Убеждаемся, что соседние сектора не имеют одинаковый цвет
    const colorIndices: number[] = [];
    members.forEach((m, idx) => {
      let colorIdx = idx % colors.length;
      // Проверяем предыдущий сектор
      if (idx > 0 && colorIdx === colorIndices[idx - 1]) {
        colorIdx = (colorIdx + 1) % colors.length;
      }
      // Проверяем, что не совпадает с предыдущим после сдвига
      if (idx > 0 && colorIdx === colorIndices[idx - 1]) {
        colorIdx = (colorIdx + 1) % colors.length;
      }
      colorIndices.push(colorIdx);
    });
    // Проверяем последний и первый сектора
    if (members.length > 1 && colorIndices[0] === colorIndices[colorIndices.length - 1]) {
      colorIndices[0] = (colorIndices[0] + 1) % colors.length;
    }
    const parts = members.map((m, idx) => {
      const start = idx * slice;
      const end = (idx + 1) * slice;
      const color = colors[colorIndices[idx]];
      return `${color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${parts.join(",")})`;
  }, [members, colors]);

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`relative h-128 w-128 rounded-full border-4 border-white shadow-inner transition-transform duration-500 ${
          spinning ? "animate-spin-slow" : ""
        }`}
        style={{ backgroundImage: gradient }}
      >
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        {members.map((m, idx) => {
          const slice = 360 / members.length;
          // Угол центра сектора - точно по середине
          const angle = idx * slice + slice / 2;
          // Нормализуем угол к 0-360
          const normalizedAngle = ((angle % 360) + 360) % 360;
          // Если угол в нижней половине (90-270), переворачиваем текст на 180 для читаемости
          const textFlip = normalizedAngle >= 90 && normalizedAngle <= 270 ? 180 : 0;
          // Радиус колеса 256px (h-128 w-128 = 512px / 2), размещаем имена на 70% от центра
          const radius = 180; // 70% от 256px
          // Вычисляем максимальную ширину текста на основе дуги сектора, с запасом
          const arcLength = (2 * Math.PI * radius * slice) / 360;
          const maxWidth = Math.min(arcLength * 0.8, 100); // 80% от длины дуги, но не больше 100px
          
          // Вычисляем позицию через тригонометрию для точного центрирования
          const angleRad = (angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;
          
          return (
            <div
              key={m.id}
              className="absolute text-sm font-semibold text-white drop-shadow-lg pointer-events-none"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${textFlip}deg)`,
                width: `${maxWidth}px`,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={m.name}
            >
              {m.name}
            </div>
          );
        })}
      </div>
      <div className="absolute -top-2 h-8 w-8 rotate-45 rounded bg-amber-500" />
      <p className="mt-3 text-sm text-slate-600">
        {members.length
          ? "В пуле: " + members.length
          : "Добавьте участников, чтобы крутить колесо"}
      </p>
      {winnerId && (
        <p className="text-sm text-emerald-700">
          Победитель: {members.find((m) => m.id === winnerId)?.name}
        </p>
      )}
      {lastWinnerId && (
        <p className="text-xs text-slate-500">Прошлый победитель исключён из пула</p>
      )}
    </div>
  );
}

