import { UUID } from "./primitives";

export type BoardRole = 'owner' | 'editor' | 'viewer';

export interface Board {
  id: UUID;
  owner_id: UUID;
  calendar_id: UUID;
  title: string;
}
