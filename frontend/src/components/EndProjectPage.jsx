import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAppStore } from "../stores/appStore";
import { useProjects } from "../hooks/useProjects";
import CameraCapture from "./CameraCapture";

const inputStyle = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  padding: "1rem 1.25rem",
  color: "#ffffff",
  fontFamily: "'Space Mono', monospace",
  fontSize: "0.95rem",
  outline: "none",
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  backdropFilter: "blur(12px)",
  boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
};

function Field({ label, required, children, delay=0, errorMsg }) {
  return (
    <motion.div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}>
      <label style={{
        fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.15em", color: errorMsg ? "#fb7185" : "rgba(255, 255, 255, 0.7)",
        fontFamily: "'Orbitron', monospace", display: "flex", alignItems: "center", gap: "6px",
        transition: "color 0.3s"
      }}>
        {label}
        {required && <span style={{ color: "#ef4444", fontSize: "1rem", lineHeight: 0.5 }}>*</span>}
      </label>
      {children}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            style={{ color: "#fb7185", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif", marginTop: "4px" }}>
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EndProjectPage() {
  const phase    = useAppStore((s) => s.phase);
  const setPhase = useAppStore((s) => s.setPhase);
  const selectedProject = useAppStore((s) => s.selectedProject);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const capturedImage = useAppStore((s) => s.capturedImage);
  const triggerShake  = useAppStore((s) => s.triggerShake);

  const { completeProject } = useProjects();
  
  const [evaluation, setEvaluation] = useState("");
  const [localErrors, setLocalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState("");

  const fStyle = (name) => ({
    ...inputStyle,
    borderColor: localErrors[name] ? "rgba(251, 113, 133, 0.8)" : (focused === name ? "rgba(244, 114, 182, 0.8)" : "rgba(255, 255, 255, 0.12)"),
    boxShadow:   localErrors[name] ? "0 0 15px rgba(251, 113, 133, 0.2), inset 0 0 10px rgba(251,113,133,0.1)" : (focused === name ? "0 0 20px rgba(244, 114, 182, 0.2), inset 0 0 10px rgba(244, 114, 182, 0.1)" : inputStyle.boxShadow),
  });
  const fProps = (name) => ({
    onFocus: () => setFocused(name),
    onBlur:  () => setFocused(""),
  });

  const handleComplete = async () => {
    if (isSubmitting) return;
    
    const errors = {};
    if (!evaluation.trim()) errors.evaluation = "Lütfen proje kapanış değerlendirmesini girin.";

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    triggerShake();
    
    try {
      // 1. Kapanış Şöleni (Modal üzerindeyken konfeti patlar)
      const duration = 2500;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5, angle: 60, spread: 55, origin: { x: 0 },
          colors: ["#f43f5e", "#fbbf24", "#e879f9", "#ffffff"],
          zIndex: 9999
        });
        confetti({
          particleCount: 5, angle: 120, spread: 55, origin: { x: 1 },
          colors: ["#f43f5e", "#fbbf24", "#e879f9", "#ffffff"],
          zIndex: 9999
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());

      // 2. Konfetinin görsel olarak bitmesini bekle
      await new Promise(r => setTimeout(r, 2600));

      const pid = selectedProject.id;
      const evalText = evaluation;
      const cImg = capturedImage;

      // 3. Starmap'e dön (Modal kapanır, evren görünür)
      setPhase("starmap");
      setSelectedProject(null);

      // 4. React'in evreni tam olarak DOM'a çizmesi için çok kısa bir an bekle
      await new Promise(r => setTimeout(r, 100));

      // 5. API'yi çağır ve projeyi tamamla (Bu işlem yerel state'den projeyi sildiği için Yıldız Kayma animasyonu tetiklenir)
      await completeProject(pid, evalText, cImg);

    } catch (err) {
      console.error("Kapanış hatası:", err);
      setLocalErrors({ system: "Sunucu hatası: Proje sonlandırılamadı." });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (phase !== "end_project") return;
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        setPhase("starmap");
      }
      // Input veya textarea içindeyse enter submit yapmasın
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "INPUT") {
        handleComplete();
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [phase, evaluation, handleComplete, setPhase]);

  if (phase !== "end_project" || !selectedProject) return null;

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "radial-gradient(ellipse at bottom, #2e0835 0%, #11061c 60%, #020105 100%)", /* Kırmızı/Mor Karanlık Tema */
        display: "flex", flexDirection: "column", overflowY: "auto", padding: "40px 60px"
      }}
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Gezici Işık Efektleri (Arka Plan) */}
      <motion.div style={{ position: "absolute", top: "-10%", left: "-20%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(225,29,72,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} animate={{ x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} />
      <motion.div style={{ position: "absolute", bottom: "-10%", right: "-20%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(162,28,175,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} animate={{ x: [0, -100, 0], y: [0, -50, 0] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} />

      {/* Üst Kısım: Başlık ve İptal Butonu */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px", maxWidth: "1400px", width: "100%", margin: "0 auto 50px" }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, type: "spring" }}>
          <h1 style={{
            fontFamily: "'Orbitron', monospace", fontSize: "3rem", fontWeight: 900,
            color: "#ffffff", letterSpacing: "0.08em", margin: 0,
            textShadow: "0 0 30px rgba(225,29,72,0.5), 0 0 60px rgba(159,18,57,0.3)"
          }}>
            PROJEYİ SONLANDIR
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
            <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg, #e11d48, transparent)" }} />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.95rem", color: "rgba(251,113,133,0.7)", letterSpacing: "0.15em", margin: 0 }}>
              KAPANIŞ DEĞERLENDİRMESİ VE ARŞİVLEME
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
          İPTAL ET (ESC) ✕
        </motion.button>
      </div>

      {/* Ana İçerik */}
      <div style={{
        position: "relative", zIndex: 10, maxWidth: "1400px", width: "100%", margin: "0 auto",
        display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "80px", flex: 1
      }}>
        {/* Sol Sütun: Proje Dosyası ve Form */}
        <motion.div style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          
          {/* Proje Kısa Özeti - ReadOnly Panel */}
          <div style={{
            background: "rgba(225,29,72,0.05)", border: "1px solid rgba(225,29,72,0.2)",
            padding: "24px", borderRadius: "20px", backdropFilter: "blur(10px)",
            boxShadow: "inset 0 0 20px rgba(225,29,72,0.05)"
          }}>
            <div style={{ fontFamily: "'Orbitron', monospace", color: "#e11d48", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "8px" }}>// SEÇİLİ PROJE</div>
            <h2 style={{ fontFamily: "'Orbitron', monospace", color: "#fff", fontSize: "1.6rem", margin: "0 0 16px 0", textShadow: "0 0 10px rgba(225,29,72,0.3)" }}>
              {selectedProject.project_name}
            </h2>
            <div style={{ display: "flex", gap: "20px", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
              <span><b style={{ color: "#fb7185" }}>SORUMLU:</b> {selectedProject.responsible}</span>
              <span><b style={{ color: "#fb7185" }}>KAYIT:</b> TUG-{String(selectedProject.id).padStart(6, "0")}</span>
            </div>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)",
            padding: "40px", borderRadius: "24px", backdropFilter: "blur(10px)", flex: 1,
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.3)"
          }}>
            <Field label="Değerlendirme Notu" required delay={0.2} errorMsg={localErrors.evaluation}>
              <textarea
                style={{ ...fStyle("evaluation"), resize: "vertical", minHeight: "220px", lineHeight: "1.8" }}
                {...fProps("evaluation")} placeholder="Projenin bilimsel bulguları, yaşanan gelişmeler ve sonuç bildirge notu..."
                value={evaluation} onChange={(e) => { setEvaluation(e.target.value); setLocalErrors({ ...localErrors, evaluation: null }); }} />
            </Field>
          </div>
        </motion.div>

        {/* Sağ Sütun: Kolaj Kamera ve Onay */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Field label="Kapanış Görseli & Araştırma Kolajı" delay={0.4}>
            <div style={{
              background: "rgba(0,0,0,0.4)", borderRadius: "18px", padding: "16px",
              border: "1px solid rgba(225, 29, 72, 0.2)", backdropFilter: "blur(20px)",
              boxShadow: "inset 0 0 30px rgba(225, 29, 72, 0.05)"
            }}>
              <CameraCapture />
            </div>
          </Field>

          <AnimatePresence>
            {localErrors.system && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.5)",
                  color: "#fca5a5", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "12px"
                }}>
                <span style={{ fontSize: "1.4rem" }}>⚠️</span> {localErrors.system}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div style={{
            marginTop: "auto", position: "relative",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
            padding: "32px", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "24px",
            overflow: "hidden"
          }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          >
            {/* Animasyonlu Neon Kenarlık Kırmızı/Pembe */}
            <motion.div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px",
              background: "linear-gradient(90deg, transparent, #e11d48, transparent)"
            }} animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
                <span style={{ fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>Arşiv İletimi:</span>
              </div>
              <span style={{ fontFamily: "'Orbitron', monospace", color: "#4ade80", fontSize: "0.9rem", letterSpacing: "0.15em", textShadow: "0 0 10px rgba(74,222,128,0.5)" }}>
                HAZIR
              </span>
            </div>
            
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? "linear-gradient(135deg, #881337, #9f1239)" : "linear-gradient(135deg, #be123c, #e11d48, #f43f5e)",
                color: "#ffffff", padding: "22px", borderRadius: "14px", border: "none",
                fontFamily: "'Orbitron', monospace", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.15em",
                cursor: isSubmitting ? "wait" : "pointer", boxShadow: "0 15px 35px -5px rgba(225, 29, 72, 0.6)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", transform: isSubmitting ? "scale(0.98)" : "scale(1)",
                position: "relative", overflow: "hidden"
              }}
              onMouseOver={(e) => { if(!isSubmitting) { e.currentTarget.style.boxShadow = "0 25px 45px -5px rgba(225, 29, 72, 0.8)"; e.currentTarget.style.transform = "translateY(-3px)"; } }}
              onMouseOut={(e) => { if(!isSubmitting) { e.currentTarget.style.boxShadow = "0 15px 35px -5px rgba(225, 29, 72, 0.6)"; e.currentTarget.style.transform = "scale(1)"; } }}
            >
              {isSubmitting ? "KAPATILIYOR..." : "SONLANDIR & ARŞİVLE"}
              {/* Buton parlaması efekti */}
              {!isSubmitting && (
                <motion.div style={{
                  position: "absolute", top: 0, bottom: 0, width: "30%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", transform: "skewX(-20deg)"
                }} animate={{ left: ["-50%", "150%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }} />
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
