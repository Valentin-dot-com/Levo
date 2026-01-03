import { Timestamptz, UUID } from "./primitives";

export interface Calendar {
  id: UUID;
  owner_id: UUID;
  name: string;
  is_shared?: boolean | null;
  created_at?: Timestamptz | null;
}
