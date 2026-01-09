"use client";

import type { Team, Member } from "@/types";

interface MembersListProps {
  team: Team;
  members: Member[];
  newMember: string;
  onNewMemberChange: (value: string) => void;
  onAddMember: () => void;
  onToggleVacation: (member: Member, value: boolean) => void;
  onDeleteMember: (member: Member) => void;
}

export function MembersList({
  team,
  members,
  newMember,
  onNewMemberChange,
  onAddMember,
  onToggleVacation,
  onDeleteMember,
}: MembersListProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onAddMember();
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-base font-semibold">Добавить участника</h3>
        <div className="flex gap-2">
          <input
            value={newMember}
            onChange={(e) => onNewMemberChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Имя"
            className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={onAddMember}
            className="whitespace-nowrap rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Добавить
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <div className="mb-2 grid grid-cols-[1fr_40px_60px] items-center gap-3 px-2">
          <h3 className="text-base font-semibold">Участники</h3>
          <div className="flex justify-center">
            <span className="text-xs text-slate-500">Исключить</span>
          </div>
          <div></div>
        </div>
        <div className="space-y-1 text-sm">
          {members.map((member) => (
            <div
              key={member.id}
              className="group grid grid-cols-[1fr_40px_60px] items-center gap-3 rounded border border-slate-100 px-2 py-1.5 hover:bg-slate-50"
            >
              <div className="flex flex-col min-w-0">
                <span className="truncate">{member.name}</span>
                {team.last_winner_member_id === member.id && (
                  <span className="text-[11px] text-amber-600">
                    Последний победитель
                  </span>
                )}
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={member.vacation}
                  onChange={(e) => onToggleVacation(member, e.target.checked)}
                />
              </div>
              <button
                onClick={() => onDeleteMember(member)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-600 hover:underline text-left"
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
  );
}
