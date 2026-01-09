import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Team, Member } from "@/types";
import { ERROR_MESSAGES } from "@/constants";

export function useTeamMembers(team: Team | null, refreshMembers: () => Promise<void>) {
  const [newMember, setNewMember] = useState("");
  const [error, setError] = useState("");

  const handleAddMember = async () => {
    if (!team) return;

    const trimmed = newMember.trim();
    if (!trimmed) return;

    const { error: addErr } = await supabase
      .from("members")
      .insert({ team_id: team.id, name: trimmed });

    if (addErr) {
      console.error(addErr);
      setError(ERROR_MESSAGES.FAILED_TO_ADD_MEMBER);
      return;
    }

    setNewMember("");
    setError("");
    await refreshMembers();
  };

  const handleToggleVacation = async (member: Member, value: boolean) => {
    const { error: updErr } = await supabase
      .from("members")
      .update({ vacation: value })
      .eq("id", member.id);

    if (updErr) {
      console.error(updErr);
      setError(ERROR_MESSAGES.FAILED_TO_UPDATE_VACATION);
      return;
    }

    setError("");
    await refreshMembers();
  };

  const handleDeleteMember = async (
    member: Member,
    team: Team,
    setTeam: (team: Team) => void
  ) => {
    if (!team) return;

    const { error: delErr } = await supabase
      .from("members")
      .delete()
      .eq("id", member.id);

    if (delErr) {
      console.error(delErr);
      setError(ERROR_MESSAGES.FAILED_TO_DELETE_MEMBER);
      return;
    }

    // Если удаляемый участник был последним победителем, очищаем это поле
    if (team.last_winner_member_id === member.id) {
      await supabase
        .from("teams")
        .update({ last_winner_member_id: null })
        .eq("id", team.id);
      setTeam({ ...team, last_winner_member_id: null });
    }

    setError("");
    await refreshMembers();
  };

  return {
    newMember,
    setNewMember,
    error,
    handleAddMember,
    handleToggleVacation,
    handleDeleteMember,
  };
}
