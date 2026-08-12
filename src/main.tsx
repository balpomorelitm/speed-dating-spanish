import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SpeedDatingApp from "./SpeedDatingApp";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpeedDatingApp />
  </StrictMode>,
);
