// Animated app loop — full-bleed, realistic usage simulation
// Loop: 8 seconds
// 0.0s - 1.5s: idle, header pulse, user "taps" first activity
// 1.5s - 3.0s: activity card highlights, timer ticks
// 3.0s - 4.5s: checkmark appears, progress bar jumps, "completada"
// 4.5s - 6.0s: scroll down, reveals day 4 unlocking (padlock → unlock)
// 6.0s - 8.0s: swipe transition to "day 4" screen, reset

function PhoneLoop({ childName, showDay, width }) {
  const [t, setT] = React.useState(0);
  const W = width || 320;
  const H = Math.round(W * 2.05);

  React.useEffect(() => {
    let start = Date.now();
    let raf;
    const tick = () => {
      let el = ((Date.now() - start) / 1000) % 8;
      setT(el);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const kid = childName || "tu hijo";

  // Phases
  const p1 = t < 1.5;                        // idle + finger moves to card 1
  const p2 = t >= 1.5 && t < 3.0;            // card 1 highlighted (timer)
  const p3 = t >= 3.0 && t < 4.5;            // card 1 completed (checkmark, progress jumps)
  const p4 = t >= 4.5 && t < 6.0;            // scroll reveal + unlock
  const p5 = t >= 6.0;                        // swipe + reset

  // Progress bar % — base 33%, jumps to 66% during p3
  const progPct = p3 || p4 || p5 ? 66 : 33;

  // Scroll offset for p4 (scroll up to reveal day 4)
  const scroll = p4 ? Math.min((t - 4.5) / 1.5, 1) * 40 : p5 ? 40 - Math.min((t - 6.0) / 2.0, 1) * 40 : 0;

  // Finger position
  // p1: moves from bottom to card1 center (tap at end)
  // p2: lingers near card1
  // p3: moves to checkmark
  // p4: swipes up
  // p5: off-screen
  let fx = 0, fy = 0, fOp = 0;
  if (p1) {
    const prog = t / 1.5;
    fx = 50 + (20 - 50) * prog;
    fy = 95 - (95 - 45) * prog;
    fOp = 1;
  } else if (p2) {
    fx = 20; fy = 45; fOp = 1 - (t - 1.5) / 1.5 * 0.3;
  } else if (p3) {
    const prog = (t - 3.0) / 1.5;
    fx = 20 + prog * 60;
    fy = 45;
    fOp = 0.7 - prog * 0.7;
  } else if (p4) {
    const prog = (t - 4.5) / 1.5;
    fx = 50; fy = 70 - prog * 30;
    fOp = prog < 0.3 ? prog / 0.3 * 0.8 : 0.8 - (prog - 0.3) / 0.7 * 0.8;
  }

  // Tap ripple
  const tap = (t > 1.3 && t < 1.7) || (t > 4.3 && t < 4.6);
  const tapR = tap ? Math.min((t % 0.4) * 40, 16) : 0;
  const tapOp = tap ? 1 - Math.min((t % 0.4) * 2.5, 1) : 0;

  // Checkmark animation on card 1
  const checkScale = p3 ? Math.min((t - 3.0) / 0.4, 1) : p4 || p5 ? 1 : 0;

  // Card 1 label/state
  const card1Completed = p3 || p4 || p5;

  // Padlock unlock animation during p4
  const unlockProg = p4 ? (t - 4.5) / 1.5 : p5 ? 1 : 0;

  // Transition fade for p5
  const resetFade = p5 ? (t - 6.0) / 2.0 : 0;

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
            width: W * 0.32, height: 22, background: "#1A1A1A", borderRadius: 14, zIndex: 20
          }} />
          {/* time */}
          <div style={{ position: "absolute", top: 10, left: 18, fontSize: 12, fontWeight: 800, zIndex: 19 }}>9:41</div>
          <div style={{ position: "absolute", top: 10, right: 18, fontSize: 11, zIndex: 19 }}>●●●● 5G</div>

          {/* app header */}
          <div style={{ marginTop: 36, background: "#E8532E", padding: "18px 18px 14px", color: "#fff" }}>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.01em" }}>DESCONECTA</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontWeight: 600 }}>
              DÍA {p5 && resetFade > 0.5 ? "4" : "3"} DE 21 • SEMANA 1
            </div>
          </div>

          {/* progress */}
          <div style={{ padding: "14px 18px 6px" }}>
            <div style={{ height: 6, borderRadius: 3, background: "#E8E0D8", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: progPct + "%",
                borderRadius: 3,
                background: "linear-gradient(90deg, #E8532E, #FF8A5C)",
                transition: "width 0.6s cubic-bezier(.2,.8,.2,1)"
              }} />
            </div>
            <div style={{ fontSize: 10, color: "#888", marginTop: 6, textAlign: "center", fontWeight: 600 }}>
              {card1Completed ? "2 de 3 actividades completadas" : "1 de 3 actividades completadas"}
            </div>
          </div>

          {/* cards container (with scroll sim) */}
          <div style={{
            padding: "8px 14px 14px",
            transform: `translateY(${-scroll}px)`,
            transition: "transform 0.05s linear"
          }}>
            {/* Activity 1 — Manualidades (will be completed) */}
            <div style={{
              position: "relative",
              background: "#fff",
              border: p1 && t > 0.8 ? "2px solid #E8532E" : "1.5px solid #E8E0D8",
              borderRadius: 12,
              padding: "12px 14px 12px 16px",
              marginBottom: 10,
              borderLeft: "5px solid #E8532E",
              transform: p2 && t < 2 ? "scale(1.01)" : "scale(1)",
              transition: "all 0.2s",
              opacity: card1Completed ? 0.85 : 1
            }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#1A1A1A", marginBottom: 3 }}>
                Manualidades creativas
              </div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>
                Ideal para cuando se aburre
              </div>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>
                Solo papel y lápices
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {card1Completed ? (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "#E8F5EE", padding: "3px 10px", borderRadius: 10,
                    fontSize: 10, fontWeight: 800, color: "#2D936C",
                    transform: `scale(${checkScale})`
                  }}>
                    <span>✓</span> Completada
                  </div>
                ) : (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: p2 ? "#FFF0EB" : "#F4EFE8",
                    padding: "3px 10px", borderRadius: 10,
                    fontSize: 10, fontWeight: 800,
                    color: p2 ? "#E8532E" : "#888"
                  }}>
                    {p2 ? `⏱ ${Math.max(0, 10 - Math.floor((t - 1.5) * 6))}:${String(60 - Math.floor(((t - 1.5) * 6 * 60) % 60)).padStart(2,"0")} min` : "10 min"}
                  </div>
                )}
              </div>

              {/* burst/confetti when check appears */}
              {p3 && t - 3.0 < 0.8 && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                    const prog = Math.min((t - 3.0) / 0.6, 1);
                    const dist = prog * 30;
                    const op = 1 - prog;
                    return (
                      <div key={i} style={{
                        position: "absolute", left: "50%", top: "50%",
                        width: 4, height: 4, borderRadius: 2,
                        background: ["#E8532E", "#2D936C", "#FFA94D", "#4FACFE"][i % 4],
                        transform: `translate(-50%, -50%) rotate(${deg}deg) translateX(${dist}px)`,
                        opacity: op
                      }} />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Activity 2 — Juego de construcción */}
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
                Para antes de dormir
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "#FFF0EB", padding: "3px 10px", borderRadius: 10,
                fontSize: 10, fontWeight: 800, color: "#E8532E"
              }}>
                Pendiente →
              </div>
            </div>

            {/* Activity 3 — locked / unlocking */}
            <div style={{
              background: unlockProg > 0.5 ? "#fff" : "#F5F2EC",
              border: unlockProg > 0.5 ? "1.5px solid #E8E0D8" : "1.5px dashed #D6CFC4",
              borderRadius: 12,
              padding: "14px",
              textAlign: "center",
              transition: "all 0.4s",
              borderLeft: unlockProg > 0.5 ? "5px solid #4FACFE" : "1.5px dashed #D6CFC4"
            }}>
              <div style={{
                fontSize: 18, marginBottom: 4,
                transform: `rotate(${unlockProg > 0.2 && unlockProg < 0.6 ? (unlockProg - 0.2) * 100 : 0}deg)`
              }}>
                {unlockProg > 0.6 ? "🎨" : "🔒"}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: unlockProg > 0.5 ? "#1A1A1A" : "#888" }}>
                {unlockProg > 0.6 ? `Actividad para ${kid}` : "Actividad del día 4"}
              </div>
              <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
                {unlockProg > 0.6 ? "Disponible ahora" : "Disponible mañana"}
              </div>
            </div>
          </div>

          {/* tap ripple */}
          {tap && (
            <div style={{
              position: "absolute",
              left: `${fx}%`, top: `${fy}%`,
              width: tapR * 2, height: tapR * 2,
              marginLeft: -tapR, marginTop: -tapR,
              borderRadius: "50%",
              border: "2px solid #E8532E",
              opacity: tapOp,
              pointerEvents: "none",
              zIndex: 30
            }} />
          )}

          {/* finger cursor */}
          {fOp > 0 && (
            <div style={{
              position: "absolute",
              left: `${fx}%`, top: `${fy}%`,
              transform: "translate(-30%, -10%)",
              fontSize: 26,
              opacity: fOp,
              pointerEvents: "none",
              zIndex: 29,
              filter: "drop-shadow(0 3px 5px rgba(0,0,0,.25))",
              transition: "left 0.1s linear, top 0.1s linear"
            }}>
              👆
            </div>
          )}

          {/* p5 reset fade */}
          {p5 && (
            <div style={{
              position: "absolute", inset: 0,
              background: "#FFFBF5",
              opacity: resetFade < 0.5 ? resetFade * 2 : (1 - resetFade) * 2,
              pointerEvents: "none",
              zIndex: 40
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

window.PhoneLoop = PhoneLoop;
