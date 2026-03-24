import { useEffect, useCallback, useRef } from "react";
import { useAppStore } from "../stores/appStore";

export function useProjects() {
  const setProjects = useAppStore((s) => s.setProjects);
  const addProject  = useAppStore((s) => s.addProject);
  const projects    = useAppStore((s) => s.projects);
  const phase       = useAppStore((s) => s.phase);
  const fetched     = useRef(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      console.log("✅ Projeler:", data.length);
      setProjects(data);
    } catch (err) {
      console.warn("⚠ API yok, demo mod:", err.message);
      setProjects([]);
    }
  }, [setProjects]);

  useEffect(() => {
    if (!fetched.current) { fetched.current = true; fetchProjects(); }
  }, [fetchProjects]);

  useEffect(() => {
    if (phase === "starmap") {
      console.log("🔄 Starmap'e dönüldü, projeler yenileniyor...");
      fetchProjects();
    }
  }, [phase, fetchProjects]);

  const submitProject = useCallback(async (form, capturedImage) => {
    // Araştırmacıları JSON array olarak gönder
    const validResearchers = form.researchers.filter((r) => r.trim());
    const responsibleJson  = JSON.stringify(validResearchers);

    const payload = new FormData();
    payload.append("project_name", form.projectName);
    payload.append("purpose",      form.purpose);
    payload.append("responsible",  responsibleJson);
    payload.append("start_date",   form.startDate || "");

    if (capturedImage) {
      const blob = await fetch(capturedImage).then((r) => r.blob());
      payload.append("image", blob, "capture.jpg");
    }

    const res = await fetch("/api/projects", { method:"POST", body:payload });
    if (!res.ok) throw new Error("Sunucu hatası: " + res.status);
    const saved = await res.json();
    addProject(saved);
    return saved;
  }, [addProject]);

  const completeProject = useCallback(async (projectId, evaluation, capturedImage) => {
    const payload = new FormData();
    payload.append("evaluation", evaluation);
    
    if (capturedImage) {
      const blob = await fetch(capturedImage).then((r) => r.blob());
      payload.append("image", blob, "completion_capture.jpg");
    }

    const res = await fetch(`/api/projects/${projectId}/complete`, {
      method: "PUT",
      body: payload
    });
    
    if (!res.ok) throw new Error("Tamamlama hatası: " + res.status);
    const completed = await res.json();
    
    // Projeyi ekrandan hemen silme, yıldız kayması animasyonu için işaretle
    setProjects(projects.map(p => p.id === projectId ? { ...p, is_completed: true } : p));
    
    // Animasyon süresi kadar bekle (15 saniye), sonra projeyi kalıcı listesinden çıkar ki sayaç güncellensin
    setTimeout(() => {
      const currentProjects = useAppStore.getState().projects;
      setProjects(currentProjects.filter(p => p.id !== projectId));
    }, 15000);
    
    return completed;
  }, [projects, setProjects]);

  return { fetchProjects, submitProject, completeProject };
}