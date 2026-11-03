import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@playstate/ui/styles/tokens.css";
import "@playstate/ui/styles/components.css";
import "./app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
