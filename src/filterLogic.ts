import { Dispatch, SetStateAction } from "react";
import { ToDoType, FilteredState, FilterButtonRefsType } from "../types";

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
}): ToDoType[] => {
  const activeTasks: ToDoType[] = toDosArrayFull.filter(
    (toDo) => !toDo.statusComplete
  );
  setToDosForDisplay(activeTasks);
  setDisplayFilter(FilteredState.ACTIVE);

  const taskCountRemaining: number = toDosArrayFull.filter(
    (toDo) => toDo.statusComplete === false
  ).length; // Tasks remaining
  setItemCount(taskCountRemaining);
  return activeTasks; // NOTE: only adding in return value for testing purposes, return value NOT used in app
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
}): ToDoType[] => {
  const completedTasks: ToDoType[] = toDosArrayFull.filter(
    (toDo) => toDo.statusComplete
  );
  setToDosForDisplay(completedTasks);
  setDisplayFilter(FilteredState.COMPLETED);

  const taskCountCompleted: number = toDosArrayFull.filter(
    (toDo) => toDo.statusComplete === true
  ).length; // Tasks completed
  setItemCount(taskCountCompleted);
  return completedTasks; // NOTE: only adding in return value for testing purposes, return value NOT used in app
};

// ----------

// Added to re-focus on the currently selected filter button (restoring formatting after clicking away to a non-filter destination)
// exported for use in both ToDoListContainer.tsx & apiRequests.ts
export const reapplyFilterFocus = ({
  displayFilter,
  completedFilterButtonRef,
  activeFilterButtonRef,
  allFilterButtonRef,
}: FilterButtonRefsType): void => {
  switch (displayFilter) {
    case FilteredState.COMPLETED:
      completedFilterButtonRef?.current?.focus(); // added to re-focus on the 'Active' filter button
      break;
    case FilteredState.ACTIVE:
      activeFilterButtonRef?.current?.focus(); // added to re-focus on the 'Active' filter button
      break;
    case FilteredState.ALL:
      allFilterButtonRef?.current?.focus(); // added to re-focus on the 'All' filter button
      break;
    default:
    // intentionally empty as enum is exhaustive
  }
};

// ----------

// Helper function to apply current filter to API response (used for PUT, DELETE - SINGLE TASK)
// exported for use in apiRequests.ts
export const applyFilterToApiResponse = ({
  displayFilter,
  apiResponse,
  setItemCount,
}: {
  displayFilter: FilteredState;
  apiResponse: ToDoType[];
  setItemCount: Dispatch<SetStateAction<number | null>>;
}): ToDoType[] => {
  let filteredTasksArray: ToDoType[] = []; // using let here to allow for reassignment
  switch (displayFilter) {
    case FilteredState.COMPLETED:
      filteredTasksArray = apiResponse.filter(
        (toDo) => toDo.statusComplete === true
      );
      break;
    case FilteredState.ACTIVE:
      filteredTasksArray = apiResponse.filter(
        (toDo) => toDo.statusComplete === false
      );
      break;
    // .ALL is equivalent to .ACTIVE in terms of filtering count, but still need to return ENTIRE task list
    case FilteredState.ALL:
      filteredTasksArray = apiResponse.filter(
        (toDo) => toDo.statusComplete === false
      );
      break;
    default:
    // intentionally empty as enum is exhaustive
  }
  setItemCount(filteredTasksArray.length); // also need to re-set the item count so it does not go stale
  return displayFilter === FilteredState.ALL ? apiResponse : filteredTasksArray;
};
