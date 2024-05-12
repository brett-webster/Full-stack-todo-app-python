import {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  KeyboardEvent,
  useEffect,
} from "react";
import { Input } from "@mantine/core";
import { ToDoType, FilteredState, Mode } from "../types";
import ApiRequests from "./apiRequests";
import { reapplyFilterFocus } from "./filterLogic"; // Frontend filter logic
import ToDoHeader from "./ToDoHeader";
import TableContainer from "./TableContainer";

// --------

function ToDoListContainer({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
}): JSX.Element {
  // State variables
  const [totalTaskCount, setTotalTaskCount] = useState<number | null>(null);
  const [toDosArrayFull, setToDosArrayFull] = useState<ToDoType[]>([]);
  const [toDosForDisplay, setToDosForDisplay] = useState<ToDoType[]>([]);
  const [taskInput, setTaskInput] = useState<string>("");
  const [newTaskToAdd, setNewTaskToAdd] = useState<ToDoType | null>(null);
  const [idToUpdateStatus, setIdToUpdateStatus] = useState<number | null>(null);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [displayFilter, setDisplayFilter] = useState<FilteredState>(
    FilteredState.ALL
  );
  const [itemCount, setItemCount] = useState<number | null>(null);

  // Below 3 used to re-focus on the current filter button after 'Clear Completed' button is clicked (or other non-filter re-focus action is taken)
  const allFilterButtonRef = useRef<HTMLButtonElement>(null);
  const activeFilterButtonRef = useRef<HTMLButtonElement>(null);
  const completedFilterButtonRef = useRef<HTMLButtonElement>(null);

  // -- API endpoint requests, each triggered by a hook --
  ApiRequests({
    setTotalTaskCount,
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
    displayFilter,
    allFilterButtonRef,
  });

  // --------

  // Restore focus to appropriate filter upon clicking away from the filter buttons (to maintain visual indication of selected filter)
  useEffect(() => {
    const handleClick = () => {
      if (document.activeElement?.id !== "newTaskInput") {
        void reapplyFilterFocus({
          displayFilter,
          completedFilterButtonRef,
          activeFilterButtonRef,
          allFilterButtonRef,
        }); // added to re-focus on the most recently selected filter button
      }
    };
    document.body.addEventListener("click", handleClick);

    // Clean up event listener when component unmounts
    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, [displayFilter]);

  // helper fxn -- if the user presses the 'Enter' key, increment the total task counter & use this to create a new task using 'setNewTaskToAdd'
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      if (!totalTaskCount || taskInput === "") return; // early exit if totalTaskCount is null (shouldn't happen, but just in case) or if taskInput is empty
      setTotalTaskCount((totalTaskCount: number | null) =>
        totalTaskCount ? totalTaskCount + 1 : 1
      ); // NOTE: resetting state here does NOT take effect immediately, as there is a lag in incrementing state (hence + 1 below)
      setNewTaskToAdd({
        id: totalTaskCount + 1,
        task: taskInput,
        statusComplete: false,
      });
      setTaskInput(""); // clear the input field after adding the new task
    }
  };

  // --------

  return (
    <>
      {/* HEADER -- TITLE & LIGHT/DARK MODE ICON */}
      <ToDoHeader mode={mode} setMode={setMode} />

      {/* NEW TASK INPUT FIELD */}
      <Input
        placeholder="Add a new task"
        radius="md"
        id="newTaskInput"
        value={taskInput}
        onChange={(event) => setTaskInput(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />

      {/* TO DO LIST TABLE CONTENTS - TABLE + FILTER BUTTONS + DnD TEXT at BOTTOM */}
      <TableContainer
        mode={mode}
        setToDosArrayFull={setToDosArrayFull}
        toDosArrayFull={toDosArrayFull}
        setToDosForDisplay={setToDosForDisplay}
        toDosForDisplay={toDosForDisplay}
        setItemCount={setItemCount}
        itemCount={itemCount}
        setDisplayFilter={setDisplayFilter}
        displayFilter={displayFilter}
        setIdToUpdateStatus={setIdToUpdateStatus}
        setIdToDelete={setIdToDelete}
        allFilterButtonRef={allFilterButtonRef}
        activeFilterButtonRef={activeFilterButtonRef}
        completedFilterButtonRef={completedFilterButtonRef}
      />
    </>
  );
}

export default ToDoListContainer;
