import { UUID, Timestamptz } from "./primitives.model";

export interface Profile {
  user_id: UUID;
  first_name?: string | null;
  last_name?: string | null;
  created_at?: Timestamptz | null;
}
