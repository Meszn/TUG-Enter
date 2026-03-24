import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../stores/appStore";
import TUGDataPanel from "./TUGDataPanel";
import { TugLogo, DagLogo } from "./ObservatoryLogos";

// Pulsing dot bileşeni
function PulseDot({ color = "#3af" }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
      <motion.span
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: color, opacity: 0.5,
        }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <span style={{
        position: "relative", display: "inline-block",
        width: 8, height: 8, borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }} />
    </span>
  );
}

export default function StarMapUI() {
  const phase    = useAppStore((s) => s.phase);
  const projects = useAppStore((s) => s.projects) || [];
  const setPhase = useAppStore((s) => s.setPhase);

  if (phase !== "starmap") return null;

  const date = new Date().toLocaleDateString("tr-TR",
    { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none" }}>

      {/* Çok ince ızgara */}
      {[20, 40, 60, 80].map((p) => (
        <div key={`v${p}`} style={{
          position: "absolute", left: `${p}%`, top: 0,
          width: 1, height: "100%",
          background: "rgba(30,60,180,0.025)", pointerEvents: "none",
        }} />
      ))}
      {[25, 50, 75].map((p) => (
        <div key={`h${p}`} style={{
          position: "absolute", top: `${p}%`, left: 0,
          height: 1, width: "100%",
          background: "rgba(30,60,180,0.025)", pointerEvents: "none",
        }} />
      ))}

      {/* ── Sol üst: Logo ── */}
      <motion.div
        style={{
          position: "absolute", top: 22, left: 22,
          display: "flex", alignItems: "center", gap: 14,
          pointerEvents: "all",
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* TUG & DAG Logoları */}
        <div style={{ display: "flex", gap: "10px" }}>
          {/* TUG Logo */}
          <div style={{
            position: "relative", width: 56, height: 56,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(10,20,40,0.4)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(59,130,246,0.3)", borderRadius: "12px",
            boxShadow: "0 0 15px rgba(59,130,246,0.15), inset 0 0 10px rgba(59,130,246,0.1)"
          }}>
            <TugLogo width={40} height={40} />
          </div>
          
          {/* DAG Logo */}
          <div style={{
            position: "relative", width: 56, height: 56,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(30,15,40,0.4)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px",
            boxShadow: "0 0 15px rgba(139,92,246,0.15), inset 0 0 10px rgba(139,92,246,0.1)"
          }}>
            <DagLogo width={40} height={40} />
          </div>
        </div>

        <div>
          <div style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "clamp(0.9rem,1.8vw,1.18rem)",
            fontWeight: 700, letterSpacing: "0.05em",
            color: "#ffffff",
            textShadow: "0 1px 8px rgba(10,30,120,0.55), 0 0 20px rgba(26,110,255,0.35)",
          }}>Türkiye Ulusal Gözlemevi</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 7, marginTop: 4,
            fontFamily: "'Orbitron',monospace",
            fontSize: "0.55rem", letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.75)",
            textShadow: "0 1px 6px rgba(10,30,120,0.4)",
          }}>
            <PulseDot color="#44ffaa" />
            <span>// YILDİZ HARİTASI — AKTİF</span>
          </div>
        </div>

      </motion.div>

      {/* ── Sağ üst: Proje sayacı ── */}
      <motion.div
        style={{
          position: "absolute", top: 22, right: 22,
          display: "flex", alignItems: "baseline", gap: 10,
          background: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(60,120,255,0.2)",
          borderRadius: 12, padding: "11px 20px",
          backdropFilter: "blur(18px)",
          boxShadow: "0 0 0 1px rgba(26,110,255,0.07),0 8px 30px rgba(10,30,120,0.12)",
          pointerEvents: "all",
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.span key={projects.length}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: "2.4rem", fontWeight: 900, lineHeight: 1,
              background: "linear-gradient(135deg,#4af 0%,#a06fff 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
            {String(projects.length).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
          <span style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "0.56rem", letterSpacing: "0.18em",
            color: "rgba(50,90,180,0.65)", lineHeight: 1.45,
          }}>
            KAYITLI<br />PROJE
          </span>
        {/* Biten Projeler Butonu - ESKİ YERİNDE AMA TIKLANABİLİR */}
        <button 
          onClick={() => setPhase("completed_projects")}
          style={{
            position: "absolute", bottom: "-32px", right: 0,
            background: "rgba(26,110,255,0.10)", border: "1px solid rgba(26,110,255,0.38)",
            borderRadius: 6, padding: "6px 12px", color: "#1a6eff",
            fontFamily: "'Orbitron', monospace", fontSize: "0.6rem", letterSpacing: "0.1em",
            cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
            fontWeight: 700, zIndex: 100, pointerEvents: "all"
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(26,110,255,0.2)"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "rgba(26,110,255,0.10)"; }}
        >
          BİTEN PROJELERİ GÖR
        </button>
      </motion.div>

      {/* ── ALT ORTA: Ana buton alanı ── */}
      <motion.div
        style={{
          position: "fixed",
          bottom: "32px",
          left: 0,
          right: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          pointerEvents: "none",
          zIndex: 20,
        }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Üstteki hint metni */}
        <AnimatePresence mode="wait">
          <motion.p key={projects.length}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.07em",
              textAlign: "center",
              marginBottom: 4,
              textShadow: "0 1px 8px rgba(10,30,120,0.55)",
            }}>
            {projects.length === 0
              ? "Uzay boş — ilk projenizi başlatın"
              : `${projects.length} proje yıldız haritasında · yeni eklemek için tıklayın`}
          </motion.p>
        </AnimatePresence>

        {/* Ana buton */}
        <motion.button
          onClick={() => setPhase("register")}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 60px rgba(55,100,255,0.55), 0 8px 40px rgba(55,100,255,0.35)",
          }}
          whileTap={{ scale: 0.96 }}
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "'Orbitron',monospace",
            fontWeight: 800,
            fontSize: "clamp(0.7rem,1.5vw,0.88rem)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#fff",
            background: "linear-gradient(135deg,#1a6eff,#7c3aed)",
            border: "1px solid rgba(26,110,255,0.45)",
            borderRadius: 14,
            padding: "16px 38px",
            cursor: "pointer",
            pointerEvents: "all",
            boxShadow: "0 4px 30px rgba(26,110,255,0.40),0 0 0 1px rgba(26,110,255,0.12),inset 0 1px 0 rgba(255,255,255,0.10)",
          }}>

          {/* Üst parlaklık çizgisi */}
          <div style={{
            position: "absolute", top: 0,
            left: "10%", right: "10%", height: 1,
            background: "linear-gradient(to right,transparent,rgba(180,215,255,0.5),transparent)",
          }} />

          {/* Shimmer sweep */}
          <motion.div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.06) 50%,transparent 70%)",
          }}
            animate={{ x: ["-120%", "220%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.8 }}
          />

          {/* İkon */}
          <motion.span
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "1.15rem", lineHeight: 1 }}>✦</motion.span>

          <span>Yeni Proje Başlat</span>

          {/* Klavye badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            borderLeft: "1px solid rgba(255,255,255,0.14)",
            paddingLeft: 14, marginLeft: 4,
          }}>
            <span style={{
              fontFamily: "'Orbitron',monospace", fontSize: "0.52rem",
              color: "rgba(175,210,255,0.5)",
            }}>veya</span>
            <span style={{
              fontFamily: "'Orbitron',monospace", fontSize: "0.55rem",
              color: "rgba(175,210,255,0.85)",
              border: "1px solid rgba(175,210,255,0.35)",
              borderRadius: 5, padding: "2px 7px",
              boxShadow: "0 2px 0 rgba(0,0,60,0.6)",
            }}>ENTER</span>
          </div>
        </motion.button>

        {/* Alt ok işareti */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "0.52rem",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.7)",
            textShadow: "0 1px 6px rgba(10,30,120,0.5)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}>
          <span>FIRLATMA ÜSSÜ</span>
          <span style={{ fontSize: "0.9rem" }}>⌄</span>
        </motion.div>
      </motion.div>

      {/* ── Sol alt: Tarih ── */}
      <motion.div style={{
        position: "absolute", bottom: 22, left: 22,
          fontFamily: "'Orbitron',monospace", fontSize: "0.55rem",
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.8)",
          textShadow: "0 1px 8px rgba(10,30,120,0.55)",
          fontWeight: 600,
      }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
        {date} — UTC+3
      </motion.div>

      {/* ── Sağ alt: Koordinat ── */}
      <motion.div style={{
        position: "absolute", bottom: 22, right: 22,
        display: "flex", alignItems: "center", gap: 8,
          fontFamily: "'Orbitron',monospace", fontSize: "0.55rem",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.8)",
          textShadow: "0 1px 8px rgba(10,30,120,0.55)",
          fontWeight: 600,
      }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <span>RA 00h 00m 00s</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
        <span>DEC +00° 00′ 00″</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
        <span>J2000.0</span>
      </motion.div>

      {/* Köşe çerçeveleri */}
      {[
        { top: 14, left: 14,   borderTop: "1px solid", borderLeft: "1px solid"   },
        { top: 14, right: 14,  borderTop: "1px solid", borderRight: "1px solid"  },
        { bottom: 14, left: 14,  borderBottom: "1px solid", borderLeft: "1px solid"  },
        { bottom: 14, right: 14, borderBottom: "1px solid", borderRight: "1px solid" },
      ].map((s, i) => (
        <motion.div key={i} style={{
          position: "absolute", width: 28, height: 28,
          borderColor: "rgba(26,110,255,0.28)", ...s, pointerEvents: "none",
        }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.06 }}
        />
      ))}

      <TUGDataPanel />
    </div>
  );
}