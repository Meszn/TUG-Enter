/**
 * SuccessScreen.jsx — Fırlatma animasyonu + Başarı ekranı
 * phase === "launching" → Roket fırlatma animasyonu
 * phase === "success"  → Başarı mesajı
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../stores/appStore";
import { useProjects } from "../hooks/useProjects";


function StarStreak({ style, delay }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: 2,
        background: "linear-gradient(to bottom, transparent, rgba(160,200,255,0.6), transparent)",
        borderRadius: 1,
        ...style,
      }}
      initial={{ height: 0, opacity: 0, y: 0 }}
      animate={{ height: [0, 80, 160], opacity: [0, 0.7, 0], y: [0, 300, 600] }}
      transition={{ duration: 0.8, delay, repeat: Infinity, repeatDelay: Math.random() * 0.4, ease: "easeIn" }}
    />
  );
}

export default function SuccessScreen() {
  const phase         = useAppStore((s) => s.phase);
  const setPhase      = useAppStore((s) => s.setPhase);
  const resetForm     = useAppStore((s) => s.resetForm);
  const setCaptured   = useAppStore((s) => s.setCapturedImage);
  const projects      = useAppStore((s) => s.projects);
  
  const handleBack = () => {
    resetForm();
    setCaptured(null);
    setPhase("starmap");
  };

  // Sadece success fazında göster
  if (phase !== "success") return null;

  const latest = projects[0];

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0, zIndex: 95,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,2,10,0.92)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Tarama çizgileri */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,50,150,0.015) 3px,rgba(0,50,150,0.015) 4px)",
      }} />

      {/* ══════════ BAŞARI EKRANI ══════════ */}
      <AnimatePresence mode="wait">
        {phase === "success" && (

          <motion.div
            key="success-phase"
            style={{
              position: "relative", zIndex: 1,
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 14, textAlign: "center", padding: "2rem",
              maxWidth: 440,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Glow halkası */}
            <motion.div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: 320, height: 320, borderRadius: "50%",
              background: "radial-gradient(circle,rgba(60,180,100,0.10) 0%,transparent 70%)",
              pointerEvents: "none",
            }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity }} />

            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(40,200,100,0.18) 0%,transparent 70%)",
                border: "2px solid rgba(60,220,110,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 0 40px rgba(40,220,100,0.25)",
              }}>
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{ fontSize: 36, lineHeight: 1 }}>✓</motion.span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              style={{
                fontFamily: "'Orbitron',monospace", fontWeight: 900,
                fontSize: "clamp(1.1rem,2.5vw,1.5rem)",
                letterSpacing: "0.15em", textTransform: "uppercase",
                background: "linear-gradient(135deg,#44ffaa,#4af)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 10,
              }}>
              Proje Uzaya Fırlatıldı
            </motion.h2>

            {latest && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.32 }}
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "0.78rem", color: "rgba(120,200,160,0.7)",
                  marginBottom: 32, letterSpacing: "0.05em",
                }}>
                "{latest.project_name}" başarıyla kayıt edildi
              </motion.p>
            )}

            <motion.button
              onClick={handleBack}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.04, boxShadow: "0 6px 35px rgba(40,180,90,0.35)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: "'Orbitron',monospace", fontWeight: 700,
                fontSize: "0.72rem", letterSpacing: "0.16em",
                textTransform: "uppercase", color: "#fff",
                background: "linear-gradient(135deg,rgba(16,100,50,0.95),rgba(10,60,30,0.95))",
                border: "1px solid rgba(50,200,90,0.4)",
                borderRadius: 10, padding: "12px 28px",
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(20,180,70,0.22)",
              }}>
              ← Yıldız Haritasına Dön
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Köşe çerçeveleri — her iki fazda da göster */}
      {[
        { top: 18, left: 18, borderTop: "2px solid", borderLeft: "2px solid" },
        { top: 18, right: 18, borderTop: "2px solid", borderRight: "2px solid" },
        { bottom: 18, left: 18, borderBottom: "2px solid", borderLeft: "2px solid" },
        { bottom: 18, right: 18, borderBottom: "2px solid", borderRight: "2px solid" },
      ].map((s, i) => (
        <motion.div key={i}
          style={{ position: "absolute", width: 24, height: 24, borderColor: "rgba(40,160,255,0.4)", ...s }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }} />
      ))}
    </motion.div>
  );
}