import { Dispatch, SetStateAction, useEffect } from "react";
import axios from "axios";
import { ToDoType, FilteredState } from "../types";

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
  setToDosForDisplay(
    displayFilter === FilteredState.COMPLETED ? [] : apiResponse
  );
  if (displayFilter === FilteredState.COMPLETED) {
    setItemCount(0);
  }
};

// --------

// API endpoint requests, each triggered by a hook
function ApiRequests({
  setToDosArrayFull,
  toDosArrayFull,
  setToDosForDisplay,
  setItemCount,
  setNewTaskToAdd,
  newTaskToAdd,
  setIdToUpdateStatus,
  idToUpdateStatus,
  setIdToDelete,
  idToDelete,
}: {
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

      const body = document.body;
      body.classList.add("lightTheme");
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
          toDosArrayFull,
        })
      )?.data;
      setToDosArrayFull(apiResponse);
      setToDosForDisplay(apiResponse);
    };
    void addNewTask(); // @typescript-eslint/no-floating-promises <-- ADDED 'void' to eliminate linting error
    setNewTaskToAdd(null); // reset task object to be added to null (to prevent infinite dependency loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(newTaskToAdd)]);

  // UPDATE
  useEffect(() => {
    if (idToUpdateStatus === null) return; // early exit if no ID provided to update its status

    const updateTaskStatus = async () => {
      const apiResponse: ToDoType[] = (
        await axios.put<ToDoType[]>(
          `/api/updateTodoStatus/${idToUpdateStatus}`,
          {
            toDosArrayFull,
          }
        )
      )?.data;
      setToDosArrayFull(apiResponse);
      setToDosForDisplay(apiResponse);
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
        await axios.delete<ToDoType[]>(`/api/deleteTodo/${idToDelete}`, {
          data: { toDosArrayFull },
        })
      )?.data;
      setToDosArrayFull(apiResponse);
      setToDosForDisplay(apiResponse);
    };
    void deleteTask(); // @typescript-eslint/no-floating-promises <-- ADDED 'void' to eliminate linting error
    setIdToDelete(null); // reset ID to delete (to prevent infinite dependency loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToDelete]);
}

export default ApiRequests;
