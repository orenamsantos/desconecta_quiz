// Animated app tour — 3 screens, 12s loop
// S1 (0-4s):   Plan del día — dedo toca "Manualidades"
// S2 (4-8s):   Actividad abierta — checklist 3 pasos completándose, confete al final
// S3 (8-12s):  Progreso semanal — gráfico de tiempo de pantalla cayendo + streak 🔥
// Transiciones: swipe horizontal entre pantallas (0.5s)

function PhoneLoop({ childName, showDay, width }) {
  const [t, setT] = React.useState(0);
  const W = width || 320;
  const H = Math.round(W * 2.05);
  const LOOP = 12;

  // live time
  const fmt = (d) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  const [liveTime, setLiveTime] = React.useState(() => fmt(new Date()));
  React.useEffect(() => {
    const iv = setInterval(() => setLiveTime(fmt(new Date())), 1000);
    return () => clearInterval(iv);
  }, []);

  React.useEffect(() => {
    let start = Date.now();
    let raf;
    const tick = () => {
      let el = ((Date.now() - start) / 1000) % LOOP;
      setT(el);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const kid = childName || "tu hijo";

  // Screen state: 0, 1, 2. Transitions at t=4 and t=8 (0.5s swipe)
  // Current screen index (fractional during transitions)
  let screenF = 0;
  if (t < 3.7) screenF = 0;
  else if (t < 4.2) screenF = (t - 3.7) / 0.5; // 0 → 1
  else if (t < 7.7) screenF = 1;
  else if (t < 8.2) screenF = 1 + (t - 7.7) / 0.5; // 1 → 2
  else if (t < 11.5) screenF = 2;
  else screenF = 2 + (t - 11.5) / 0.5 * 0 - (t - 11.5) / 0.5 * 2; // fade back to 0 via opacity

  const screenTransX = -screenF * 100; // % translate

  // ───────── SCREEN 1: Plan del día ─────────
  const s1T = t < 4 ? t : 0;
  const s1FingerShow = s1T > 0.3 && s1T < 3.2;
  // finger moves from bottom to "Manualidades" card, taps at 2.2s
  const s1FingerProg = Math.min(Math.max((s1T - 0.3) / 2.0, 0), 1);
  const s1Fx = 55 - s1FingerProg * 20; // %
  const s1Fy = 85 - s1FingerProg * 45; // %
  const s1Tap = s1T > 2.2 && s1T < 2.6;

  // ───────── SCREEN 2: Actividad abierta ─────────
  const s2T = t >= 4 && t < 8 ? t - 4 : 0;
  // 3 checklist steps, check at t= 0.8, 1.8, 2.8 (relative to s2)
  const s2Checks = [s2T > 0.8, s2T > 1.8, s2T > 2.8];
  const s2Confete = s2T > 2.9 && s2T < 3.8;
  const s2ConfeteProg = Math.min((s2T - 2.9) / 0.9, 1);
  // timer counts down from 10:00
  const s2TimerSec = Math.max(0, Math.floor((10 * 60) - s2T * 60));
  const s2Min = Math.floor(s2TimerSec / 60);
  const s2Sec = s2TimerSec % 60;

  // ───────── SCREEN 3: Progreso semanal ─────────
  const s3T = t >= 8 && t < 12 ? t - 8 : 0;
  // bars grow in sequence, line appears, counter animates
  const s3BarProg = Math.min(s3T / 1.5, 1);
  const s3StreakProg = Math.max(0, Math.min((s3T - 1.5) / 0.8, 1));
  const s3CounterProg = Math.max(0, Math.min((s3T - 2.0) / 1.2, 1));

  // screen-time data: 7 days, going DOWN
  const screenData = [6.8, 6.2, 5.5, 4.9, 4.1, 3.4, 2.8]; // hours
  const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  // pill background + text for header day
  const headerDay = "3";

  return (
    <div style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* phone body */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: W * 0.11,
        background: "#1A1A1A",
        boxShadow: "0 20px 50px rgba(0,0,0,.30), 0 8px 20px rgba(0,0,0,.18)",
        padding: W * 0.025
      }}>
        {/* screen */}
        <div style={{
          position: "relative", width: "100%", height: "100%",
          borderRadius: W * 0.085, background: "#FFFBF5", overflow: "hidden"
        }}>
          {/* notch */}
          <div style={{
            position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
            width: W * 0.32, height: 22, background: "#1A1A1A", borderRadius: 14, zIndex: 50
          }} />
          {/* status bar */}
          <div style={{ position: "absolute", top: 10, left: 18, fontSize: 12, fontWeight: 800, zIndex: 49, fontVariantNumeric: "tabular-nums" }}>{liveTime}</div>
          <div style={{ position: "absolute", top: 10, right: 18, fontSize: 11, zIndex: 49 }}>●●●● 5G</div>

          {/* app header (persistent across screens) */}
          <div style={{ marginTop: 36, background: "#E8532E", padding: "18px 18px 14px", color: "#fff", position:"relative", zIndex:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <svg width="22" height="22" viewBox="0 0 48 48" style={{flexShrink:0}}>
                  {[0,45,90,135,180,225,270,315].map(function(a){
                    return <g key={a} transform={`rotate(${a} 24 24)`}>
                      <path d="M 24 4 L 26 10 L 22 10 Z" fill="#fff"/>
                    </g>;
                  })}
                  <circle cx="24" cy="24" r="9" fill="#fff"/>
                </svg>
                <div style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontWeight:400, fontSize:22, lineHeight:1, letterSpacing:"-0.015em" }}>
                  desconecta
                </div>
              </div>
              {/* screen dots */}
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: Math.abs(screenF - i) < 0.5 ? 16 : 5,
                    height: 5, borderRadius: 3,
                    background: Math.abs(screenF - i) < 0.5 ? "#fff" : "rgba(255,255,255,0.45)",
                    transition: "width 0.3s"
                  }}/>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 8, fontWeight: 700, letterSpacing:"0.1em" }}>
              DÍA {headerDay} DE 21 • SEMANA 1
            </div>
          </div>

          {/* SCREENS CAROUSEL */}
          <div style={{
            position: "relative",
            width: "300%",
            display: "flex",
            transform: `translateX(${screenTransX / 3}%)`,
            transition: "none"
          }}>
            {/* ─────── SCREEN 1: Plan del día ─────── */}
            <div style={{ width: "33.333%", padding: "14px 18px 14px" }}>
              <div style={{ height: 6, borderRadius: 3, background: "#E8E0D8", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: "33%", borderRadius: 3,
                  background: "linear-gradient(90deg, #E8532E, #FF8A5C)"
                }}/>
              </div>
              <div style={{ fontSize: 10, color: "#888", marginTop: 6, textAlign: "center", fontWeight: 600, marginBottom: 12 }}>
                1 de 3 actividades completadas
              </div>

              {/* Activity 1 — Manualidades */}
              <div style={{
                position: "relative",
                background: "#fff",
                border: s1FingerProg > 0.7 ? "2px solid #E8532E" : "1.5px solid #E8E0D8",
                borderRadius: 12,
                padding: "12px 14px 12px 16px",
                marginBottom: 10,
                borderLeft: "5px solid #E8532E",
                transform: s1FingerProg > 0.9 ? "scale(1.02)" : "scale(1)",
                transition: "all 0.25s"
              }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#1A1A1A", marginBottom: 3 }}>
                  Manualidades creativas
                </div>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>
                  Ideal para cuando se aburre
                </div>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>
                  Solo papel y lápices · 10 min
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "#FFF0EB", padding: "3px 10px", borderRadius: 10,
                    fontSize: 10, fontWeight: 800, color: "#E8532E"
                  }}>
                    Empezar →
                  </div>
                </div>
              </div>

              {/* Activity 2 — Juego construcción */}
              <div style={{
                background: "#fff",
                border: "1.5px solid #E8E0D8",
                borderRadius: 12,
                padding: "12px 14px 12px 16px",
                marginBottom: 10,
                borderLeft: "5px solid #2D936C"
              }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#1A1A1A", marginBottom: 3 }}>
                  Juego de construcción
                </div>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>
                  Para antes de dormir · 15 min
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "#F4EFE8", padding: "3px 10px", borderRadius: 10,
                  fontSize: 10, fontWeight: 800, color: "#888"
                }}>
                  Pendiente
                </div>
              </div>

              {/* Activity 3 — cuento */}
              <div style={{
                background: "#fff",
                border: "1.5px solid #E8E0D8",
                borderRadius: 12,
                padding: "12px 14px 12px 16px",
                borderLeft: "5px solid #4FACFE"
              }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#1A1A1A", marginBottom: 3 }}>
                  Cuento antes de dormir
                </div>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>
                  Para conectar en familia · 8 min
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "#F4EFE8", padding: "3px 10px", borderRadius: 10,
                  fontSize: 10, fontWeight: 800, color: "#888"
                }}>
                  Pendiente
                </div>
              </div>

              {/* finger + tap for S1 */}
              {s1FingerShow && (
                <>
                  <div style={{
                    position: "absolute", left: `${s1Fx}%`, top: `${s1Fy}%`,
                    transform: "translate(-30%, -10%)", fontSize: 26,
                    pointerEvents: "none", zIndex: 30,
                    filter: "drop-shadow(0 3px 5px rgba(0,0,0,.25))"
                  }}>👆</div>
                  {s1Tap && (
                    <div style={{
                      position:"absolute", left:`${s1Fx}%`, top:`${s1Fy}%`,
                      width: (s1T - 2.2) * 80, height: (s1T - 2.2) * 80,
                      marginLeft: -(s1T - 2.2) * 40, marginTop: -(s1T - 2.2) * 40,
                      borderRadius: "50%",
                      border: "2px solid #E8532E",
                      opacity: 1 - (s1T - 2.2) / 0.4,
                      pointerEvents: "none", zIndex: 29
                    }}/>
                  )}
                </>
              )}
            </div>

            {/* ─────── SCREEN 2: Actividad abierta ─────── */}
            <div style={{ width: "33.333%", padding: "14px 18px 14px", position: "relative" }}>
              {/* back arrow + title */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: 10, color:"#888", fontSize: 11 }}>
                <span>←</span><span>Volver al plan</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A", marginBottom: 2, lineHeight: 1.15 }}>
                Manualidades creativas
              </div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>
                Solo papel y lápices · 10 min
              </div>

              {/* Timer */}
              <div style={{
                background: s2T > 0 ? "#FFF0EB" : "#F4EFE8",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
                border: "1.5px solid #FFD9C7"
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#E8532E", letterSpacing: "0.08em" }}>
                  EN CURSO
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#E8532E", fontVariantNumeric: "tabular-nums" }}>
                  {String(s2Min).padStart(2,"0")}:{String(s2Sec).padStart(2,"0")}
                </div>
              </div>

              {/* Checklist */}
              <div style={{ fontSize: 11, fontWeight: 800, color: "#555", letterSpacing: "0.08em", marginBottom: 8 }}>
                PASO A PASO
              </div>
              {[
                "Dobla el papel por la mitad",
                "Dibuja la silueta de un animal",
                "Coloréalo con sus lápices favoritos"
              ].map((step, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: s2Checks[i] ? "#E8F5EE" : "#fff",
                  border: "1.5px solid " + (s2Checks[i] ? "#B8E0CC" : "#E8E0D8"),
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 8,
                  transition: "all 0.4s"
                }}>
                  <div style={{
                    flexShrink: 0,
                    width: 18, height: 18, borderRadius: 9,
                    background: s2Checks[i] ? "#2D936C" : "transparent",
                    border: "2px solid " + (s2Checks[i] ? "#2D936C" : "#D6CFC4"),
                    color: "#fff",
                    fontSize: 11, fontWeight: 900,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s"
                  }}>
                    {s2Checks[i] ? "✓" : ""}
                  </div>
                  <div style={{
                    fontSize: 11.5, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.35,
                    textDecoration: s2Checks[i] ? "line-through" : "none",
                    opacity: s2Checks[i] ? 0.6 : 1
                  }}>
                    {step}
                  </div>
                </div>
              ))}

              {/* Complete button appears at end */}
              {s2T > 2.8 && (
                <div style={{
                  marginTop: 6,
                  background: "#2D936C",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "10px 14px",
                  textAlign: "center",
                  fontSize: 12, fontWeight: 900,
                  opacity: Math.min((s2T - 2.8) / 0.3, 1),
                  transform: `translateY(${Math.max(0, (1 - (s2T - 2.8) / 0.3) * 8)}px)`
                }}>
                  ✓ ¡Actividad completada!
                </div>
              )}

              {/* Confete */}
              {s2Confete && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 25 }}>
                  {Array.from({length: 18}).map((_, i) => {
                    const angle = (i / 18) * 360;
                    const dist = s2ConfeteProg * (60 + (i % 3) * 20);
                    const xOff = Math.cos(angle * Math.PI / 180) * dist;
                    const yOff = Math.sin(angle * Math.PI / 180) * dist + s2ConfeteProg * s2ConfeteProg * 40;
                    const colors = ["#E8532E", "#2D936C", "#FFA94D", "#4FACFE", "#F9C74F"];
                    return (
                      <div key={i} style={{
                        position: "absolute",
                        left: "50%", top: "70%",
                        width: 6, height: 6, borderRadius: 1.5,
                        background: colors[i % colors.length],
                        transform: `translate(calc(-50% + ${xOff}px), calc(-50% + ${yOff}px)) rotate(${i * 40 + s2ConfeteProg * 360}deg)`,
                        opacity: 1 - s2ConfeteProg
                      }}/>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─────── SCREEN 3: Progreso semanal ─────── */}
            <div style={{ width: "33.333%", padding: "14px 18px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#555", letterSpacing: "0.08em", marginBottom: 10 }}>
                TU PROGRESO
              </div>

              {/* Big number: horas recuperadas */}
              <div style={{
                background: "#fff",
                border: "1.5px solid #E8E0D8",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 12
              }}>
                <div style={{ fontSize: 10, color: "#888", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
                  HORAS RECUPERADAS ESTA SEMANA
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: 42, fontWeight: 400, color: "#E8532E",
                    lineHeight: 1, fontVariantNumeric: "tabular-nums"
                  }}>
                    {(s3CounterProg * 14).toFixed(1)}
                  </div>
                  <div style={{ fontSize: 14, color: "#555", fontWeight: 600 }}>horas</div>
                </div>
                <div style={{ fontSize: 10, color: "#2D936C", marginTop: 6, fontWeight: 700 }}>
                  ↓ 35% menos pantalla vs. semana pasada
                </div>
              </div>

              {/* Bar chart */}
              <div style={{
                background: "#fff",
                border: "1.5px solid #E8E0D8",
                borderRadius: 12,
                padding: "14px 14px 12px",
                marginBottom: 12
              }}>
                <div style={{ fontSize: 10, color: "#888", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
                  TIEMPO DE PANTALLA · 7 DÍAS
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90, paddingBottom: 18, position: "relative" }}>
                  {screenData.map((h, i) => {
                    const maxH = 7;
                    const barH = (h / maxH) * 75;
                    const revealT = i / screenData.length;
                    const appeared = s3BarProg > revealT;
                    const growFrac = appeared ? Math.min((s3BarProg - revealT) / (1 / screenData.length), 1) : 0;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                        <div style={{ fontSize: 8, color: "#888", marginBottom: 3, opacity: growFrac, fontWeight: 700 }}>
                          {h.toFixed(1)}h
                        </div>
                        <div style={{
                          width: "100%",
                          height: barH * growFrac,
                          borderRadius: "3px 3px 0 0",
                          background: i < 3 ? "linear-gradient(to top, #E8532E, #FF8A5C)" : "linear-gradient(to top, #2D936C, #4FB989)",
                          transition: "height 0.1s linear"
                        }}/>
                        <div style={{ fontSize: 9, color: "#888", marginTop: 4, fontWeight: 700 }}>{dayLabels[i]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Streak */}
              <div style={{
                background: "linear-gradient(135deg, #FFF4E8, #FFE8DC)",
                border: "1.5px solid #FFD9C7",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: s3StreakProg,
                transform: `translateY(${(1 - s3StreakProg) * 10}px)`,
                transition: "none"
              }}>
                <div style={{ fontSize: 32, lineHeight: 1 }}>🔥</div>
                <div>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: 22, fontWeight: 400, color: "#1A1A1A", lineHeight: 1
                  }}>
                    {Math.floor(s3StreakProg * 7)} días seguidos
                  </div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 3, fontWeight: 600 }}>
                    ¡Sigue así! {kid} te lo agradece.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PhoneLoop = PhoneLoop;
