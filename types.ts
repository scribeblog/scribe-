export interface Blog {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  created_at: string;
}

export interface DayData {
  date: Date;
  hasPost: boolean;
  isCurrentMonth: boolean;
}