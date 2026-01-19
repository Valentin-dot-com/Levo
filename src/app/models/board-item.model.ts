import { JSONContent } from "@tiptap/core";
import { UUID } from "./primitives.model";

export interface BoardItem {
  id: UUID;
  board_id: UUID;
  content: JSONContent;
  created_by: UUID;
  created_at: Date;
  updated_at: Date;
}
