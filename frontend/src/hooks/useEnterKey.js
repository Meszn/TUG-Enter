import { useEffect } from "react";

export function useEnterKey(callback, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (e.key !== "Enter") return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "textarea" || tag === "select" || tag === "button") return;
      e.preventDefault();
      callback();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [callback, enabled]);
}