import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../stores/appStore";

export default function CompletedProjectsPage() {
  const phase = useAppStore((s) => s.phase);
  const setPhase = useAppStore((s) => s.setPhase);
  
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (phase === "completed_projects") {
      const fetchCompleted = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/projects/completed");
          if (!res.ok) throw new Error("Sunucu hatası: " + res.status);
          const data = await res.json();
          setCompletedProjects(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCompleted();
    }
  }, [phase]);

  // ESC tuşu ile çıkış
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && phase === "completed_projects") {
        setPhase("starmap");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, setPhase]);

  if (phase !== "completed_projects") return null;

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "radial-gradient(ellipse at top, #061b3d 0%, #030a1c 60%, #01020a 100%)", /* Derin Uzay Mavi Tema */
        display: "flex", flexDirection: "column", overflowY: "auto", padding: "40px 60px"
      }}
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Gezici Işık Efektleri (Arka Plan) */}
      <motion.div style={{ position: "fixed", top: "-10%", right: "-20%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} animate={{ x: [0, -100, 0], y: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
      <motion.div style={{ position: "fixed", bottom: "-10%", left: "-20%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(55,48,163,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} animate={{ x: [0, 100, 0], y: [0, -50, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />

      {/* Üst Kısım: Başlık ve İptal Butonu */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", maxWidth: "1600px", width: "100%", margin: "0 auto 40px" }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, type: "spring" }}>
          <h1 style={{
            fontFamily: "'Orbitron', monospace", fontSize: "3rem", fontWeight: 900,
            color: "#ffffff", letterSpacing: "0.08em", margin: 0,
            textShadow: "0 0 30px rgba(14,165,233,0.5), 0 0 60px rgba(2,132,199,0.3)"
          }}>
            TUG ARŞİV GALERİSİ
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
            <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg, #0ea5e9, transparent)" }} />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.95rem", color: "rgba(125,211,252,0.8)", letterSpacing: "0.15em", margin: 0 }}>
              BAŞARIYLA SONLANDIRILMIŞ PROJELER ({completedProjects.length})
            </p>
          </div>
        </motion.div>

        <motion.button onClick={() => setPhase("starmap")} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.8)", padding: "14px 28px", borderRadius: "10px",
            fontFamily: "'Orbitron', monospace", fontSize: "0.9rem", fontStyle: "italic", letterSpacing: "0.1em",
            cursor: "pointer", backdropFilter: "blur(20px)", transition: "all 0.3s",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
        >
          EVRENE DÖN (ESC) ✕
        </motion.button>
      </div>

      {/* Ana İçerik - Grid */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: "1600px", width: "100%", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column" }}>
        {loading && <div style={{ color: "#38bdf8", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "1.2rem", marginTop: "100px" }}>ARŞİV KAYITLARI YÜKLENİYOR...</div>}
        {error && <div style={{ color: "#fb7185", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "1.2rem", marginTop: "100px" }}>BAĞLANTI HATASI: {error}</div>}
        
        {!loading && !error && completedProjects.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(125,211,252,0.5)", marginTop: "100px", fontFamily: "'Space Mono', monospace", fontSize: "1.1rem" }}>
            HENÜZ SONLANDIRILMIŞ BİR PROJE KAYDI BULUNMUYOR.
          </div>
        )}

        {/* CSS MASONRY GÖRÜNÜMLÜ GRID */}
        {!loading && !error && completedProjects.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "30px", paddingBottom: "60px"
          }}>
            <AnimatePresence>
              {completedProjects.map((cp, idx) => (
                <motion.div 
                  key={cp.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, type: "spring", damping: 20 }}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(14,165,233,0.15)",
                    borderRadius: "20px", padding: "24px",
                    display: "flex", flexDirection: "column", gap: "20px",
                    boxShadow: "inset 0 0 20px rgba(14,165,233,0.02), 0 10px 30px rgba(0,0,0,0.2)",
                    backdropFilter: "blur(12px)",
                    transition: "all 0.3s", cursor: "default"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "rgba(14,165,233,0.04)"; e.currentTarget.style.borderColor = "rgba(14,165,233,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(14,165,233,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Başlık ve ID */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3 style={{ margin: "0", fontFamily: "'Orbitron', monospace", color: "#ffffff", fontSize: "1.3rem", letterSpacing: "0.05em", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
                      {cp.project_name}
                    </h3>
                    <div style={{ 
                      fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", 
                      color: "#38bdf8", border: "1px solid rgba(14,165,233,0.4)", 
                      padding: "4px 8px", borderRadius: 6, background: "rgba(14,165,233,0.1)"
                    }}>
                      TUG-{String(cp.id).padStart(6,"0")}
                    </div>
                  </div>

                  {/* Detay Metadatalar */}
                  <div style={{ display: "flex", gap: "20px", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                    <span><b style={{ color: "#7dd3fc" }}>SORUMLU:</b> {cp.responsible}</span>
                    <span><b style={{ color: "#7dd3fc" }}>BİTİŞ:</b> {new Date(cp.updated_at).toLocaleDateString("tr-TR")}</span>
                  </div>

                  {/* Kapanış Kolajı (Eğer Varsa) */}
                  {cp.image_path ? (
                    <div style={{ 
                      width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", 
                      border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.5)",
                      position: "relative"
                    }}>
                      <img src={`http://localhost:8000${cp.image_path}`} alt={cp.project_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }} />
                    </div>
                  ) : (
                     <div style={{ 
                        width: "100%", height: "100px", borderRadius: "12px", border: "1px dashed rgba(14,165,233,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)",
                        fontFamily: "'Orbitron', monospace", color: "rgba(14,165,233,0.3)", fontSize: "0.8rem", letterSpacing: "0.1em"
                     }}>GÖRSEL KOLAJ YOK
                     </div>
                  )}

                  {/* Değerlendirme Notu */}
                  <div style={{ 
                    background: "rgba(14,165,233,0.05)", borderLeft: "3px solid #0ea5e9", 
                    padding: "16px", borderRadius: "0 12px 12px 0",
                    fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.6
                  }}>
                    <div style={{ fontSize: "0.65rem", color: "#38bdf8", marginBottom: 8, letterSpacing: "0.1em", fontWeight: 700 }}>// DEĞERLENDİRME NOTU</div>
                    {cp.evaluation || <span style={{ fontStyle: "italic", opacity: 0.5 }}>Değerlendirme notu girilmemiş.</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
