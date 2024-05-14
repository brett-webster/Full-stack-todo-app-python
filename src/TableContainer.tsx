import { Dispatch, SetStateAction, RefObject } from "react";
import { Container, Paper, Text, Button, Group } from "@mantine/core";
import { FilteredState, Mode, ToDoType } from "../types";
import { deleteAllCompletedTodos } from "./apiRequests";
import {
  filterAll,
  filterActiveOnly,
  filterCompletedOnly,
} from "./filterLogic"; // Frontend filter logic
import ToDosTable from "./ToDosTable"; // Static tables applied for 'Active/Completed' filters
import ToDosTableDnD from "./ToDosTableDnD"; // DnD only applied for 'All' filter

// To Do Table + Filter/Task count Footer + DnD text @ far bottom -- exported for use in ToDoListContainer.tsx
function TableContainer({
  mode,
  setToDosArrayFull,
  toDosArrayFull,
  setToDosForDisplay,
  toDosForDisplay,
  setItemCount,
  itemCount,
  setDisplayFilter,
  displayFilter,
  setIdToUpdateStatus,
  setIdToDelete,
  allFilterButtonRef,
  activeFilterButtonRef,
  completedFilterButtonRef,
}: {
  mode: Mode;
  setToDosArrayFull: Dispatch<SetStateAction<ToDoType[]>>;
  toDosArrayFull: ToDoType[];
  setToDosForDisplay: Dispatch<SetStateAction<ToDoType[]>>;
  toDosForDisplay: ToDoType[];
  setItemCount: Dispatch<SetStateAction<number | null>>;
  itemCount: number | null;
  setDisplayFilter: Dispatch<SetStateAction<FilteredState>>;
  displayFilter: FilteredState;
  setIdToUpdateStatus: Dispatch<SetStateAction<number | null>>;
  setIdToDelete: Dispatch<SetStateAction<number | null>>;
  allFilterButtonRef: RefObject<HTMLButtonElement>;
  activeFilterButtonRef: RefObject<HTMLButtonElement>;
  completedFilterButtonRef: RefObject<HTMLButtonElement>;
}): JSX.Element {
  return (
    <Container className="toDoListTableContainer">
      <Paper
        withBorder
        shadow="lg"
        radius="md"
        p="xl"
        className="toDoListTable"
      >
        {/* DISPLAY TABLE - allow DnD for 'All' filter, static display for 'Active/Completed' filters (tracking/reconciling re-ordering of partial lists is complicated) */}
        {displayFilter === FilteredState.ALL ? (
          <ToDosTableDnD
            setToDosForDisplay={setToDosForDisplay}
            toDosForDisplay={toDosForDisplay}
            setToDosArrayFull={setToDosArrayFull}
            mode={mode}
            setIdToUpdateStatus={setIdToUpdateStatus}
            setIdToDelete={setIdToDelete}
          />
        ) : (
          <ToDosTable
            toDosForDisplay={toDosForDisplay}
            mode={mode}
            setIdToUpdateStatus={setIdToUpdateStatus}
            setIdToDelete={setIdToDelete}
          />
        )}

        {/* FOOTER -- TASK COUNT, FILTERS, CLEAR COMPLETED TASKS */}
        <Group position="apart">
          <Text
            fz="xs"
            c="dimmed"
            style={{
              fontFamily: '"Josefin Sans", sans-serif',
              fontSize: "14px",
              fontWeight: "400",
              color: mode === Mode.LIGHT ? "lightgrey" : "grey",
            }}
          >
            {itemCount} {itemCount === 1 ? "item" : "items"}{" "}
            {displayFilter === FilteredState.COMPLETED
              ? "completed"
              : "remaining"}
          </Text>

          {/* 3 FILTER BUTTONS */}
          <Group className="filterButtonGroup" position="center" spacing="xs">
            <Button
              ref={allFilterButtonRef}
              className="filterButton"
              onClick={() =>
                filterAll({
                  setToDosForDisplay,
                  setDisplayFilter,
                  setItemCount,
                  toDosArrayFull,
                })
              }
            >
              All
            </Button>
            <Button
              ref={activeFilterButtonRef}
              className="filterButton"
              onClick={() =>
                filterActiveOnly({
                  setToDosForDisplay,
                  setDisplayFilter,
                  setItemCount,
                  toDosArrayFull,
                })
              }
            >
              Active
            </Button>
            <Button
              ref={completedFilterButtonRef}
              className="filterButton"
              onClick={() =>
                filterCompletedOnly({
                  setToDosForDisplay,
                  setDisplayFilter,
                  setItemCount,
                  toDosArrayFull,
                })
              }
            >
              Completed
            </Button>
          </Group>

          {/* CLEAR COMPLETED BUTTON */}
          <Button
            id="clearCompletedButton"
            onClick={() => {
              void deleteAllCompletedTodos({
                setToDosArrayFull,
                toDosArrayFull,
                setToDosForDisplay,
                setItemCount,
                displayFilter,
              });
            }}
          >
            Clear Completed
          </Button>
        </Group>
      </Paper>
      {/* DnD only available when 'All' filter is applied */}
      {displayFilter === FilteredState.ALL && (
        <Text
          style={{
            fontFamily: '"Josefin Sans", sans-serif',
            fontSize: "14px",
            fontWeight: "400",
            color: mode === Mode.LIGHT ? "lightgrey" : "grey",
            marginTop: "30px",
          }}
        >
          Drag and drop to reorder list
        </Text>
      )}
    </Container>
  );
}

export default TableContainer;
