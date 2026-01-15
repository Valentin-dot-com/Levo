import { UUID, Timestamptz } from "./primitives.model";

export type CalendarRole = 'owner' | 'editor';

export interface CalendarMembership {
  calendar_id: UUID;
  user_id: UUID;
  role?: CalendarRole;
  created_at?: Timestamptz | null;
}
