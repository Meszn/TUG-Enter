import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../stores/appStore";

export default function CameraCapture() {
  const [open,   setOpen]   = useState(false);
  const [stream, setStream] = useState(null);
  
  const capturedImages = useAppStore((s) => s.capturedImages);
  const addCapturedImage = useAppStore((s) => s.addCapturedImage);
  const removeCapturedImage = useAppStore((s) => s.removeCapturedImage);
  const setCaptured = useAppStore((s) => s.setCapturedImage); // The final stitched 1024x1024 image

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null); // Used for snapping individual photos
  const stitchRef  = useRef(null); // Used for stitching the collage
  const fileInputRef = useRef(null);

  const [flyingPhoto, setFlyingPhoto] = useState(null); // { id, src, startPos }

  // Oto-Birleştirme (Stitch) Mantığı: Ne zaman capturedImages değişse, birleştir.
  useEffect(() => {
    if (!stitchRef.current) return;
    const c = stitchRef.current;
    const ctx = c.getContext("2d");
    
    if (capturedImages.length === 0) {
      setCaptured(null);
      return;
    }

    c.width = 1024;
    c.height = 1024;
    
    // Arka planı koyu lacivert/siyah doldur
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, 1024, 1024);

    const drawImageToGrid = (imgSrc, x, y, w, h) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // Resmi canvas'a (cover mantığıyla ortalayarak) çizmek için
          const imgAspect = img.width / img.height;
          const gridAspect = w / h;
          let drawW = w;
          let drawH = h;
          let drawX = x;
          let drawY = y;

          if (imgAspect > gridAspect) {
            drawW = h * imgAspect;
            drawX = x - (drawW - w) / 2;
          } else {
            drawH = w / imgAspect;
            drawY = y - (drawH - h) / 2;
          }
          
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.clip();
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();
          resolve();
        };
        img.src = imgSrc;
      });
    };

    const buildCollage = async () => {
      if (capturedImages.length === 1) {
        await drawImageToGrid(capturedImages[0], 0, 0, 1024, 1024);
      } else if (capturedImages.length === 2) {
        await drawImageToGrid(capturedImages[0], 0, 0, 512, 1024);
        await drawImageToGrid(capturedImages[1], 512, 0, 512, 1024);
      } else if (capturedImages.length === 3) {
        await drawImageToGrid(capturedImages[0], 0, 0, 512, 1024);
        await drawImageToGrid(capturedImages[1], 512, 0, 512, 512);
        await drawImageToGrid(capturedImages[2], 512, 512, 512, 512);
      } else if (capturedImages.length >= 4) {
        await drawImageToGrid(capturedImages[0], 0, 0, 512, 512);
        await drawImageToGrid(capturedImages[1], 512, 0, 512, 512);
        await drawImageToGrid(capturedImages[2], 0, 512, 512, 512);
        await drawImageToGrid(capturedImages[3], 512, 512, 512, 512);
      }

      // Bölme çizgileri çiz
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 8;
      if (capturedImages.length >= 2) {
        ctx.beginPath(); ctx.moveTo(512, 0); ctx.lineTo(512, 1024); ctx.stroke();
      }
      if (capturedImages.length >= 3) {
        ctx.beginPath(); ctx.moveTo(512, 512); ctx.lineTo(1024, 512); ctx.stroke();
      }
      if (capturedImages.length === 4) {
        ctx.beginPath(); ctx.moveTo(0, 512); ctx.lineTo(512, 512); ctx.stroke();
      }

      setCaptured(c.toDataURL("image/jpeg", 0.9));
    };

    buildCollage();
  }, [capturedImages, setCaptured]);


  const openCamera = useCallback(async () => {
    if (capturedImages.length >= 4) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:"environment", width:640, height:480 },
      });
      setStream(s); setOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 80);
    } catch { alert("Kamera erişimi reddedildi."); }
  }, [capturedImages.length]);

  const handleFileUpload = useCallback((e) => {
    if (capturedImages.length >= 4) return;
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Lütfen geçerli bir resim dosyası seçin.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      
      // Dosyadan yüklemede "fırlatma" efekti için yapay başlangıç noktası (butonun az yukarısı)
      setFlyingPhoto({ id: Date.now(), src, start: { x: 0, y: -50 } });
      
      setTimeout(() => {
        addCapturedImage(src);
        setFlyingPhoto(null);
      }, 500); // 500ms animasyon süresi
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Seçimi sıfırla
  }, [addCapturedImage, capturedImages.length]);

  const close = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null); setOpen(false);
  }, [stream]);

  const snap = useCallback(() => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const src = c.toDataURL("image/jpeg", 0.88);
    
    // Fly animation ayarla (kameradan ortaya fırlama)
    setFlyingPhoto({ id: Date.now(), src, start: { x: 0, y: 0 } });
    
    // Kamerayı kapatmadan da ard ardına çekim yapılabilir ama UX açısından kapatabiliriz veya açık bırakırız
    // 4 olduyda kapat. Açık kalsın, kullanıcı 4 tane doldursun!
    setTimeout(() => {
      addCapturedImage(src);
      setFlyingPhoto(null);
      if (capturedImages.length >= 3) close(); // 4. çekiliyorsa kapat
    }, 500);

  }, [addCapturedImage, capturedImages.length, close]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
      <canvas ref={canvasRef} style={{ display:"none" }} />
      <canvas ref={stitchRef} style={{ display:"none" }} />
      
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />

      {/* KAMERA EKRANI VEYA YÜKLEME BUTONLARI */}
      {!open ? (
        capturedImages.length < 4 && (
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", 
            alignItems: "center", justifyContent: "center", gap: "16px",
            minHeight: "140px", transition: "all 0.2s"
          }}>
            <div style={{
              background: "rgba(138, 180, 248, 0.1)", borderRadius: "50%", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(138, 180, 248, 0.8)" strokeWidth="1.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
              En fazla 4 kolaj fotoğrafı ekleyin ({capturedImages.length}/4)
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={openCamera} style={{
                background: "rgba(138, 180, 248, 0.15)", color: "#8ab4f8", border: "1px solid rgba(138, 180, 248, 0.4)",
                padding: "8px 16px", borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", cursor: "pointer"
              }}>Kamerayı Aç</button>
              <button onClick={() => fileInputRef.current?.click()} style={{
                background: "rgba(255, 255, 255, 0.05)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 16px", borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", cursor: "pointer"
              }}>Dosya Seç</button>
            </div>
          </div>
        )
      ) : (
        <div style={{
          position: "relative", borderRadius: "12px", overflow: "hidden", 
          border: "2px solid rgba(138, 180, 248, 0.6)", background: "#000",
          aspectRatio: "4/3", width: "100%"
        }}>
          <video ref={videoRef} autoPlay playsInline muted style={{
            width: "100%", height: "100%", objectFit: "cover"
          }} />
          
          {/* Tarayıcı çizgisi (Sci-Fi Efekti) */}
          <motion.div style={{
            position: "absolute", left: 0, right: 0, height: "4px",
            background: "linear-gradient(to right, transparent, rgba(138,180,248,0.8), transparent)",
            boxShadow: "0 0 12px rgba(138,180,248,1)"
          }} animate={{ top: ["10%", "90%", "10%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
          
          {/* Kamera Arayüz Butonları */}
          <div style={{
            position: "absolute", bottom: "16px", left: "0", right: "0",
            display: "flex", justifyContent: "center", gap: "20px"
          }}>
            <button onClick={snap} style={{
              background: "rgba(255,255,255,0.9)", border: "4px solid rgba(138, 180, 248, 0.8)",
              width: "56px", height: "56px", borderRadius: "50%", cursor: "pointer",
              boxShadow: "0 0 20px rgba(138, 180, 248, 0.5)"
            }}/>
            <button onClick={close} style={{
              position: "absolute", right: "20px", bottom: "10px",
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff", padding: "6px 12px", borderRadius: "8px", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", backdropFilter: "blur(4px)"
            }}>İptal</button>
          </div>
        </div>
      )}

      {/* FLYING PHOTO ANIMATION */}
      <AnimatePresence>
        {flyingPhoto && (
          <motion.img 
            key={flyingPhoto.id}
            src={flyingPhoto.src}
            initial={{ opacity: 1, scale: 0.8, x: flyingPhoto.start.x, y: flyingPhoto.start.y }}
            animate={{ opacity: 0, scale: 0.2, x: 0, y: 150 }} // Aşağıdaki kolaj gridine doğru hızla fırlasın
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{
              position: "absolute", top: "10%", left: "10%", width: "80%", height: "80%",
              objectFit: "cover", borderRadius: "12px", zIndex: 60,
              boxShadow: "0 0 40px rgba(138,180,248,0.8), 0 0 80px rgba(255,255,255,0.8)",
              border: "2px solid #fff", pointerEvents: "none"
            }}
          />
        )}
      </AnimatePresence>

      {/* DİNAMİK KOLAJ GRID MİMARİSİ */}
      {capturedImages.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: capturedImages.length === 1 ? "1fr" : "1fr 1fr",
          gridTemplateRows: capturedImages.length > 2 ? "1fr 1fr" : "1fr",
          gap: "8px", aspectRatio: "1/1", width: "100%",
          background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "8px",
          border: "1px solid rgba(255,255,255,0.1)", position: "relative",
          overflow: "hidden"
        }}>
          {/* Neon Border Glow (Sadece kolaj varken hafif çerçeve) */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            boxShadow: "inset 0 0 20px rgba(138,180,248,0.15)"
          }} />

          {capturedImages.map((src, i) => {
            // Eğer 3 foto varsa, ilki uzun boylu (2 satır) kaplar
            const isThreeGridFirst = capturedImages.length === 3 && i === 0;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.5, filter: "brightness(2) blur(8px)" }} 
                animate={{ opacity: 1, scale: 1, filter: "brightness(1) blur(0px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  position: "relative", borderRadius: "8px", overflow: "hidden",
                  gridRow: isThreeGridFirst ? "1 / span 2" : "auto",
                  border: "1px solid rgba(255,255,255,0.2)"
                }}
              >
                <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                
                {/* Sil Butonu (Hover'da Çıkar) */}
                <button
                  onClick={() => removeCapturedImage(i)}
                  style={{
                    position: "absolute", top: "6px", right: "6px",
                    background: "rgba(239, 68, 68, 0.8)", border: "none", color: "#fff",
                    width: "24px", height: "24px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", opacity: 0.8, transition: "opacity 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
                >✕</button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}