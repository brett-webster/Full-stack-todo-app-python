import { Request, Response } from "express";
import { app } from "./server.ts"; // NOTE: need .ts extension here for ES modules
import { ToDoType, RequestBody, toDosArray } from "../types.ts";

function apiLayer(): void {
  app.get("/api/allTodos", (_req: Request, res: Response): Response => {
    return res.status(200).json(toDosArray);
  });

  app.post("/api/addNewTask", (req: Request, res: Response): Response => {
    const { toDosArrayFull: currentToDosArray }: RequestBody =
      req.body as RequestBody;
    const { newTaskToAdd: newTaskToAdd }: RequestBody = req.body as RequestBody;
    if (!newTaskToAdd) return res.status(400).json("No new task provided"); // early exit if no new task object is provided
    const revisedToDosArray: ToDoType[] = [...currentToDosArray, newTaskToAdd]; // create a new array to avoid mutating the original array & add the new task to it
    return res.status(200).json(revisedToDosArray);
  });

  app.put(
    "/api/updateTodoStatus/:idToUpdateStatus",
    (req: Request, res: Response): Response => {
      const { toDosArrayFull: currentToDosArray }: RequestBody =
        req.body as RequestBody;
      const idToUpdateStatus = Number(req.params.idToUpdateStatus);
      const revisedToDosArray: ToDoType[] = [...currentToDosArray]; // create a new array to avoid mutating the original array
      revisedToDosArray.forEach((toDo) => {
        // toggle the status of the task with the matching ID
        if (toDo.id === idToUpdateStatus) {
          toDo.statusComplete = !toDo.statusComplete;
        }
      });
      return res.status(200).json(revisedToDosArray);
    }
  );

  // NOTE: consider storing all deleted tasks in a separate array for future reference
  app.delete(
    "/api/deleteTodo/:idToDelete",
    (req: Request, res: Response): Response => {
      const { toDosArrayFull: currentToDosArray }: RequestBody =
        req.body as RequestBody;
      const idToDelete = Number(req.params.idToDelete);
      const revisedToDosArray: ToDoType[] = currentToDosArray.filter(
        (toDo) => toDo.id !== idToDelete
      );
      return res.status(200).json(revisedToDosArray);
    }
  );
  app.delete(
    "/api/deleteAllCompletedTodos",
    (req: Request, res: Response): Response => {
      const { toDosArrayFull: currentToDosArray }: RequestBody =
        req.body as RequestBody;
      const revisedToDosArray: ToDoType[] = currentToDosArray.filter(
        (toDo) => toDo.statusComplete === false
      );
      return res.status(200).json(revisedToDosArray);
    }
  );
}

export default apiLayer;
