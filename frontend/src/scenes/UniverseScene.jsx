/**
 * UniverseScene.jsx — Gündüz Gözlemevi Sahnesi (Açık Tema)
 * - 4 katman parallax derinliği
 * - Büyük, detaylı gezegenler (tıklanabilir)
 * - Yüzey doku simülasyonu (procedural renk bandları)
 * - Atmosfer glow efektleri
 * - Açık gökyüzü renk paleti (sabah/öğleden sonra)
 */
import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles, Html } from "@react-three/drei";
import * as THREE from "three";
import { StarMap } from "./StarMap";

import { OrbitControls } from "@react-three/drei";

const mouse = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });
}

// (NebulaField completely removed for realistic space aesthetic)

// Altın/gül toz bulutsu — gündüz/sabah hissi
function GalaxyDust() {
  const ref  = useRef();
  const cur  = useRef({ x: 0, y: 0 });
  const count = 1100;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 14 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi   = (Math.random() - 0.5) * Math.PI * 0.32;
      pos[i*3]   = r * Math.cos(theta) * Math.cos(phi);
      pos[i*3+1] = r * Math.sin(phi);
      pos[i*3+2] = r * Math.sin(theta) * Math.cos(phi) - 32;
      const t = Math.random();
      // Altın-gül-leylak tonu
      col[i*3]   = 0.80 + t * 0.18;
      col[i*3+1] = 0.60 + t * 0.25;
      col[i*3+2] = 0.55 + t * 0.40;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.y += d * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} vertexColors transparent opacity={0.45}
        sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ── Detaylı Gezegen Bileşeni ─────────────────────────────────────────────────
