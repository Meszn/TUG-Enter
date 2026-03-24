import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../stores/appStore";
import { useProjects } from "../hooks/useProjects";

export default function ProjectCard() {
  const selectedProject = useAppStore((s) => s.selectedProject);
  const setProject      = useAppStore((s) => s.setSelectedProject);
  const { completeProject } = useProjects();
  
  const [project, setLocalProject]  = useState(selectedProject);
  const [isEnding, setIsEnding]     = useState(false);
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (selectedProject) {
      setLocalProject(selectedProject);
      setIsEnding(false);
      setEvaluation("");
    }
  }, [selectedProject]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Shift+Enter alt satıra geçmek için serbest bırakılsın
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isEnding) {
          setIsEnding(true);
        } else if (!loading) {
          handleEnd();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnding, loading, evaluation, project]);

  const handleEnd = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!evaluation.trim()) {
      alert("Lütfen bir değerlendirme notu girin.");
      return;
    }
    setLoading(true);
    try {
      await completeProject(project.id, evaluation);
      setProject(null); // Yıldız kaybolacak 
      setIsEnding(false);
      setEvaluation("");
    } catch (err) {
      alert("Hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const fmt = (d) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";

  return (
    <AnimatePresence>
      {selectedProject && project && (
        <>
          <motion.div className="card-backdrop"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setProject(null)} />

          <motion.div className="project-card"
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setProject(null)}>

            <motion.div className="project-card-inner"
              initial={{ scale:0.92 }}
              animate={{ scale:1 }}
              exit={{ scale:0.92 }}
              transition={{ type:"spring", stiffness:280, damping:28 }}
              onClick={(e) => e.stopPropagation()}>

              <button className="card-close" onClick={() => setProject(null)}>✕</button>
              <div className="card-top-line" />

              {project.image_path ? (
                <div className="card-photo-wrap">
                  <img src={`http://localhost:8000${project.image_path}`}
                    alt={project.project_name} className="card-photo" />
                  <div className="card-photo-scan" />
                </div>
              ) : (
              <div className="card-photo-empty">
                <span style={{ color: "rgba(26,110,255,0.4)", fontSize: "1.5rem" }}>◈</span>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.6rem", color: "rgba(50,90,180,0.5)", letterSpacing: "0.12em" }}>GÖRSEL YOK</span>
              </div>
              )}

              <div className="card-eyebrow">// PROJE DETAYI</div>
              <h2 className="card-title" style={{ color: "#0a1540" }}>{project.project_name}</h2>

              <div className="card-meta">
                {[
                  ["SORUMLU",  project.responsible],
                  ["TARİH",    fmt(project.start_date)],
                  ["KAYIT ID", `TUG-${String(project.id).padStart(6,"0")}`],
                ].map(([l, v]) => (
                  <div key={l} className="meta-row">
                    <span className="meta-label">{l}</span>
                    <span className="meta-value">{v}</span>
                  </div>
                ))}
              </div>

              <div className="card-section-label">PROJE AMACI</div>
              <p className="card-purpose">{project.purpose}</p>

              <div className="card-coords">
                <span>RA {(project.id * 1.618).toFixed(4)}h</span>
                <span className="dot">·</span>
                <span>DEC +{(project.id * 2.718 % 90).toFixed(4)}°</span>
              </div>

              {/* Proje Sonlandırma Alanı */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,100,100,0.15)" }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); useAppStore.getState().setPhase("end_project"); }}
                  style={{
                      width: "100%", background: "rgba(225,29,72,0.07)", border: "1px solid rgba(225,29,72,0.35)",
                      color: "#be123c", padding: "10px", borderRadius: "8px", fontFamily: "'Orbitron', monospace",
                      fontSize: "0.75rem", letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(225,29,72,0.15)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(225,29,72,0.2)"; }}
                    onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(225,29,72,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    PROJEYİ SONLANDIR
                  </button>
              </div>

              {["tl","tr","bl","br"].map((c) => (
                <div key={c} className={`card-corner ${c}`} />
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}