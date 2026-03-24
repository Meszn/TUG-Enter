import { motion } from "framer-motion";
import { useAppStore } from "../stores/appStore";

function RocketSVG({ size = 200 }) {
  // viewBox: 0 0 200 400
  const sparks = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: 85 + Math.random() * 30, 
    delay: Math.random() * 0.4,
    dur: 0.3 + Math.random() * 0.4
  }));

  return (
    <svg width={size} height={size * 2} viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#88ccee" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#88ccee" stopOpacity="0"/>
        </radialGradient>
        
        <linearGradient id="metalBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bdc3c7"/>
          <stop offset="25%" stopColor="#ffffff"/>
          <stop offset="75%" stopColor="#bdc3c7"/>
          <stop offset="100%" stopColor="#7f8c8d"/>
        </linearGradient>

        <linearGradient id="darkMetal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2c3e50"/>
          <stop offset="50%" stopColor="#5d6d7e"/>
          <stop offset="100%" stopColor="#1a252f"/>
        </linearGradient>

        <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#85c1e9"/>
          <stop offset="100%" stopColor="#2874a6"/>
        </linearGradient>

        <linearGradient id="mainFlame" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="15%" stopColor="#ffee00" stopOpacity="1" />
          <stop offset="50%" stopColor="#ff6600" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#cc0000" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="150" r="100" fill="url(#rGlow)"/>

      {/* ─── ALEVLER (Nozzle y=285'te) ─── */}
      {/* Alevleri direkt SVG içine koyuyoruz ki gövdeden KESİNLİKLE ayrılmasın */}
      <g style={{ transformOrigin: "100px 285px" }}>
        {/* Ana Alev */}
        <motion.path 
          d="M 80 285 Q 70 340 100 380 Q 130 340 120 285 Z" 
          fill="url(#mainFlame)"
          animate={{
            d: [
              "M 80 285 Q 70 340 100 390 Q 130 340 120 285 Z",
              "M 75 285 Q 50 360 100 420 Q 150 360 125 285 Z",
              "M 82 285 Q 75 330 100 380 Q 125 330 118 285 Z",
              "M 80 285 Q 70 340 100 390 Q 130 340 120 285 Z"
            ],
            opacity: [0.9, 1, 0.85, 0.9]
          }}
          transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }}
        />
        {/* İç alev (daha sıcak/beyaz) */}
        <motion.path 
          d="M 88 285 Q 85 320 100 350 Q 115 320 112 285 Z" 
          fill="#ffffee"
          animate={{
            d: [
              "M 88 285 Q 85 320 100 350 Q 115 320 112 285 Z",
              "M 85 285 Q 80 330 100 370 Q 120 330 115 285 Z",
              "M 88 285 Q 85 320 100 350 Q 115 320 112 285 Z"
            ]
          }}
          transition={{ duration: 0.08, repeat: Infinity, ease: "linear" }}
        />
        {/* Sıçrayan ateş parçacıkları */}
        {sparks.map((s) => (
          <motion.circle
            key={s.id}
            cx={s.x}
            cy="285"
            r="3.5"
            fill="#ffcc00"
            filter="blur(0.5px)"
            animate={{
              cy: [285, 285 + Math.random() * 80 + 30],
              cx: [s.x, s.x + (Math.random() - 0.5) * 50],
              opacity: [1, 0],
              scale: [1, 0]
            }}
            transition={{
              duration: s.dur,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
      </g>


      {/* ─── ROKET GÖVDESİ ─── */}
      {/* Sol Kanat */}
      <path d="M 65 200 L 30 275 L 30 290 L 70 280 Z" fill="url(#darkMetal)" stroke="#1a1c20" strokeWidth="1"/>
      {/* Sağ Kanat */}
      <path d="M 135 200 L 170 275 L 170 290 L 130 280 Z" fill="url(#darkMetal)" stroke="#1a1c20" strokeWidth="1"/>
      
      {/* Ana Gövde Konisi */}
      <path d="M 100 30 C 120 80 135 150 130 270 L 70 270 C 65 150 80 80 100 30 Z" fill="url(#metalBody)" stroke="#7f8c8d" strokeWidth="1.5"/>
      
      {/* Panel Çizgileri */}
      <path d="M 76 120 Q 100 130 124 120" stroke="#7f8c8d" strokeWidth="1" fill="none"/>
      <path d="M 72 180 Q 100 190 128 180" stroke="#7f8c8d" strokeWidth="1" fill="none"/>
      <path d="M 71 240 Q 100 250 129 240" stroke="#7f8c8d" strokeWidth="1.5" fill="none"/>
      
      {/* Kırmızı Tasarım Bandı */}
      <path d="M 74 150 Q 100 160 126 150 L 125 160 Q 100 170 75 160 Z" fill="#e74c3c" opacity="0.9"/>
      
      {/* Pencere Çerçevesi */}
      <circle cx="100" cy="100" r="18" fill="url(#darkMetal)" stroke="#7f8c8d" strokeWidth="2"/>
      {/* Cam */}
      <circle cx="100" cy="100" r="12" fill="url(#glass)"/>
      {/* Cam Yansıması (Daha gerçekçi hissiyat için) */}
      <path d="M 92 92 Q 100 85 108 92 Q 100 95 92 92 Z" fill="#ffffff" opacity="0.7"/>
      
      {/* Merkez Denge Kanatçığı (Gövde Önündeki Kanat) */}
      <path d="M 100 190 L 105 280 L 95 280 Z" fill="url(#darkMetal)" stroke="#111" strokeWidth="0.5"/>
      
      {/* Nozzle (Motor Çıkışı) */}
      <path d="M 75 270 L 125 270 L 130 285 L 70 285 Z" fill="#1a252f" stroke="#333" strokeWidth="1"/>
      <path d="M 78 285 L 122 285 L 125 290 L 75 290 Z" fill="#0d0e10"/>

    </svg>
  );
}

export default function RocketLaunch() {
  const phase = useAppStore((s) => s.phase);

  if (phase !== "launching") return null;

  // Hızlı warp yıldızları
  const streaks = Array.from({ length: 40 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.5,
    duration: 0.25 + Math.random() * 0.3,
  }));

  return (
    <motion.div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "linear-gradient(to bottom, #000414, #000a2a)",
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 1. Warp Speed Yıldızlar */}
      {streaks.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute", top: -200, left: s.left, width: 2, height: 150,
            background: "linear-gradient(to bottom, transparent, rgba(160,220,255,0.8), transparent)",
          }}
          animate={{ y: [0, 1500] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* 2. Titreyen Gökyüzü Glow'u (Ateş ışığı yansıması) */}
      <motion.div
        style={{
          position: "absolute", bottom: "-20%", left: "50%", width: "100%", height: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse at bottom, rgba(255,100,0,0.3) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 0.15, repeat: Infinity }}
      />

      {/* 3. UÇAN ROKET */}
      <motion.div
        style={{ position: "relative" }}
        initial={{ y: "150%" }} // Ekranın altından başla
        animate={{ y: ["150%", "15%", "-150%"] }} // Ortada yavaşla, sonra ekranın üstünden çık
        transition={{
          duration: 3.5, // Fırlatma animasyonu süresi
          times: [0, 0.4, 1],
          ease: "easeInOut"
        }}
      >
        {/* Roket Titreşimi */}
        <motion.div
          animate={{ x: [-3, 3, -1.5, 2.5, -3, 0], y: [-1.5, 1.5, -2.5, 2.5, 0] }}
          transition={{ duration: 0.08, repeat: Infinity }}
        >
          {/* Alevler artık SVG'nin İÇİNDE olduğu için hizalama sorunu imkansız */}
          <RocketSVG size={240} />
        </motion.div>
      </motion.div>

      {/* 4. Dramatik Metin */}
      <motion.div
        style={{
          position: "absolute", top: "20%", left: 0, right: 0, textAlign: "center",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1.1, 1.5] }}
        transition={{ duration: 3.5, times: [0, 0.2, 0.8, 1] }}
      >
        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: "3rem",
          color: "#fff", textShadow: "0 0 40px #4af, 0 0 80px #4af",
          margin: 0, letterSpacing: "0.2em",
        }}>
          FIRLATILIYOR
        </h1>
      </motion.div>
    </motion.div>
  );
}