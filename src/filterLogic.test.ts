import { ToDoType } from "../types";
import { filterActiveOnly, filterCompletedOnly } from "./filterLogic";

// Provided below are several sample Jest unit tests (intentionally not a comprehensive test suite, for illustrative purposes only)

// ---------

// NOTE: typically would place test inputs/outputs in a separate fixtures.js file
const sampleToDosArrayInput1: ToDoType[] = [
  { id: 1, task: "Sample Task 1", statusComplete: true },
  { id: 2, task: "Sample Task 2", statusComplete: false },
  { id: 3, task: "Sample Task 3", statusComplete: false },
  { id: 4, task: "Sample Task 4", statusComplete: false },
  { id: 5, task: "Sample Task 5", statusComplete: true },
  { id: 6, task: "Sample Task 6", statusComplete: false },
];
const sampleToDosArrayInput2: ToDoType[] = [];

const activeTaskOutput: ToDoType[] = [
  { id: 2, task: "Sample Task 2", statusComplete: false },
  { id: 3, task: "Sample Task 3", statusComplete: false },
  { id: 4, task: "Sample Task 4", statusComplete: false },
  { id: 6, task: "Sample Task 6", statusComplete: false },
];
const completedTaskOutput: ToDoType[] = [
  { id: 1, task: "Sample Task 1", statusComplete: true },
  { id: 5, task: "Sample Task 5", statusComplete: true },
];

// ---------

describe("filterActiveOnly", () => {
  // Mocks setup
  let setToDosForDisplay: jest.Mock;
  let setDisplayFilter: jest.Mock;
  let setItemCount: jest.Mock;
  beforeAll(() => {
    setToDosForDisplay = jest.fn();
    setDisplayFilter = jest.fn();
    setItemCount = jest.fn();
  });

  it("should filter & return ACTIVE tasks (non-empty input)", () => {
    const toDosArrayFull: ToDoType[] = sampleToDosArrayInput1;
    const filteredTaskResults: ToDoType[] = filterActiveOnly({
      setToDosForDisplay,
      setDisplayFilter,
      setItemCount,
      toDosArrayFull,
    });
    expect(filteredTaskResults).toEqual(activeTaskOutput); // deep equality check needed here
  });

  it("should filter & return ACTIVE tasks (empty input)", () => {
    const toDosArrayFull: ToDoType[] = sampleToDosArrayInput2;
    const filteredTaskResults: ToDoType[] = filterActiveOnly({
      setToDosForDisplay,
      setDisplayFilter,
      setItemCount,
      toDosArrayFull,
    });
    expect(filteredTaskResults.length).toBe(0);
  });
});

describe("filterCompletedOnly", () => {
  // Mocks setup
  let setToDosForDisplay: jest.Mock;
  let setDisplayFilter: jest.Mock;
  let setItemCount: jest.Mock;
  beforeAll(() => {
    setToDosForDisplay = jest.fn();
    setDisplayFilter = jest.fn();
    setItemCount = jest.fn();
  });

  it("should filter & return COMPLETED tasks (non-empty input)", () => {
    const toDosArrayFull: ToDoType[] = sampleToDosArrayInput1;
    const filteredTaskResults: ToDoType[] = filterCompletedOnly({
      setToDosForDisplay,
      setDisplayFilter,
      setItemCount,
      toDosArrayFull,
    });
    expect(filteredTaskResults).toEqual(completedTaskOutput); // deep equality check needed here
  });

  it("should filter & return COMPLETED tasks (empty input)", () => {
    const toDosArrayFull: ToDoType[] = sampleToDosArrayInput2;
    const filteredTaskResults: ToDoType[] = filterCompletedOnly({
      setToDosForDisplay,
      setDisplayFilter,
      setItemCount,
      toDosArrayFull,
    });
    expect(filteredTaskResults.length).toBe(0);
  });
});