function Planet({ config }) {
  const { name, position, radius, bands, atmosphereColor, ringColor, hasRing, emissive, orbitSpeed, orbitRadius, label } = config;

  const groupRef   = useRef();
  const bodyRef    = useRef();
  const atmRef     = useRef();
  const ringRef    = useRef();
  const orbitAngle = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);

  // Procedural yüzey için renk bandlarından texture oluştur
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Temel renk
    ctx.fillStyle = bands[0];
    ctx.fillRect(0, 0, size, size);

    // Yatay bantlar
    bands.slice(1).forEach((color, i) => {
      const y      = (i / bands.length) * size;
      const height = size / bands.length + (Math.random() - 0.5) * 20;
      const grad   = ctx.createLinearGradient(0, y, 0, y + height);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.3, color + "cc");
      grad.addColorStop(0.7, color + "cc");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, size, height);
    });

    // Gürültü noktaları
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 3;
      const a = Math.random() * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${a})`;
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }, [bands]);

  useFrame((_, d) => {
    orbitAngle.current += d * orbitSpeed;
    if (groupRef.current) {
      groupRef.current.position.x = position[0] + Math.cos(orbitAngle.current) * orbitRadius;
      groupRef.current.position.y = position[1] + Math.sin(orbitAngle.current * 0.7) * orbitRadius * 0.25;
      groupRef.current.position.z = position[2];
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += d * 0.12;
    }
    if (atmRef.current) {
      atmRef.current.material.opacity = hovered
        ? THREE.MathUtils.lerp(atmRef.current.material.opacity, 0.28, 0.08)
        : THREE.MathUtils.lerp(atmRef.current.material.opacity, 0.10, 0.05);
    }
    if (ringRef.current) ringRef.current.rotation.z += d * 0.015;
  });

  const hitRadius = radius * 2.5; // büyük tıklama alanı

  return (
    <group ref={groupRef}>
      {/* Geniş atmosfer dış halo */}
      <mesh>
        <sphereGeometry args={[radius * 1.35, 32, 32]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent opacity={hovered ? 0.08 : 0.04}
          depthWrite={false} />
      </mesh>

      {/* Atmosfer iç */}
      <mesh ref={atmRef}>
        <sphereGeometry args={[radius * 1.18, 32, 32]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent opacity={0.10}
          depthWrite={false} side={THREE.FrontSide} />
      </mesh>

      {/* Görünmez büyük hitbox */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}>
        <sphereGeometry args={[hitRadius, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Gezegen gövdesi */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive={config.isSun ? config.emissive : emissive}
          emissiveIntensity={config.isSun ? 1.5 : (hovered ? 0.45 : 0.18)}
          roughness={config.isSun ? 0 : 0.92}
          metalness={config.isSun ? 0 : 0.15} />
      </mesh>

      {/* Satürn halkası */}
      {hasRing && (
        <group ref={ringRef} rotation={[Math.PI / 2.3, 0.15, -0.05]}>
          {/* Dış yüzey halkalar - ringGeometry ile yatay */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.6, radius * 2.2, 128]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.25, radius * 1.55, 128]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Tooltip — karanlık cam, yüksek kontrast okunabilir */}
      {hovered && (
        <Html distanceFactor={10} center style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(10, 15, 30, 0.95)",
            border: "1px solid rgba(100, 150, 255, 0.4)",
            borderRadius: 8, padding: "8px 16px 8px 12px",
            display: "flex", alignItems: "center", gap: 10,
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
            whiteSpace: "nowrap",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: atmosphereColor,
              boxShadow: `0 0 10px ${atmosphereColor}, 0 0 20px ${atmosphereColor}`,
            }} />
            <div>
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 13,
                fontWeight: 800, color: "#ffffff", letterSpacing: "0.15em",
                textTransform: "uppercase"
              }}>{name}</div>
              <div style={{
                fontFamily: "'Space Mono',monospace", fontSize: 11,
                color: "rgba(200,220,255,0.8)", marginTop: 3,
              }}>{label}</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Gezegen konfigürasyonları ────────────────────────────────────────────────
// ── Gezegen konfigürasyonları (Güneş Sistemi) ────────────────────────────────────────────────
const PLANET_CONFIGS = [
  {
    name: "Güneş",
    label: "Sarı Cüce · Merkez",
    position: [0, 0, -80],
    radius: 14,
    bands: ["#fff0cc","#ffcc00","#ff8800","#ffaa00","#ffcc00"],
    atmosphereColor: "#ffaa00",
    emissive: "#ffbb00",
    hasRing: false,
    orbitSpeed: 0.001,
    orbitRadius: 0,
    isSun: true
  },
  {
    name: "Merkür",
    label: "Karasal · 0.39 AU",
    position: [0, 0, -80],
    radius: 0.8,
    bands: ["#8c8c8c","#a6a6a6","#737373","#b3b3b3","#666666"],
    atmosphereColor: "#aaaaaa",
    emissive: "#222222",
    hasRing: false,
    orbitSpeed: 0.045,
    orbitRadius: 22,
  },
  {
    name: "Venüs",
    label: "Karasal · 0.72 AU",
    position: [0, 0, -80],
    radius: 1.5,
    bands: ["#e6c280","#cc9933","#d9b366","#bf8026","#e6cc99"],
    atmosphereColor: "#e6c280",
    emissive: "#332211",
    hasRing: false,
    orbitSpeed: 0.035,
    orbitRadius: 32,
  },
  {
    name: "Dünya",
    label: "Karasal · 1.00 AU",
    position: [0, 0, -80],
    radius: 1.7,
    bands: ["#2b6cb0","#3182ce","#2c5282","#48bb78","#2a4365","#4299e1"],
    atmosphereColor: "#63b3ed",
    emissive: "#112244",
    hasRing: false,
    orbitSpeed: 0.025,
    orbitRadius: 45,
  },
  {
    name: "Mars",
    label: "Karasal · 1.52 AU",
    position: [0, 0, -80],
    radius: 1.1,
    bands: ["#8b2500","#a03010","#b54020","#6b1800","#c05030"],
    atmosphereColor: "#ff5522",
    emissive: "#4a0800",
    hasRing: false,
    orbitSpeed: 0.020,
    orbitRadius: 58,
  },
  {
    name: "Jüpiter",
    label: "Gaz Devi · 5.20 AU",
    position: [0, 0, -80],
    radius: 6.5,
    bands: ["#c8813a","#e8a060","#a05820","#d89050","#b86830","#f0b070"],
    atmosphereColor: "#ff9944",
    emissive: "#4a2000",
    hasRing: false,
    orbitSpeed: 0.012,
    orbitRadius: 85,
  },
  {
    name: "Satürn",
    label: "Gaz Devi · 9.58 AU",
    position: [0, 0, -80],
    radius: 5.5,
    bands: ["#d4b86a","#c4a450","#e8cc88","#b89040","#dcc070"],
    atmosphereColor: "#ffcc55",
    emissive: "#3a2800",
    hasRing: true,
    ringColor: "#e6c373",
    orbitSpeed: 0.008,
    orbitRadius: 115,
  },
  {
    name: "Uranüs",
    label: "Buz Devi · 19.2 AU",
    position: [0, 0, -80],
    radius: 3.2,
    bands: ["#6ac8d8","#4ab8cc","#80d8e8","#5ac0d0","#38aac0"],
    atmosphereColor: "#60d8ee",
    emissive: "#042030",
    hasRing: false,
    orbitSpeed: 0.005,
    orbitRadius: 140,
  },
  {
    name: "Neptün",
    label: "Buz Devi · 30.1 AU",
    position: [0, 0, -80],
    radius: 3.0,
    bands: ["#2244cc","#3366ee","#1a3aaa","#4488ff","#2255dd"],
    atmosphereColor: "#4488ff",
    emissive: "#060c40",
    hasRing: false,
    orbitSpeed: 0.003,
    orbitRadius: 165,
  }
];

// Yakın altın toz katmanı
function ForegroundDust() {
  const ref = useRef();
  const cur = useRef({ x: 0, y: 0 });
  const count = 250;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 28;
      pos[i*3+1] = (Math.random() - 0.5) * 18;
      pos[i*3+2] = -3 - Math.random() * 5;
    }
    return pos;
  }, []);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.y -= d * 0.004;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#f5d090" transparent opacity={0.30}
        sizeAttenuation depthWrite={false} />
    </points>
  );
}

// Katmanları saran grup parallax efekti için
function SceneWrapper({ children }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      // OrbitControls kamerayı yönettiği için parallax hissini 
      // tüm evren grubunu fareye göre hafifçe kaydırarak veriyoruz
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mouse.x * 0.8, 0.05);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, -mouse.y * 0.8, 0.05);
    }
  });

  return <group ref={ref}>{children}</group>;
}

export default function UniverseScene() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#000000" }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#020205']} />
        
        {/* Işıklar — Gerçekçi Uzay Aydınlatması */}
        <ambientLight intensity={0.15} color="#ffffff" />
        <pointLight position={[50, 20, 10]} intensity={2.5} color="#fffcf8" distance={200} decay={1.5} />
        <directionalLight position={[-15, 10, -10]} intensity={0.2} color="#8fb0ff" />

      {/* Serbest Kamera Kontrolleri - Cinematic & Agir */}
      <OrbitControls 
        makeDefault 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        panSpeed={0.6}
        zoomSpeed={0.8}
        rotateSpeed={0.4}
        minDistance={5}
        maxDistance={250}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI - Math.PI / 6}
        enableDamping={true} 
        dampingFactor={0.03} 
      />

      <SceneWrapper>
        {/* Katman 1: Derin uzay yıldızları */}
        <Stars radius={120} depth={80} count={3500} factor={3} saturation={0} fade speed={0.1} />

        {/* Katman 2: galaksi tozu */}
        <GalaxyDust />

        {/* Katman 3: parlak yakın parıltılar */}
        <Sparkles count={150} scale={40} size={1.2} speed={0.05} opacity={0.60} color="#ffffff" />

        {/* Katman 4: en yakın toz */}
        <ForegroundDust />

        {/* Gezegenler */}
        {PLANET_CONFIGS.map((cfg) => (
          <Planet key={cfg.name} config={cfg} />
        ))}

        {/* Proje yıldızları */}
        <StarMap />
      </SceneWrapper>
    </Canvas>
    </div>
  );
}