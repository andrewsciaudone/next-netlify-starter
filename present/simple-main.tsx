import { createRoot } from "react-dom/client";
import { StoreProvider } from "@/lib/store";
import { SimpleApp } from "@/simple/SimpleApp";

createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <SimpleApp />
  </StoreProvider>
);
