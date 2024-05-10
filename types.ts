export interface ToDoType {
  id: number;
  task: string;
  statusComplete: boolean;
}

export interface RequestBody {
  toDosArrayFull: ToDoType[];
  newTaskToAdd?: ToDoType; // only used in POST request (not in PUT or DELETE) in server/apiLayer.ts
}

export enum FilteredState {
  ALL = "All",
  ACTIVE = "Active",
  COMPLETED = "Completed",
}

// -----------

// Sample data
export const toDosArray: ToDoType[] = [
  { id: 1, task: "Sample Task 1", statusComplete: false },
  { id: 2, task: "Sample Task 2", statusComplete: false },
  { id: 3, task: "Sample Task 3", statusComplete: false },
  { id: 4, task: "Sample Task 4", statusComplete: false },
  { id: 5, task: "Sample Task 5", statusComplete: true },
  { id: 6, task: "Sample Task 6", statusComplete: false },
];
