import { Timestamptz, UUID } from "./primitives";

export interface Calendar {
  id: UUID;
  owner_id: UUID;
  name: string;
  is_shared?: boolean | null;
  created_at?: Timestamptz | null;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  weekdayLabel: string;
  weekdayIndex: number;
  inMonth: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface CalendarWeek {
  start: Date;
  end: Date;
  weekNumber: number;
  year: number;
  monthKey: string;
  monthLabel: string;
  days: CalendarDay[];
}

export interface CalendarMonth {
  id: string;
  date: Date;
  name: string;
  monthNumber: number;
  year: number;
  days: CalendarDay[];
  weeks: CalendarWeek[];
}
