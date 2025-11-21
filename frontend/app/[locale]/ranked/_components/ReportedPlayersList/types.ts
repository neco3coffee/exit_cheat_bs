export type ReportedPlayerNameHistory = {
  id: number;
  name: string;
  icon_id?: string | null;
  changed_at: string;
};

export type ReportedPlayer = {
  tag: string;
  name: string;
  nameHistories: ReportedPlayerNameHistory[];
  icon_id: number | null;
  rank: number;
  trophies: number;
  approved_reports_count: number;
  reportedAt: string;
};
