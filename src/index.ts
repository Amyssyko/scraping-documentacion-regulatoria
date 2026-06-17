import { cron } from "bun";
import main from "./utils/task.js";

cron("* * * * 1-5", () => {
  console.log("Ejecutando tarea de lunes a viernes a las 9 am");
  main();
});
