import { UUID } from "./primitives.model";

export interface Board {
  id: UUID;
  owner_id: UUID;
  calendar_id: UUID;
  title: string;
}

export interface CreateBoard {
  calendar_id: UUID;
  title: string;
}
