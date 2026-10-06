import { createRoot } from "react-dom/client";
import { ReactMigrationApp } from "./ReactMigrationApp.js";

const rootElement = document.getElementById("react-migration-root");

if (!rootElement) {
  throw new Error("React migration root was not found");
}

createRoot(rootElement).render(<ReactMigrationApp />);
