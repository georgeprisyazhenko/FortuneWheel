export type Member = {
  id: string;
  name: string;
  vacation: boolean;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  last_winner_member_id: string | null;
};
