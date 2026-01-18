import { BoardItem } from "./board-item.model";
import { UUID } from "./primitives.model";

export interface Board {
  id: UUID;
  owner_id: UUID;
  calendar_id: UUID;
  title: string;
  parent_board_id: UUID;
  order_index: number;
}

export interface CreateBoard {
  calendar_id: UUID;
  title: string;
}

export interface CreateSubBoard extends CreateBoard {
  parent_board_id: UUID;
  order_index: number;
}

export interface BoardWithDetails {
  board: Board | null;
  subBoards: Board[];
  boardItem: BoardItem | null;
  parentBoard: Board | null;
}
