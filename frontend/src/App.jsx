import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import UniverseScene    from "./scenes/UniverseScene";
import RocketLaunch     from "./scenes/RocketLaunch";
import RegistrationPage from "./components/RegistrationPage";
import StarMapUI        from "./components/StarMapUI";
import ProjectCard      from "./components/ProjectCard";
import SuccessScreen    from "./components/SuccessScreen";
import EndProjectPage   from "./components/EndProjectPage";
import CompletedProjectsPage from "./components/CompletedProjectsPage";
import { useAppStore }    from "./stores/appStore";
import { useEnterKey }    from "./hooks/useEnterKey";
import { useProjects }    from "./hooks/useProjects";
import { useCameraShake } from "./hooks/useCameraShake";
import "./styles/globals.css";

export default function App() {
  const phase         = useAppStore((s) => s.phase);
  const form          = useAppStore((s) => s.form);
  const capturedImage = useAppStore((s) => s.capturedImage);
  const selectedProject = useAppStore((s) => s.selectedProject);
  const setPhase      = useAppStore((s) => s.setPhase);
  const setError      = useAppStore((s) => s.setError);
  const triggerShake  = useAppStore((s) => s.triggerShake);
  const [pressing, setPressing] = useState(false);

  const { submitProject } = useProjects();
  const shakeControls     = useCameraShake();

  const handleEnter = useCallback(async () => {
    if (selectedProject) return; // Proje kartı açıksa global Enter'ı engelle
    if (phase === "starmap") { setPhase("register"); return; }
  }, [phase, selectedProject, setPhase]);

  useEnterKey(handleEnter, phase === "starmap");

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && phase === "register") setPhase("starmap");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, setPhase]);

  // Sahne ve UI sadece starmap veya success durumunda görünsün (Çökme Önlemi)
  // end_project ve completed_projects'da da UI render edilmez, evren gizlenir.
  const isSceneVisible = phase === "starmap" || phase === "success";

  return (
    <motion.div animate={shakeControls}
      style={{ width:"100vw", height:"100vh", overflow:"hidden", position:"relative", background: "#020617" }}>
      
      {isSceneVisible && (
        <>
          <UniverseScene />
          <StarMapUI />
          <ProjectCard />
        </>
      )}

      <RegistrationPage pressing={pressing} />
      <EndProjectPage />
      <CompletedProjectsPage />
      <RocketLaunch />
      <SuccessScreen />
    </motion.div>
  );
}