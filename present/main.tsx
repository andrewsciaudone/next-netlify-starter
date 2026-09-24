import { useEffect, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import Home from "@/app/page";
import Uniform001 from "@/app/001/page";
import BuildPage from "@/app/build/page";
import RecordPage from "@/app/record/page";
import IssuePage from "@/app/issue/page";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { KeyNav } from "@/components/KeyNav";
import { FLOW, flowIndex } from "@/lib/flow";
import { StoreProvider } from "@/lib/store";
import { usePathname } from "./shims/navigation";

const PAGES: Record<string, ComponentType> = {
  "/": Home,
  "/001": Uniform001,
  "/build": BuildPage,
  "/record": RecordPage,
  "/issue": IssuePage,
};

function App() {
  const path = usePathname();
  const Page = PAGES[path] ?? Home;

  useEffect(() => {
    const step = FLOW[flowIndex(path)];
    document.title = path === "/" ? "Finest Uniform" : `${step.label} — Finest Uniform`;
  }, [path]);

  return (
    <StoreProvider>
      <Header />
      <main key={path}>
        <Page />
      </main>
      <Footer />
      <KeyNav />
    </StoreProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
