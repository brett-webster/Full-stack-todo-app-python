import { ToDoType, FilteredState } from "../types";

// Frontend filter logic -- exported for use in ToDoListContainer.tsx
export const filterAll = ({
  setToDosForDisplay,
  setDisplayFilter,
  setItemCount,
  toDosArrayFull,
}: {
  setToDosForDisplay: (value: ToDoType[]) => void;
  setDisplayFilter: (value: FilteredState) => void;
  setItemCount: (value: number) => void;
  toDosArrayFull: ToDoType[];
}): void => {
  setToDosForDisplay(toDosArrayFull);
  setDisplayFilter(FilteredState.ALL);

  const taskCountRemaining: number = toDosArrayFull.filter(
    (toDo) => toDo.statusComplete === false
  ).length; // Tasks remaining
  setItemCount(taskCountRemaining);
};

export const filterActiveOnly = ({
  setToDosForDisplay,
  setDisplayFilter,
  setItemCount,
  toDosArrayFull,
}: {
  setToDosForDisplay: (value: ToDoType[]) => void;
  setDisplayFilter: (value: FilteredState) => void;
  setItemCount: (value: number) => void;
  toDosArrayFull: ToDoType[];
}): void => {
  const activeTasks: ToDoType[] = toDosArrayFull.filter(
    (toDo) => !toDo.statusComplete
  );
  setToDosForDisplay(activeTasks);
  setDisplayFilter(FilteredState.ACTIVE);

  const taskCountRemaining: number = toDosArrayFull.filter(
    (toDo) => toDo.statusComplete === false
  ).length; // Tasks remaining
  setItemCount(taskCountRemaining);
};

export const filterCompletedOnly = ({
  setToDosForDisplay,
  setDisplayFilter,
  setItemCount,
  toDosArrayFull,
}: {
  setToDosForDisplay: (value: ToDoType[]) => void;
  setDisplayFilter: (value: FilteredState) => void;
  setItemCount: (value: number) => void;
  toDosArrayFull: ToDoType[];
}): void => {
  const completedTasks: ToDoType[] = toDosArrayFull.filter(
    (toDo) => toDo.statusComplete
  );
  setToDosForDisplay(completedTasks);
  setDisplayFilter(FilteredState.COMPLETED);

  const taskCountCompleted: number = toDosArrayFull.filter(
    (toDo) => toDo.statusComplete === true
  ).length; // Tasks completed
  setItemCount(taskCountCompleted);
};
