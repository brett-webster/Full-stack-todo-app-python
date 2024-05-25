import { Dispatch, SetStateAction, useEffect, RefObject } from "react";
import axios from "axios";
import { ToDoType, FilteredState } from "../types";
import { applyFilterToApiResponse } from "./filterLogic";

// --------

// DELETE - ALL COMPLETED TASKS (triggered by button click on 'Clear Completed')
export const deleteAllCompletedTodos = async ({
  setToDosArrayFull,
  toDosArrayFull,
  setToDosForDisplay,
  setItemCount,
  displayFilter,
}: {
  setToDosArrayFull: Dispatch<SetStateAction<ToDoType[]>>;
  toDosArrayFull: ToDoType[];
  setToDosForDisplay: Dispatch<SetStateAction<ToDoType[]>>;
  setItemCount: Dispatch<SetStateAction<number | null>>;
  displayFilter: FilteredState;
}): Promise<void> => {
  const apiResponse: ToDoType[] = (
    await axios.delete<ToDoType[]>(`/api/deleteAllCompletedTodos`, {
      data: { toDosArrayFull },
    })
  )?.data;
  setToDosArrayFull(apiResponse);
  const filteredTasksArray: ToDoType[] = applyFilterToApiResponse({
    displayFilter,
    apiResponse,
    setItemCount,
  });
  setToDosForDisplay(filteredTasksArray);
};

// PATCH - store/persist new sorting order in DB post successful DnD
export const updateSortingOrderPostDnD = async ({
  toDosArrayFull,
}: {
  toDosArrayFull: ToDoType[];
}): Promise<void> => {
  await axios.patch<ToDoType[]>(`/api/updateSortingOrderPostDnD`, {
    toDosArrayFull,
  });
};

// --------

// API endpoint requests, each triggered by a hook
function ApiRequests({
  setTotalTaskCount,
  setToDosArrayFull,
  setToDosForDisplay,
  setItemCount,
  setNewTaskToAdd,
  newTaskToAdd,
  setIdToUpdateStatus,
  idToUpdateStatus,
  setIdToDelete,
  idToDelete,
  setDisplayFilter,
  displayFilter,
  allFilterButtonRef,
}: {
  setTotalTaskCount: Dispatch<SetStateAction<number | null>>;
  setToDosArrayFull: Dispatch<SetStateAction<ToDoType[]>>;
  toDosArrayFull: ToDoType[];
  setToDosForDisplay: Dispatch<SetStateAction<ToDoType[]>>;
  setItemCount: Dispatch<SetStateAction<number | null>>;
  setNewTaskToAdd: Dispatch<SetStateAction<ToDoType | null>>;
  newTaskToAdd: ToDoType | null;
  setIdToUpdateStatus: Dispatch<SetStateAction<number | null>>;
  idToUpdateStatus: number | null;
  setIdToDelete: Dispatch<SetStateAction<number | null>>;
  idToDelete: number | null;
  setDisplayFilter: Dispatch<SetStateAction<FilteredState>>;
  displayFilter: FilteredState;
  allFilterButtonRef: RefObject<HTMLButtonElement>;
}): void {
  // READ (on initial page load only)
  useEffect(() => {
    const initialLoadOnly = async () => {
      const apiResponse: ToDoType[] = (
        await axios.get<ToDoType[]>("/api/allTodos")
      )?.data;
      setToDosArrayFull(apiResponse);
      setToDosForDisplay(apiResponse);

      const taskCountRemaining: number = apiResponse.filter(
        (toDo) => toDo.statusComplete === false
      ).length; // Tasks remaining
      setItemCount(taskCountRemaining);
      setTotalTaskCount(apiResponse.length); // used to track and create unique IDs (avoiding dups in case of deletions)
      allFilterButtonRef.current?.focus(); // added to re-focus on the 'All' filter button

      const body = document.body;
      const newTaskInputNode = document.querySelector("#newTaskInput");
      const toDoListTableNode = document.querySelector("#toDoListTable");
      if (!body || !newTaskInputNode || !toDoListTableNode) return; // early exit if any elements are null
      body.classList.add("lightTheme");
      newTaskInputNode.classList.add("lightTheme");
      toDoListTableNode.classList.add("lightTheme");
    };
    void initialLoadOnly(); // @typescript-eslint/no-floating-promises <-- ADDED 'void' to eliminate linting error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // on initial page load only

  // CREATE
  useEffect(() => {
    if (newTaskToAdd === null) return; // early exit if no new task object is provided

    const addNewTask = async () => {
      const apiResponse: ToDoType[] = (
        await axios.post<ToDoType[]>(`/api/addNewTask`, {
          newTaskToAdd,
        })
      )?.data;
      setToDosArrayFull(apiResponse);
      setToDosForDisplay(apiResponse);
      const incrementedActiveTaskCount: number = apiResponse.filter(
        (toDo) => toDo.statusComplete === false
      ).length;
      setItemCount(incrementedActiveTaskCount);
    };
    void addNewTask(); // @typescript-eslint/no-floating-promises <-- ADDED 'void' to eliminate linting error
    setNewTaskToAdd(null); // reset task object to be added to null (to prevent infinite dependency loop)
    setDisplayFilter(FilteredState.ALL); // reset filter to 'All' after adding a new task (on any filter)
    allFilterButtonRef.current?.focus(); // added to focus on the 'All' filter button on page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(newTaskToAdd)]);

  // UPDATE
  useEffect(() => {
    if (idToUpdateStatus === null) return; // early exit if no ID provided to update its status

    const updateTaskStatus = async () => {
      const apiResponse: ToDoType[] = (
        await axios.patch<ToDoType[]>(
          `/api/updateTodoStatus/${idToUpdateStatus}`
        )
      )?.data;
      setToDosArrayFull(apiResponse);
      const filteredTasksArray: ToDoType[] = applyFilterToApiResponse({
        displayFilter,
        apiResponse,
        setItemCount,
      });
      setToDosForDisplay(filteredTasksArray);
    };
    void updateTaskStatus(); // @typescript-eslint/no-floating-promises <-- ADDED 'void' to eliminate linting error
    setIdToUpdateStatus(null); // reset ID to update (to prevent infinite dependency loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToUpdateStatus]);

  // DELETE - SINGLE TASK
  useEffect(() => {
    if (idToDelete === null) return; // early exit if no ID to delete

    const deleteTask = async () => {
      const apiResponse: ToDoType[] = (
        await axios.delete<ToDoType[]>(`/api/deleteTodo/${idToDelete}`)
      )?.data;
      setToDosArrayFull(apiResponse);
      const filteredTasksArray: ToDoType[] = applyFilterToApiResponse({
        displayFilter,
        apiResponse,
        setItemCount,
      });
      setToDosForDisplay(filteredTasksArray);
    };
    void deleteTask(); // @typescript-eslint/no-floating-promises <-- ADDED 'void' to eliminate linting error
    setIdToDelete(null); // reset ID to delete (to prevent infinite dependency loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToDelete]);
}

export default ApiRequests;
