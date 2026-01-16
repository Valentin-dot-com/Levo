// responses.ts
import { Board } from './board.model';
import { Calendar } from './calendar.model';
import { CalendarMembership } from './calendarMembership.model';
import { Event } from './event.model';
import { UUID, DateOnly, Timestamptz } from './primitives.model';

export interface CalendarWithEvents extends Calendar {
  events: Event[];
  membership?: CalendarMembership;
}

export interface CalendarsResponse {
  calendars: Calendar[];
  total: number;
}

export interface MonthlyEventsResponse {
  month: string;
  startDate: string;
  endDate: string;
  events: Event[];
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

export interface CreateEventInput {
  calendar_id: UUID;
  created_by: UUID;
  title: string;
  description?: string;
  location?: string;
  date?: DateOnly;
  scheduled_at?: Timestamptz;
}

export interface UpdateEventInput {
  id: UUID;
  title?: string;
  description?: string | null;
  location?: string | null;
  date?: DateOnly | null;
  scheduled_at?: Timestamptz | null;
}
