import { UUID, DateOnly, Timestamptz, Time } from "./primitives.model";

export interface Event {
  id: UUID;
  calendar_id: UUID;
  created_by: UUID;
  title: string;
  description?: string | null;
  location?: string | null;
  date?: DateOnly | null;
  scheduled_at?: Time | null;
  created_at?: Timestamptz | null;
  updated_at?: Timestamptz | null;
}

export interface CreateEvent {
  calendar_id: UUID;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  scheduled_at: string | null;
}
