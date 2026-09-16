import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");

const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Production pages ship prerendered markup; the dev server does not.
if (container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
