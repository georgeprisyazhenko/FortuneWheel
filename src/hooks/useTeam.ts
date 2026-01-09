import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Team, Member } from "@/types";
import { ERROR_MESSAGES } from "@/constants";

export function useTeam(slug: string) {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshMembers = useCallback(async (teamId: string) => {
    const { data, error: mErr } = await supabase
      .from("members")
      .select("id,name,vacation")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    if (mErr) {
      console.error(mErr);
      setError(ERROR_MESSAGES.FAILED_TO_LOAD_MEMBERS);
      return;
    }

    setMembers(data || []);
  }, []);

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

        if (teamErr || !teamRow) {
          throw teamErr || new Error("not found");
        }

        setTeam(teamRow);
        await refreshMembers(teamRow.id);
      } catch (e) {
        console.error(e);
        setError(ERROR_MESSAGES.TEAM_NOT_FOUND);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, refreshMembers]);

  return {
    team,
    members,
    loading,
    error,
    setTeam,
    refreshMembers,
  };
}
