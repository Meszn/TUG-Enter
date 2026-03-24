import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Billboard, Trail } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../stores/appStore";

function ProjectStar({ project, position, colorIndex }) {
  const coreRef = useRef();
  const coronaRef = useRef();
  const outerGlowRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [trailActive, setTrailActive] = useState(false);
  const setSelected = useAppStore((s) => s.setSelectedProject);
  const selected    = useAppStore((s) => s.selectedProject);
  const isSelected  = selected?.id === project.id;
  const isShooting  = project.is_completed;
  const trailTargetRef = useRef();
  const shootRef = useRef({ time: 0, initialPos: null });

  useEffect(() => {
    if (isShooting) {
      // Hemen başlatıyoruz ki kullanıcı beklemek zorunda kalmasın
      setTrailActive(true);
    } else {
      setTrailActive(false);
    }
  }, [isShooting]);

  // Gerçekçi yıldız renk paletleri (Mavi-Beyaz Süperdev -> Kırmızı Cüce)
  const COLORS = [
    "#b5d8ff", // O-type (Mavi süper parlak)
    "#c4e1ff", // B-type (Mavi-beyaz)
    "#fdf4dc", // F-type (Sarı-beyaz)
    "#ffeaae", // G-type (Güneş benzeri sarı)
    "#ffc370", // K-type (Turuncu)
    "#ff8844", // M-type (Kırmızı-turuncu)
    "#bbccff"  // Siriun beyaz-mavi
  ];
  const color = COLORS[colorIndex % COLORS.length];

  const phaseOff = useMemo(() => Math.random() * Math.PI * 2, []);
  const speed    = useMemo(() => 0.5 + Math.random() * 0.8, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    // Güneş patlaması/titreşimi benzeri karmaşık bir dalga fonksiyonu
    const pulse = 0.85 + 0.15 * Math.sin(t * speed + phaseOff) + 0.05 * Math.sin(t * speed * 3.1);
    const active = hovered || isSelected;

    if (coreRef.current) {
      const targetScale = active ? 2.5 : pulse;
      coreRef.current.scale.setScalar(THREE.MathUtils.lerp(coreRef.current.scale.x, targetScale, 0.1));
      coreRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        coreRef.current.material.emissiveIntensity,
        active ? 15 : 6 * pulse,
        0.1
      );
    }
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(active ? pulse * 1.4 : pulse);
      coronaRef.current.material.opacity = THREE.MathUtils.lerp(
        coronaRef.current.material.opacity,
        active ? 0.9 : 0.6 * pulse,
        0.1
      );
    }
    if (outerGlowRef.current) {
      outerGlowRef.current.scale.setScalar(active ? pulse * 1.5 : pulse);
      outerGlowRef.current.material.opacity = THREE.MathUtils.lerp(
        outerGlowRef.current.material.opacity,
        active ? 0.4 : 0.15 * pulse,
        0.05
      );
    }

    if (isShooting && groupRef.current) {
      if (!shootRef.current.initialPos) {
        shootRef.current.initialPos = [
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z
        ];
      }
      
      shootRef.current.time += delta; 
      const st = shootRef.current.time;
      
      // 15 saniyelik bir animasyon
      const progress = Math.min(st / 15.0, 1.0);
      const ease = Math.pow(progress, 5);
      
      const [ix, iy, iz] = shootRef.current.initialPos;
      groupRef.current.position.x = ix + ease * 40; 
      groupRef.current.position.y = iy + ease * 25; 
      groupRef.current.position.z = iz - ease * 15;
      
      const scaleDown = Math.max(0.001, 1 - Math.pow(progress, 3));
      groupRef.current.scale.setScalar(scaleDown);

      // Trail target mesh'ini world-space'de güncelle (Double transform'u önlemek için bağımsız mesh)
      if (trailTargetRef.current) {
        trailTargetRef.current.position.copy(groupRef.current.position);
      }
    }
  });

  return (
    <>
      {/* Kayarken Arkadan Çıkan Işık Kuyruğu (Trail/Tail) */}
      {isShooting && trailActive && (
        <Trail
          width={0.8}
          length={80}
          color={color}
          attenuation={(t) => Math.pow(t, 2)}
        >
          {/* Ref eklendi - useFrame tarafından güncellenir */}
          <mesh ref={trailTargetRef}>
            <sphereGeometry args={[0.01]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </Trail>
      )}

      <group ref={groupRef} position={position}>
        {/* 3. Dev Dış Hale (Göz kamaştırıcı glow) */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.15} 
          depthWrite={false}
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* 2. Yoğun Korona (Ana parlama katmanı) */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.6} 
          depthWrite={false}
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* 1. Aşırı Parlak Beyaz/Renkli Çekirdek (Yıldızın kendisi) */}
      <mesh ref={coreRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelected(isSelected ? null : project);
        }}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff" 
          emissive={color}
          emissiveIntensity={6} 
          toneMapped={false} 
        />
      </mesh>

      {/* Sabit isim etiketi */}
      <Billboard follow lockX={false} lockY={false}>
        <Html distanceFactor={10} center style={{ pointerEvents: "none" }}>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 12,
            fontWeight: 800,
            color: "#ffffff",
            textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
            letterSpacing: "0.15em",
            whiteSpace: "nowrap",
            textAlign: "center",
            transform: "translateY(36px)",
          }}>
            {project.project_name}
          </div>
        </Html>
      </Billboard>

      {/* Detaylı Tooltip — hover'da */}
      {hovered && !isSelected && (
        <Billboard follow lockX={false} lockY={false}>
          <Html distanceFactor={8} center style={{ pointerEvents: "none" }}>
            <div style={{
              background: "rgba(2,5,15,0.85)",
              border: `1px solid ${color}88`,
              borderRadius: 8, padding: "8px 14px",
              color: "#ffffff", fontSize: 13,
              fontFamily: "'Orbitron',monospace",
              whiteSpace: "nowrap",
              backdropFilter: "blur(4px)",
              letterSpacing: "0.08em",
              boxShadow: `0 0 25px ${color}44, inset 0 0 10px ${color}22`,
              transform: "translateY(-45px)",
            }}>
              <div style={{ fontWeight: 800, textShadow: `0 0 8px ${color}` }}>{project.project_name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                {project.responsible} · Tıkla &rarr; Detay
              </div>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
    </>
  );
}

export function StarMap() {
  const projects = useAppStore((s) => s.projects) || [];

  const positions = useMemo(() =>
    projects.map((_, i) => {
      // Altın oran tabanlı küresel dağılım — çakışmaz
      const phi   = Math.acos(1 - (2 * (i + 0.5)) / Math.max(projects.length, 1));
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r     = 4 + (i % 4) * 1.8;
      return [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.5,
        -5 - (i % 4) * 2.0,
      ];
    }),
  [projects]);

  return (
    <group>
      {/* Siyah ekran hatasını önleyen Sabit Görünmez Çapa */}
      <mesh position={[0,0,-5]}>
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} color="#000000" />
      </mesh>
      
      {projects.map((p, i) => (
        <ProjectStar key={p.id} project={p} position={positions[i]} colorIndex={i} />
      ))}
    </group>
  );
}