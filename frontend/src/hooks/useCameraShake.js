import { useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useAppStore } from "../stores/appStore";

export function useCameraShake() {
  const controls    = useAnimation();
  const shakeSignal = useAppStore((s) => s.shakeSignal);

  useEffect(() => {
    if (shakeSignal === 0) return;
    controls.start({
      x: [0, -8, 10, -6, 8, -4, 5, -2, 3, 0],
      y: [0,  6, -8, 10, -6, 8, -4,  4, -2, 0],
      transition: { duration: 0.55, ease: "easeOut" },
    });
  }, [shakeSignal, controls]);

  return controls;
}