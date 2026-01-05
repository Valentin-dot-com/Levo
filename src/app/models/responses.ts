// responses.ts
import { Board } from './board';
import { Calendar } from './calendar.model';
import { CalendarMembership } from './calendarMembership';
import { UUID, DateOnly, Timestamptz } from './primitives';
import { Task, TaskStatus } from './task';

export interface CalendarWithTasks extends Calendar {
  tasks: Task[];
  membership?: CalendarMembership;
}

export interface CalendarsResponse {
  calendars: Calendar[];
  total: number;
}

export interface MonthlyTasksResponse {
  month: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  total: number;
}

export interface BoardsResponse {
  boards: Board[];
  total: number;
}

// DTOs for creating/updating
// Properties marked with ? does not need to be set.
// Properties marked as nullable can be null.

export interface CreateCalendarInput {
  name: string;
  is_shared?: boolean;
  owner_id: UUID;
}

export interface CreateTaskInput {
  calendar_id: UUID;
  created_by: UUID;
  title: string;
  description?: string;
  location?: string;
  date?: DateOnly;
  scheduled_at?: Timestamptz;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  id: UUID;
  title?: string;
  description?: string | null;
  location?: string | null;
  date?: DateOnly | null;
  scheduled_at?: Timestamptz | null;
  status?: TaskStatus;
}
