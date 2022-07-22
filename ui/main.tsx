import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import Demo from "./components/AutomationsTable";
import theme from "./lib/theme";

const container = document.getElementById("app");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Demo />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
