import { RefObject } from "react";
export interface ToDoType {
  id: number;
  newSortedRank?: number; // only for DnD (in src/ToDosTableDnD.tsx) to re-shuffle order & send to backend for storage in DB
  task: string;
  statusComplete: boolean;
}

export interface ToDoTypeBackend {
  id: number;
  sorted_rank: number;
  task: string;
  status_complete: boolean;
}

export interface RequestBody {
  toDosArrayFull: ToDoType[];
  newTaskToAdd?: ToDoType; // only used in POST request (not in PATCH or DELETE) in server/apiLayer.ts
}

export enum Mode {
  LIGHT = "light",
  DARK = "dark",
}

export enum FilteredState {
  ALL = "All",
  ACTIVE = "Active",
  COMPLETED = "Completed",
}

export interface FilterButtonRefsType {
  displayFilter: FilteredState;
  completedFilterButtonRef: RefObject<HTMLButtonElement>;
  activeFilterButtonRef: RefObject<HTMLButtonElement>;
  allFilterButtonRef: RefObject<HTMLButtonElement>;
}
