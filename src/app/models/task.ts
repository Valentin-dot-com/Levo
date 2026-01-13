import { UUID, DateOnly, Timestamptz } from "./primitives";

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: UUID;
  calendar_id: UUID;
  created_by: UUID;
  title: string;
  description?: string | null;
  location?: string | null;
  date?: DateOnly | null;
  scheduled_at?: Timestamptz | null;
  created_at?: Timestamptz | null;
  updated_at?: Timestamptz | null;
  status?: TaskStatus;
}

export interface CreateTask {
  calendar_id: UUID;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  scheduled_at: string | null;
}
