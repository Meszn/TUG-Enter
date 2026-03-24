/**
 * TUGDataPanel.jsx — Büyütülmüş ve net okunabilir versiyon
 * Sol: Hava verisi kartları | Sağ: Astronomi + saat
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Astronomik hesaplar ───────────────────────────────────────────────────────
function jdToDeg(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  let g = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  return ((g % 360) + 360) % 360;
}
function degToHMS(deg) {
  const h = Math.floor(deg / 15);
  const m = Math.floor(((deg / 15) - h) * 60);
  const s = Math.floor((((deg / 15) - h) * 60 - m) * 60);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function lstCalc(jd, lon) {
  return degToHMS(((jdToDeg(jd) + lon) % 360 + 360) % 360);
}
function moonPhase(p) {
  p = parseFloat(p);
  if (p < 0.06 || p > 0.94) return { icon: "🌑", label: "Yeni Ay" };
  if (p < 0.25) return { icon: "🌒", label: "Hilâl" };
  if (p < 0.32) return { icon: "🌓", label: "İlk Dördün" };
  if (p < 0.50) return { icon: "🌔", label: "Dolulmakta" };
  if (p < 0.56) return { icon: "🌕", label: "Dolunay" };
  if (p < 0.75) return { icon: "🌖", label: "Azalmakta" };
  if (p < 0.82) return { icon: "🌗", label: "Son Dördün" };
  return { icon: "🌘", label: "Son Hilâl" };
}
function windDir(d) {
  const m = {N:"K",NE:"KD",E:"D",SE:"GD",S:"G",SW:"GB",W:"B",NW:"KB",ESE:"GDE",ENE:"KDE",SSE:"GGD",SSW:"GGB",WNW:"BKB",WSW:"GBB",NNE:"KKD",NNW:"KKB"};
  return m[d] || d || "—";
}

// ── Ortak kutu stili ──────────────────────────────────────────────────────────
const boxStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(60,120,255,0.22)",
  borderRadius: 14,
  backdropFilter: "blur(18px)",
  boxShadow: "0 4px 18px rgba(10,30,120,0.12)",
  pointerEvents: "all",
};

// ── Meteoroloji kutusu ────────────────────────────────────────────────────────
function WeatherBox({ icon, label, tug, dag, unit = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...boxStyle, display: "flex", alignItems: "center", gap: 18, padding: "16px 22px" }}
    >
      {/* İkon */}
      <div style={{
        width: 56, height: 56, borderRadius: 12, flexShrink: 0,
        background: "rgba(26,110,255,0.09)",
        border: "1px solid rgba(26,110,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.8rem",
      }}>
        {icon}
      </div>
      {/* Değerler */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: "0.65rem",
          letterSpacing: "0.18em", color: "rgba(50,90,180,0.65)",
          marginBottom: 6, fontWeight: 700,
        }}>{label}</div>
        <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
          {tug != null && (
            <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.6rem", color: "#1a6eff", fontWeight: 800, letterSpacing: "0.08em" }}>TUG</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "1.15rem", color: "#0a1540", fontWeight: 700 }}>{tug}{unit}</span>
            </span>
          )}
          {dag != null && (
            <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.6rem", color: "#7c3aed", fontWeight: 800, letterSpacing: "0.08em" }}>DAG</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "1.15rem", color: "#0a1540", fontWeight: 700 }}>{dag}{unit}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Canlı saat ────────────────────────────────────────────────────────────────
function useLiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const days = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  return { time, day: days[time.getDay()] };
}

// ── Ana Export ────────────────────────────────────────────────────────────────
export default function TUGDataPanel() {
  const [data, setData]           = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/observatory/weather");
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date().toLocaleTimeString("tr-TR"));
    } catch { /* sessiz */ }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const { time, day } = useLiveClock();
  const jd     = data?.tug?.FullJD ? parseFloat(data.tug.FullJD) : null;
  const gmst   = jd ? degToHMS(jdToDeg(jd)) : "—";
  const lstTug = jd ? lstCalc(jd, 30.335) : "—";
  const lstDag = jd ? lstCalc(jd, 41.270) : "—";
  const moon   = data?.tug?.MoonPhase ? moonPhase(data.tug.MoonPhase) : null;
  const weekNum = Math.ceil(((time - new Date(time.getFullYear(), 0, 1)) / 86400000 + 1) / 7);

  // Ortak panel konteyneri
  const col = (extra = {}) => ({
    position: "fixed", zIndex: 15, pointerEvents: "none",
    display: "flex", flexDirection: "column", gap: 18, // Kartlar arası boşluk (spread out)
    ...extra,
  });

  return (
    <>
      {/* ════════════════ SOL PANEL: Hava ════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        style={col({ left: 32, top: 0, bottom: 0, justifyContent: "center", width: 340 })}
      >
        {/* Başlık */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: "'Orbitron',monospace", fontSize: "0.75rem",
          letterSpacing: "0.25em", color: "#ffffff",
          textShadow: "0 2px 12px rgba(10,30,120,0.7)",
          fontWeight: 800, paddingLeft: 6, marginBottom: 4,
        }}>
          <motion.div
            animate={{ scale: [1,1.5,1], opacity: [1,0.4,1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }}
          />
          CANLI METEOROLOJİ
        </div>

        {data ? (
          <>
            <WeatherBox icon="🌡️" label="SICAKLIK" unit="°C"
              tug={data.tug?.Temperature ?? null}
              dag={data.dag?.temp_air ?? null} />
            <WeatherBox icon="💧" label="NEM" unit="%"
              tug={data.tug?.Humidity ?? null}
              dag={data.dag?.rel_humidity ? Math.round(parseFloat(data.dag.rel_humidity)) : null} />
            <WeatherBox icon="🔵" label="BASINÇ" unit=" mb"
              tug={data.tug?.Barometer ?? null}
              dag={data.dag?.pressure ?? null} />
            <WeatherBox icon="💨" label="RÜZGAR"
              tug={data.tug?.Wind != null ? `${data.tug.Wind} km/h ${windDir(data.tug.WindDir)}` : null}
              dag={data.dag?.wind != null ? `${Math.round(parseFloat(data.dag.wind))} km/h` : null} />
          </>
        ) : (
          <div style={{
            ...boxStyle, padding: "16px",
            fontFamily: "'Space Mono',monospace", fontSize: "0.72rem",
            color: "rgba(50,90,180,0.5)", textAlign: "center",
          }}>
            Veri yükleniyor...
          </div>
        )}

        {lastUpdate && (
          <div style={{
            fontFamily: "'Space Mono',monospace", fontSize: "0.5rem",
            color: "rgba(255,255,255,0.55)", textAlign: "right",
            paddingRight: 4,
            textShadow: "0 1px 6px rgba(10,30,120,0.4)",
          }}>
            güncellendi {lastUpdate}
          </div>
        )}
      </motion.div>

      {/* ════════════════ SAĞ PANEL: Astronomi ════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        style={col({ right: 32, top: 0, bottom: 0, justifyContent: "center", width: 280 })}
      >
        {/* Ay evresi */}
        {moon && (
          <div style={{ ...boxStyle, padding: "16px 22px", display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: "2.6rem" }}>{moon.icon}</span>
            <div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.65rem", color: "rgba(50,90,180,0.6)", letterSpacing: "0.16em", marginBottom: 6, fontWeight: 800 }}>AY EVRESİ</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "1.2rem", color: "#0a1540", fontWeight: 700 }}>{moon.label}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.85rem", color: "rgba(50,90,180,0.65)", marginTop: 3 }}>
                {Math.round(parseFloat(data.tug.MoonPhase) * 100)}%
              </div>
            </div>
          </div>
        )}

        {/* Canlı saat */}
        <div style={{ ...boxStyle, padding: "20px 22px", textAlign: "center" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={time.toLocaleTimeString("tr-TR")}
              initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: "2.4rem", fontWeight: 800, color: "#0a1540", letterSpacing: "0.06em",
              }}
            >
              {time.toLocaleTimeString("tr-TR")}
            </motion.div>
          </AnimatePresence>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.75rem", color: "rgba(50,90,180,0.65)", letterSpacing: "0.18em", marginTop: 6, fontWeight: 700 }}>
            {day}
          </div>
        </div>

        {/* Tarih */}
        <div style={{ ...boxStyle, padding: "14px 22px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.6rem", color: "rgba(50,90,180,0.55)", letterSpacing: "0.16em", marginBottom: 6, fontWeight: 800 }}>TARİH</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "1.1rem", color: "#0a1540", fontWeight: 700 }}>
            {time.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.6rem", color: "rgba(50,90,180,0.5)", marginTop: 6 }}>
            HAFTA {weekNum}
          </div>
        </div>

        {/* Sidereal zaman */}
        <div style={{ ...boxStyle, padding: "16px 22px" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.6rem", color: "rgba(50,90,180,0.55)", letterSpacing: "0.16em", marginBottom: 10, fontWeight: 800 }}>SİDEREAL ZAMAN</div>
          {[
            { lbl: "GMST",    val: gmst,   col: "#7c3aed" },
            { lbl: "LST·TUG", val: lstTug, col: "#1a6eff" },
            { lbl: "LST·DAG", val: lstDag, col: "#7c3aed" },
            { lbl: "JD",      val: jd ? jd.toFixed(4) : "—", col: "rgba(50,90,180,0.55)" },
          ].map(({ lbl, val, col }) => (
            <div key={lbl} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "baseline", marginBottom: 6,
            }}>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.6rem", color: col, fontWeight: 800, letterSpacing: "0.08em" }}>{lbl}</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.85rem", color: "#0a1540", fontWeight: 700 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Gün doğumu / batımı */}
        {data?.tug?.Sunrise && (
          <div style={{ ...boxStyle, padding: "14px 18px", display: "flex", justifyContent: "space-around" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.55rem", color: "rgba(50,90,180,0.55)", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>DOĞUŞ</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.95rem", color: "#0a1540", fontWeight: 700 }}>🌅 {data.tug.Sunrise}</div>
            </div>
            <div style={{ width: 1, background: "rgba(60,120,255,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "0.55rem", color: "rgba(50,90,180,0.55)", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>BATIŞ</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.95rem", color: "#0a1540", fontWeight: 700 }}>🌇 {data.tug.Sunset}</div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
