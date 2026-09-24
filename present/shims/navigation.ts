import { useSyncExternalStore } from "react";
import { getPath, navigate, subscribe } from "./router";

export function usePathname() {
  return useSyncExternalStore(subscribe, getPath, () => "/");
}

export function useRouter() {
  return { push: navigate, replace: navigate, back: () => window.history.back() };
}

export function notFound(): never {
  throw new Error("Not found");
}
