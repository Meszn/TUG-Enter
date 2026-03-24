import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAppStore } from "../stores/appStore";
import { useProjects } from "../hooks/useProjects";
import CameraCapture from "./CameraCapture";

// ── Ortak Input Stili ────────────────────────────────────────────────────────
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

// ── Çoklu Araştırmacı — Tag Sistemi ─────────────────────────────
function ResearcherTags({ isError }) {
  const researchers      = useAppStore((s) => s.form.researchers);
  const addResearcher    = useAppStore((s) => s.addResearcher);
  const removeResearcher = useAppStore((s) => s.removeResearcher);
  const updateResearcher = useAppStore((s) => s.updateResearcher);

  const tags = researchers.slice(0, -1).filter(Boolean);
  const inputVal = researchers[researchers.length - 1] ?? "";

  const inputRef = useRef(null);

  const commit = useCallback(() => {
    const val = inputVal.trim();
    if (!val) return;
    updateResearcher(researchers.length - 1, val);
    addResearcher();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [inputVal, researchers.length, updateResearcher, addResearcher]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); commit(); return; }
    if (e.key === "," || e.key === "Tab") { e.preventDefault(); commit(); return; }
    if (e.key === "Backspace" && inputVal === "" && tags.length > 0) {
      removeResearcher(researchers.length - 2);
    }
  }, [commit, inputVal, tags.length, researchers.length, removeResearcher]);

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div onClick={() => inputRef.current?.focus()} style={{
      ...inputStyle, minHeight: 60, padding: "10px 14px",
      display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", cursor: "text",
      borderColor: isError ? "rgba(251, 113, 133, 0.8)" : (isFocused ? "rgba(138, 180, 248, 0.8)" : "rgba(255, 255, 255, 0.12)"),
      boxShadow: isError ? "0 0 15px rgba(251, 113, 133, 0.2), inset 0 0 10px rgba(251,113,133,0.1)" : (isFocused ? "0 0 20px rgba(138, 180, 248, 0.2), inset 0 0 10px rgba(138,180,248,0.1)" : inputStyle.boxShadow),
    }}>
      <AnimatePresence>
        {tags.map((name, i) => (
          <motion.div key={`${i}-${name}`}
            initial={{ opacity: 0, scale: 0.8, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, rgba(138, 180, 248, 0.2), rgba(59, 130, 246, 0.3))",
              border: "1px solid rgba(138, 180, 248, 0.5)", borderRadius: "8px", padding: "6px 12px",
              boxShadow: "0 0 10px rgba(59,130,246,0.3)"
            }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", color: "#e8eaed" }}>{name}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); removeResearcher(i); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "0 2px", fontSize: "1rem", lineHeight: 1, transition: "color 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"} onMouseOut={(e)  => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
            >✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
      <input
        ref={inputRef} value={inputVal} onChange={(e) => updateResearcher(researchers.length - 1, e.target.value)} onKeyDown={handleKey}
        onBlur={() => { commit(); setIsFocused(false); }} onFocus={() => setIsFocused(true)}
        placeholder={tags.length === 0 ? "İsim yazın, Enter veya Virgül ile ekleyin..." : "Yeni kişi ekle..."}
        style={{ flex: 1, minWidth: 200, background: "transparent", border: "none", outline: "none", color: "#ffffff", fontFamily: "'Space Mono', monospace", fontSize: "0.95rem", padding: "4px" }}
      />
    </div>
  );
}

// ── Şahane Tam Ekran Kayıt Sayfası ──────────────────────────────────────
export default function RegistrationPage() {
  const form     = useAppStore((s) => s.form);
  const setForm  = useAppStore((s) => s.setForm);
  const phase    = useAppStore((s) => s.phase);
  const setPhase = useAppStore((s) => s.setPhase);
  const capturedImage = useAppStore((s) => s.capturedImage);
  const triggerShake  = useAppStore((s) => s.triggerShake);

  const { submitProject } = useProjects();
  
  const [localErrors, setLocalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState("");

  const set = (field) => (e) => {
    setForm({ [field]: e.target.value });
    if (localErrors[field]) setLocalErrors(prev => ({ ...prev, [field]: null }));
  };

  const fStyle = (name) => ({
    ...inputStyle,
    borderColor: localErrors[name] ? "rgba(251, 113, 133, 0.8)" : (focused === name ? "rgba(138, 180, 248, 0.8)" : "rgba(255, 255, 255, 0.12)"),
    boxShadow:   localErrors[name] ? "0 0 15px rgba(251, 113, 133, 0.2), inset 0 0 10px rgba(251,113,133,0.1)" : (focused === name ? "0 0 20px rgba(138, 180, 248, 0.2), inset 0 0 10px rgba(138,180,248,0.1)" : inputStyle.boxShadow),
  });
  
  const fProps = (name) => ({
    onFocus: () => setFocused(name),
    onBlur:  () => setFocused(""),
  });

  // Kapsamlı Submit Doğrulama Mantığı
  const handleStartProject = async () => {
    if (isSubmitting) return;
    
    const errors = {};
    const validResearchers = form.researchers.filter((r) => r.trim());

    if (!form.projectName.trim()) errors.projectName = "Proje adı boş bırakılamaz.";
    if (!form.purpose.trim()) errors.purpose = "Proje amacı boş bırakılamaz.";
    if (validResearchers.length === 0) errors.researchers = "En az bir araştırmacı eklemelisiniz.";

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      triggerShake(); // Hata olduğunda ekranı hafif sallandır
      return;
    }

    // Doğrulama başarılı -> Fırlatma Animasyonuna geç
    setIsSubmitting(true);
    triggerShake();
    
    // KONFETİ ŞÖLENİ BAŞLASIN
    const duration = 2500;
    const end = Date.now() + duration;

    // Ekranın iki yanından havai fişek gibi konfetiler fırlatır
    (function frame() {
      confetti({
        particleCount: 5, angle: 60, spread: 55, origin: { x: 0 },
        colors: ["#3b82f6", "#8b5cf6", "#4ade80", "#ffffff"]
      });
      confetti({
        particleCount: 5, angle: 120, spread: 55, origin: { x: 1 },
        colors: ["#3b82f6", "#8b5cf6", "#4ade80", "#ffffff"]
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());

    // Konfetilerin izlenmesi için bekle
    await new Promise(r => setTimeout(r, 3000));
    setPhase("launching");
    
    // API isteği ve Animasyon Asenkron çalışır (App.jsx'teki gibi 3.5s bekleme simülasyonu)
    const minAnimDelay = new Promise((r) => setTimeout(r, 3500));
    
    try {
      await Promise.all([
        submitProject(form, capturedImage),
        minAnimDelay
      ]);
      setPhase("success");
    } catch (err) {
      console.error("Kayıt hatası:", err);
      await minAnimDelay;
      setPhase("register"); // Başarısız olursa forma geri dön
      setLocalErrors({ system: "Sunucu hatası: Proje başlatılamadı." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Klavyeden enter ile projeyi başlatmayı dinle (global yerine lokal)
  useEffect(() => {
    if (phase !== "register") return;
    const keyHandler = (e) => {
      // Input veya textarea içindeyse enter basıldığında submit'i engelle (etiket eklemek vs için)
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "INPUT") {
        handleStartProject();
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [phase, form, handleStartProject]);

  if (phase !== "register") return null;

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "radial-gradient(ellipse at center, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
        display: "flex", flexDirection: "column", overflowY: "auto", padding: "40px 60px"
      }}
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Gezici Işık Efektleri (Arka Plan) */}
      <motion.div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} animate={{ x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
      <motion.div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} animate={{ x: [0, -100, 0], y: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />

      {/* Üst Kısım: Başlık ve İptal Butonu */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px", maxWidth: "1400px", width: "100%", margin: "0 auto 50px" }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, type: "spring" }}>
          <h1 style={{
            fontFamily: "'Orbitron', monospace", fontSize: "3rem", fontWeight: 900,
            color: "#ffffff", letterSpacing: "0.08em", margin: 0,
            textShadow: "0 0 30px rgba(138,180,248,0.4), 0 0 60px rgba(59,130,246,0.2)"
          }}>
            YENİ PROJE BAŞLAT
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
            <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg, #3b82f6, transparent)" }} />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.95rem", color: "rgba(138,180,248,0.7)", letterSpacing: "0.15em", margin: 0 }}>
              TUG GÖZLEMEVİ KAYIT SİSTEMİ
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

      {/* Ana Form İçeriği */}
      <div style={{
        position: "relative", zIndex: 10, maxWidth: "1400px", width: "100%", margin: "0 auto",
        display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "80px", flex: 1
      }}>
        {/* Sol Sütun: Form Alanları */}
        <motion.div style={{
          background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "40px", borderRadius: "24px", backdropFilter: "blur(10px)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.3)"
        }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Field label="Proje Adı" required delay={0.2} errorMsg={localErrors.projectName}>
            <input style={fStyle("projectName")} {...fProps("projectName")}
              type="text" placeholder="Örn: Galaksi Kümelerinin Fotometrik Analizi"
              value={form.projectName} onChange={set("projectName")} />
          </Field>

          <Field label="Proje Amacı ve Kapsamı" required delay={0.3} errorMsg={localErrors.purpose}>
            <textarea
              style={{ ...fStyle("purpose"), resize: "vertical", minHeight: "160px", lineHeight: "1.8" }}
              {...fProps("purpose")} placeholder="Bilimsel temel, kullanılacak aletler ve beklenen çıktılar..."
              value={form.purpose} onChange={set("purpose")} />
          </Field>

          <Field label="Araştırmacı Ekibi" required delay={0.4} errorMsg={localErrors.researchers}>
            <ResearcherTags isError={!!localErrors.researchers} />
          </Field>

          <Field label="Başlangıç Tarihi" delay={0.5}>
            <input style={{...fStyle("startDate"), colorScheme: "dark" }} {...fProps("startDate")}
              type="date" value={form.startDate} onChange={set("startDate")} />
          </Field>
        </motion.div>

        {/* Sağ Sütun: Kolaj Kamera ve Onay */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Field label="Görsel Kolaj & Veri Ekleri" delay={0.6}>
            <div style={{
              background: "rgba(0,0,0,0.4)", borderRadius: "18px", padding: "16px",
              border: "1px solid rgba(138, 180, 248, 0.2)", backdropFilter: "blur(20px)",
              boxShadow: "inset 0 0 30px rgba(138, 180, 248, 0.05)"
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
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          >
            {/* Animasyonlu Neon Kenarlık */}
            <motion.div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px",
              background: "linear-gradient(90deg, transparent, #3b82f6, transparent)"
            }} animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
                <span style={{ fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>Ağ Bağlantısı:</span>
              </div>
              <span style={{ fontFamily: "'Orbitron', monospace", color: "#4ade80", fontSize: "0.9rem", letterSpacing: "0.15em", textShadow: "0 0 10px rgba(74,222,128,0.5)" }}>
                ŞİFRELİ & AKTİF
              </span>
            </div>
            
            <button
              onClick={handleStartProject}
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? "linear-gradient(135deg, #1e3a8a, #1d4ed8)" : "linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)",
                color: "#ffffff", padding: "22px", borderRadius: "14px", border: "none",
                fontFamily: "'Orbitron', monospace", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.15em",
                cursor: isSubmitting ? "wait" : "pointer", boxShadow: "0 15px 35px -5px rgba(37, 99, 235, 0.6)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", transform: isSubmitting ? "scale(0.98)" : "scale(1)",
                position: "relative", overflow: "hidden"
              }}
              onMouseOver={(e) => { if(!isSubmitting) { e.currentTarget.style.boxShadow = "0 25px 45px -5px rgba(37, 99, 235, 0.8)"; e.currentTarget.style.transform = "translateY(-3px)"; } }}
              onMouseOut={(e) => { if(!isSubmitting) { e.currentTarget.style.boxShadow = "0 15px 35px -5px rgba(37, 99, 235, 0.6)"; e.currentTarget.style.transform = "scale(1)"; } }}
            >
              {isSubmitting ? "BAŞLATILIYOR..." : "PROJEYİ BAŞLAT"}
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
