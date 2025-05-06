// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';

import { UserProvider } from "./context/UserContext";
import { ViewModeProvider } from "./ViewModeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <ViewModeProvider>
        <App />
      </ViewModeProvider>
    </UserProvider>
  </React.StrictMode>
);
