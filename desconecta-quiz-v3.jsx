const { useState, useEffect, useRef } = React;

// ─── V3: 11 passos + 2 telas-espelho + diagnóstico com score ─────────────────
const PHASES = [
  { id: 1, label: "DIAGNÓSTICO",   steps: [1,2,3,4] },
  { id: 2, label: "COMPORTAMIENTO",steps: [5,6,7] },
  { id: 3, label: "HONESTIDAD",    steps: [8] },
  { id: 4, label: "TU PLAN",       steps: [9] },
];

const STEPS = [
  {id:1,phase:1,type:"single",slug:"age",
    headline:"¿Cuántos años tiene tu hijo?",
    micro:"Si tienes más de uno, piensa en el que MÁS usa pantallas.",
    options:[{value:"2-3",label:"2–3 años"},{value:"4-5",label:"4–5 años"},{value:"6-7",label:"6–7 años"},{value:"8-9",label:"8–9 años"},{value:"10-12",label:"10–12 años"}]},
  {id:2,phase:1,type:"single",slug:"screenTime",
    headline:"¿Cuántas horas al día pasa frente a una pantalla?",
    micro:"Sé honesto. Nadie más va a verlo.",
    options:[{value:"less-1h",label:"Menos de 1 hora"},{value:"1-2h",label:"1 a 2 horas"},{value:"2-4h",label:"2 a 4 horas"},{value:"4-6h",label:"4 a 6 horas"},{value:"6h+",label:"Más de 6 horas"},{value:"unknown",label:"No estoy seguro (es mucho)"}]},
  // id:3 é ESPELHO (não-pergunta)
  {id:3,phase:1,type:"mirror",slug:"mirror1"},
  {id:4,phase:1,type:"multi",slug:"criticalMoments",minSelect:1,
    headline:"¿En qué momento la pantalla es IMPOSIBLE de quitar?",
    micro:"Sé específico. Marca todos los que duelen.",
    options:[{value:"morning",label:"Al despertar"},{value:"meals",label:"Durante las comidas"},{value:"car",label:"En el auto"},{value:"bored",label:"Cuando se aburre"},{value:"tantrum",label:"Cuando hace berrinche"},{value:"bedtime",label:"Antes de dormir"},{value:"chores",label:"Mientras hago tareas del hogar"},{value:"work",label:"Mientras trabajo"}]},
  {id:5,phase:1,type:"single",slug:"reaction",
    headline:"Cuando le quitas la pantalla… ¿reconoces a tu hijo?",
    micro:"Esta es la pregunta más importante del test.",
    options:[{value:"cries",label:"Llora y hace berrinche"},{value:"aggressive",label:"Se pone agresivo o grita"},{value:"apathetic",label:"Se queda sin hacer nada, apático"},{value:"asks-again",label:"Acepta, pero vuelve a pedir"},{value:"accepts",label:"La acepta bien"}]},
  // id:6 é TRANSIÇÃO (vilão)
  {id:6,phase:2,type:"transition",slug:"trans1"},
  {id:7,phase:2,type:"multi",slug:"triedMethods",minSelect:1,
    headline:"¿Qué has intentado… que NO funcionó?",
    micro:"Todo lo que hayas probado cuenta. No hay respuestas incorrectas.",
    options:[{value:"cold-turkey",label:"Quitar todo de golpe"},{value:"schedules",label:"Poner horarios fijos"},{value:"parental-control",label:"Apps de control parental"},{value:"alternatives",label:"Ofrecer alternativas"},{value:"talking",label:"Hablar y explicar"},{value:"nothing",label:"Nada todavía (por eso estoy aquí)"}]},
  {id:8,phase:2,type:"single",slug:"biggestChallenge",
    headline:"Sé honesto contigo mismo: ¿cuál es la excusa que más usas?",
    micro:"La respuesta más dolorosa suele ser la más verdadera.",
    options:[{value:"no-time",label:"No tengo tiempo para entretenerlo"},{value:"no-ideas",label:"No sé qué ofrecerle en su lugar"},{value:"tantrums",label:"La pelea no vale la pena"},{value:"partner",label:"Mi pareja no colabora"},{value:"other-adults",label:"Otros adultos le dan pantalla"},{value:"myself",label:"Yo mismo no puedo soltar mi celular"}]},
  // id:9 = nome do filho + nome do pai/mãe juntos
  {id:9,phase:4,type:"names",slug:"names",
    headline:"Antes de mostrarte el diagnóstico…",
    micro:"Vamos a personalizar todo con los nombres reales."},
];

const TOTAL_STEPS = 9;

const COUNTRIES = [
  {name:"Argentina",flag:"🇦🇷",code:"+54"},
  {name:"Bolivia",flag:"🇧🇴",code:"+591"},
  {name:"Brasil",flag:"🇧🇷",code:"+55"},
  {name:"Chile",flag:"🇨🇱",code:"+56"},
  {name:"Colombia",flag:"🇨🇴",code:"+57"},
  {name:"Costa Rica",flag:"🇨🇷",code:"+506"},
  {name:"Ecuador",flag:"🇪🇨",code:"+593"},
  {name:"El Salvador",flag:"🇸🇻",code:"+503"},
  {name:"España",flag:"🇪🇸",code:"+34"},
  {name:"Estados Unidos",flag:"🇺🇸",code:"+1"},
  {name:"Guatemala",flag:"🇬🇹",code:"+502"},
  {name:"Honduras",flag:"🇭🇳",code:"+504"},
  {name:"México",flag:"🇲🇽",code:"+52"},
  {name:"Nicaragua",flag:"🇳🇮",code:"+505"},
  {name:"Panamá",flag:"🇵🇦",code:"+507"},
  {name:"Paraguay",flag:"🇵🇾",code:"+595"},
  {name:"Perú",flag:"🇵🇪",code:"+51"},
  {name:"República Dominicana",flag:"🇩🇴",code:"+1"},
  {name:"Uruguay",flag:"🇺🇾",code:"+598"},
  {name:"Venezuela",flag:"🇻🇪",code:"+58"},
];

const LOADING_MSGS = [
  "Calculando el score de dependencia…",
  "Cruzando edad con reacción emocional…",
  "Comparando con 12.000 familias…",
  "Proyectando trayectoria en 6 meses…",
  "Seleccionando actividades para {child}…",
  "Armando el plan de 21 días…",
];

const GCSS = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#FFFBF5;--sf:#FFF;--pr:#E8532E;--pl:#FFF0EB;--sc:#2D936C;--sl:#E8F5EE;--dn:#D32F2F;--dl:#FDEAEA;--tx:#1A1A1A;--tm:#555;--tl:#888;--bd:#E8E0D8;--gold:#C9A961;--rd:14px;--ft:'Inter',-apple-system,'Segoe UI',sans-serif;--fh:'Instrument Serif',Georgia,serif}
h1,h2,h3{font-family:var(--fh);font-weight:400;letter-spacing:-0.01em;line-height:1.15}

/* ─── S3: 4 ACTOS VISUALES ─── */
/* ACTO 1 — Diagnóstico clínico (stone, serio, silencioso) */
[data-act="1"]{--bg:#F7F5F0;--sf:#FFFEFB;--bd:#E3DFD6;--tx:#1A1A1A;--tm:#4A4A4A}
/* ACTO 2 — Espejo/Verdad incómoda (terracota profunda, "livro antigo") */
[data-act="2"]{--bg:#2D1810;--sf:#3A2218;--bd:#4A2E22;--tx:#F5EDE4;--tm:#D4BFA8;--tl:#9A8270;--pl:#3D1F16;--pr:#FF8C6B;--dl:#3D1F16;--dn:#FF6B47}
[data-act="2"] h1,[data-act="2"] h2,[data-act="2"] h3{color:#F5EDE4}
/* ACTO 3 — Compromiso/Esperanza (crème cálido, verde) */
[data-act="3"]{--bg:#FFFBF5;--sf:#FFF;--pr:#2D936C;--pl:#E8F5EE}
/* ACTO 4 — Resultado/Pricing premium (dourado sutil) */
[data-act="4"]{--bg:#FFFBF5;--sf:#FFFDF8}

@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes si{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}
@keyframes so{from{opacity:1;transform:none}to{opacity:0;transform:translateX(-30px)}}
@keyframes sh{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes mf{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes countUp{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
@keyframes drawBar{from{width:0}to{width:var(--bw)}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes actTransition{0%{opacity:0;filter:blur(8px)}50%{opacity:0.4;filter:blur(2px)}100%{opacity:1;filter:none}}
@keyframes flicker{0%,100%{opacity:1}50%{opacity:0.92}52%{opacity:1}54%{opacity:0.95}}
@keyframes slowPulse{0%,100%{transform:scale(1);box-shadow:0 4px 14px rgba(232,83,46,.25)}50%{transform:scale(1.015);box-shadow:0 6px 22px rgba(255,140,107,.45)}}`;

// S3: mapeia step id → ato visual (1-4)
function actForStep(stepId){
  if([3,6].indexOf(stepId)>=0) return 2; // espelho + transição = verdade incômoda (só 2 picos)
  if([9].indexOf(stepId)>=0) return 3;   // nomes = esperança
  return 1; // 1,2,4,5,7,8 = diagnóstico clínico
}

const SH = {fontFamily:"var(--ft)",background:"var(--bg)",color:"var(--tx)",height:"100%",overflowY:"auto",position:"relative",lineHeight:1.55,WebkitOverflowScrolling:"touch"};
const INP = {width:"100%",padding:"16px 14px",fontSize:16,fontFamily:"var(--ft)",border:"2px solid var(--bd)",borderRadius:"var(--rd)",background:"var(--sf)",outline:"none",fontWeight:600,color:"var(--tx)"};

function Btn({children,onClick,disabled,pulse}){
  return <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"17px 24px",background:disabled?"#ccc":"var(--pr)",color:disabled?"#999":"#fff",border:"none",borderRadius:"var(--rd)",fontFamily:"var(--ft)",fontSize:16,fontWeight:900,cursor:disabled?"default":"pointer",transition:"all .15s",boxShadow:disabled?"none":"0 4px 16px rgba(232,83,46,.35)",letterSpacing:"0.01em",animation:pulse&&!disabled?"slowPulse 2.4s ease-in-out infinite":"none"}}>{children}</button>;
}

// ─── LOGO: sol folk LATAM (8 raios triangulares + círculo) + wordmark serif ──
function Logo({color,size}){
  var c = color || "var(--pr)";
  var s = size || 1;
  var markPx = s*30;
  return <div style={{display:"inline-flex",alignItems:"center",gap:s*10,fontFamily:"var(--fh)",fontWeight:400,fontSize:s*28,color:c,letterSpacing:"-0.015em",lineHeight:1}}>
    <LogoMark color={c} size={markPx}/>
    <span>desconecta</span>
  </div>;
}

// Sol folk: 8 raios triangulares + disco central
function LogoMark({color,size}){
  var c = color || "var(--pr)";
  var s = size || 32;
  return <svg width={s} height={s} viewBox="0 0 48 48" style={{display:"inline-block",verticalAlign:"middle",flexShrink:0}}>
    {[0,45,90,135,180,225,270,315].map(function(a){
      return <g key={a} transform={`rotate(${a} 24 24)`}>
        <path d="M 24 4 L 26 10 L 22 10 Z" fill={c}/>
      </g>;
    })}
    <circle cx="24" cy="24" r="9" fill={c}/>
  </svg>;
}

function PBar({pid,cur}){
  var pct = Math.round((cur / TOTAL_STEPS) * 100);
  var activePhase = PHASES.find(function(p){return p.id===pid}) || PHASES[0];
  return <div style={{padding:"52px 18px 10px",background:"var(--bg)",position:"sticky",top:0,zIndex:10}}>
    <div style={{display:"flex",gap:4,marginBottom:8}}>
      {PHASES.map(function(p){return <div key={p.id} style={{flex:p.steps.length,height:4,borderRadius:2,background:p.id<=pid?"var(--pr)":"var(--bd)",transition:"background .3s"}}/>})}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,fontWeight:700}}>
      <span style={{color:"var(--pr)",fontWeight:900,letterSpacing:"0.08em"}}>FASE {activePhase.id} DE {PHASES.length} — {activePhase.label}</span>
      <span style={{color:"var(--tl)"}}>{pct}% • paso {cur}/{TOTAL_STEPS}</span>
    </div>
  </div>;
}

function OCard({o,sel,onClick}){
  return <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:sel?"var(--pl)":"var(--sf)",border:sel?"2px solid var(--pr)":"2px solid var(--bd)",borderRadius:"var(--rd)",cursor:"pointer",textAlign:"left",transition:"all .15s",fontFamily:"var(--ft)",transform:sel?"scale(1.01)":"none",boxShadow:sel?"0 2px 10px rgba(232,83,46,.12)":"none"}}>
    <span style={{fontSize:14,fontWeight:sel?800:600,color:"var(--tx)",flex:1,lineHeight:1.4}}>{o.label}</span>
    {sel && <span style={{color:"var(--pr)",fontWeight:800,fontSize:18}}>✓</span>}
  </button>;
}

// ─── Personal countdown (72h desde la primera visita, en UTC) ───────────────────
// DEBUG: para probar "3 días pasados" ahora mismo, abrí la consola del navegador y ejecutá:
//   localStorage.setItem('desconecta_inicio_oferta_utc', (Date.now() - 1000*60*60*73).toString()); location.reload();
// Para resetear el contador (simular primera visita):
//   localStorage.removeItem('desconecta_inicio_oferta_utc'); location.reload();
function PersonalCountdown({onExpire}){
  const KEY = 'desconecta_inicio_oferta_utc';
  const DURATION_MS = 72 * 60 * 60 * 1000; // 72h
  const [now, setNow] = useState(Date.now());

  // Inicializa el inicio de la oferta en la primera visita (UTC absoluto via Date.now())
  useEffect(function(){
    if(!localStorage.getItem(KEY)){
      localStorage.setItem(KEY, Date.now().toString());
    }
  }, []);

  // Tick cada segundo
  useEffect(function(){
    var iv = setInterval(function(){ setNow(Date.now()); }, 1000);
    return function(){ clearInterval(iv); };
  }, []);

  var startRaw = localStorage.getItem(KEY);
  var start = startRaw ? parseInt(startRaw, 10) : now;
  var endTs = start + DURATION_MS;
  var remaining = endTs - now;
  var expired = remaining <= 0;

  useEffect(function(){ if(expired && onExpire) onExpire(); }, [expired]);

  if(expired){
    return <div style={{background:"var(--dn)",color:"#fff",padding:"62px 16px 14px",textAlign:"center"}}>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.14em",marginBottom:4,opacity:0.9,display:"inline-flex",alignItems:"center",gap:6,justifyContent:"center"}}><Icon name="alarm" size={13} color="#fff" strokeWidth={2}/>TU OFERTA PERSONALIZADA EXPIRÓ</div>
      <div style={{fontSize:13,fontWeight:600,opacity:0.95}}>La próxima cohorte abre en unos días. Deja tu email para avisarte.</div>
    </div>;
  }

  var totalSec = Math.floor(remaining/1000);
  var d = Math.floor(totalSec / 86400);
  var h = Math.floor((totalSec % 86400) / 3600);
  var m = Math.floor((totalSec % 3600) / 60);
  var s = totalSec % 60;
  var pad = function(n){return n<10?"0"+n:""+n};

  // Cor dinâmica baseada no tempo restante
  var hoursLeft = remaining / (1000*60*60);
  var urgent = hoursLeft < 12;   // últimas 12h: vermelho puro + pulse
  var warning = hoursLeft < 24;  // últimas 24h: laranja intenso
  var bgGrad = urgent
    ? "linear-gradient(135deg,#D32F2F,#8B0000)"
    : warning
    ? "linear-gradient(135deg,#E8532E,#B33C1A)"
    : "linear-gradient(135deg,#E8532E,#C73E1D)";

  var boxSt = {background:"rgba(255,255,255,0.18)",borderRadius:10,padding:"7px 4px",minWidth:46,textAlign:"center",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.12)"};
  var numSt = {fontSize:20,fontWeight:800,lineHeight:1,fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"};
  var lblSt = {fontSize:8.5,fontWeight:700,letterSpacing:"0.1em",opacity:0.85,marginTop:3,textTransform:"uppercase"};

  return <div style={{background:bgGrad,color:"#fff",padding:"62px 16px 14px",textAlign:"center",position:"relative",overflow:"hidden",animation:urgent?"pulse 1.5s ease-in-out infinite":"none"}}>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at top, rgba(255,255,255,0.15), transparent 60%)",pointerEvents:"none"}}/>
    <div style={{position:"relative"}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:10,fontWeight:800,letterSpacing:"0.14em",marginBottom:10,opacity:0.95}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:"#FFD166",animation:"pulse 1.2s ease-in-out infinite"}}/>
        {urgent ? "¡ÚLTIMAS HORAS! TU OFERTA TERMINA EN" : "TU OFERTA PERSONALIZADA TERMINA EN"}
      </div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"stretch",gap:6}}>
        <div style={boxSt}><div style={numSt}>{pad(d)}</div><div style={lblSt}>días</div></div>
        <div style={{display:"flex",alignItems:"center",fontSize:16,fontWeight:900,opacity:0.6}}>:</div>
        <div style={boxSt}><div style={numSt}>{pad(h)}</div><div style={lblSt}>horas</div></div>
        <div style={{display:"flex",alignItems:"center",fontSize:16,fontWeight:900,opacity:0.6}}>:</div>
        <div style={boxSt}><div style={numSt}>{pad(m)}</div><div style={lblSt}>min</div></div>
        <div style={{display:"flex",alignItems:"center",fontSize:16,fontWeight:900,opacity:0.6}}>:</div>
        <div style={boxSt}><div style={numSt}>{pad(s)}</div><div style={lblSt}>seg</div></div>
      </div>
      <div style={{fontSize:11,fontWeight:700,marginTop:10,opacity:0.9}}>Precio bloqueado para tu diagnóstico</div>
    </div>
  </div>;
}

// ─── Score calculation ───────────────────────────────────────────────────────
function calcScore(ans){
  var s = 40; // base
  var st = ans.screenTime;
  if(st==="less-1h")s+=0; else if(st==="1-2h")s+=10; else if(st==="2-4h")s+=20; else if(st==="4-6h")s+=30; else if(st==="6h+")s+=38; else if(st==="unknown")s+=22;
  var cm = ans.criticalMoments||[];
  s += Math.min(cm.length*3, 15);
  var r = ans.reaction;
  if(r==="aggressive")s+=10; else if(r==="cries")s+=7; else if(r==="apathetic")s+=6; else if(r==="asks-again")s+=3;
  var tm = ans.triedMethods||[];
  if(tm.indexOf("nothing")>=0)s+=5;
  return Math.min(Math.max(s,25),95);
}

function hoursPerYear(st){
  var m = {"less-1h":0.8,"1-2h":1.5,"2-4h":3,"4-6h":5,"6h+":7,"unknown":3.5};
  return Math.round((m[st]||3)*365);
}
function daysPerYear(st){return Math.round(hoursPerYear(st)/24)}

// ─── APP MOCKUP (só no start) ───────────────────────────────────────────────
function AppMockup(){
  return <div style={{position:"relative",width:"100%",maxWidth:220,margin:"0 auto"}}>
    <svg viewBox="0 0 260 420" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",filter:"drop-shadow(0 12px 32px rgba(0,0,0,.18))"}}>
      <rect x="10" y="0" width="240" height="420" rx="28" fill="#1A1A1A"/>
      <rect x="18" y="8" width="224" height="404" rx="22" fill="#FFFBF5"/>
      <rect x="90" y="14" width="80" height="10" rx="5" fill="#1A1A1A" opacity="0.15"/>
      <rect x="18" y="28" width="224" height="52" fill="#E8532E"/>
      {/* Logo header: sol folk + wordmark serif */}
      <g transform="translate(96, 54)">
        {[0,45,90,135,180,225,270,315].map(function(a){
          return <g key={a} transform={`rotate(${a})`}>
            <path d="M 0 -14 L 1.4 -10 L -1.4 -10 Z" fill="white"/>
          </g>;
        })}
        <circle cx="0" cy="0" r="6" fill="white"/>
      </g>
      <text x="112" y="58" fontSize="16" fontWeight="400" fill="white" fontFamily="'Instrument Serif', Georgia, serif" letterSpacing="-0.4">desconecta</text>
      <text x="130" y="73" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.85)" fontFamily="sans-serif" letterSpacing="1.2">DÍA 3 DE 21 • SEMANA 1</text>
      <rect x="28" y="86" width="204" height="6" rx="3" fill="#E8E0D8"/>
      <rect x="28" y="86" width="68" height="6" rx="3" fill="#E8532E"/>
      <text x="130" y="105" textAnchor="middle" fontSize="8" fill="#888" fontFamily="sans-serif">3 actividades completadas hoy</text>
      <rect x="22" y="112" width="216" height="72" rx="12" fill="white" stroke="#E8E0D8" strokeWidth="1.5"/>
      <rect x="22" y="112" width="5" height="72" rx="2" fill="#E8532E"/>
      <text x="38" y="130" fontSize="10" fontWeight="800" fill="#1A1A1A" fontFamily="sans-serif">Manualidades creativas</text>
      <text x="38" y="145" fontSize="8" fill="#555" fontFamily="sans-serif">Ideal para cuando se aburre</text>
      <text x="38" y="160" fontSize="8" fill="#888" fontFamily="sans-serif">Materiales: solo papel y lápices</text>
      <rect x="38" y="168" width="50" height="10" rx="5" fill="#E8F5EE"/>
      <text x="63" y="176" textAnchor="middle" fontSize="7" fill="#2D936C" fontWeight="700" fontFamily="sans-serif">10 min ✓</text>
      <rect x="22" y="192" width="216" height="72" rx="12" fill="white" stroke="#E8E0D8" strokeWidth="1.5"/>
      <rect x="22" y="192" width="5" height="72" rx="2" fill="#2D936C"/>
      <text x="38" y="210" fontSize="10" fontWeight="800" fill="#1A1A1A" fontFamily="sans-serif">Juego de construcción</text>
      <text x="38" y="225" fontSize="8" fill="#555" fontFamily="sans-serif">Para antes de dormir</text>
      <rect x="38" y="248" width="58" height="10" rx="5" fill="#FFF0EB"/>
      <text x="67" y="256" textAnchor="middle" fontSize="7" fill="#E8532E" fontWeight="700" fontFamily="sans-serif">Pendiente →</text>
      <rect x="22" y="272" width="216" height="60" rx="12" fill="#F5F5F5" stroke="#E8E0D8" strokeWidth="1.5" opacity="0.7"/>
      <text x="130" y="300" textAnchor="middle" fontSize="9" fill="#888" fontFamily="sans-serif">Actividad del día 4</text>
      <text x="130" y="315" textAnchor="middle" fontSize="8" fill="#aaa" fontFamily="sans-serif">Disponible mañana</text>
    </svg>
  </div>;
}

// ─── Score Ring ──────────────────────────────────────────────────────────────
function ScoreRing({score, animated}){
  var [shown,setShown] = useState(animated?25:score);
  useEffect(function(){
    if(!animated)return;
    var start = 25, end = score, dur = 1400, t0 = Date.now();
    var iv = setInterval(function(){
      var p = Math.min(1, (Date.now()-t0)/dur);
      var eased = 1-Math.pow(1-p,3);
      setShown(Math.round(start + (end-start)*eased));
      if(p>=1) clearInterval(iv);
    }, 20);
    return function(){clearInterval(iv)};
  },[]);
  var color = score >= 70 ? "#D32F2F" : score >= 50 ? "#E8532E" : "#2D936C";
  var lbl = score >= 70 ? "ALTA" : score >= 50 ? "MODERADA" : "BAJA";
  var C = 2*Math.PI*52;
  var dash = C * (shown/100);
  return <div style={{position:"relative",width:180,height:180,margin:"0 auto"}}>
    <svg viewBox="0 0 120 120" style={{width:"100%",height:"100%",transform:"rotate(-90deg)"}}>
      <circle cx="60" cy="60" r="52" fill="none" stroke="#E8E0D8" strokeWidth="10"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C-dash} style={{transition:"stroke-dashoffset .1s linear"}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:48,fontWeight:900,color:color,lineHeight:1}}>{shown}</div>
      <div style={{fontSize:11,color:"var(--tl)",fontWeight:700,marginTop:2}}>/ 100</div>
      <div style={{fontSize:10,color:color,fontWeight:900,letterSpacing:"0.1em",marginTop:6}}>{lbl}</div>
    </div>
  </div>;
}

// ─── Exit-intent downsell (mouseleave desktop + back-button mobile) ──────────
// IMPORTANTE: SEM gatilho por tempo. Só aparece em intenção REAL de saída,
// pra não antecipar a oferta mais barata e derrubar o ticket médio.
function ExitIntent({show,onAccept,childName}){
  const [open,setOpen] = useState(false);
  const [dismissed,setDismissed] = useState(false);
  useEffect(function(){
    if(!show||dismissed)return;
    // Desktop: mouse sai pela borda superior (indo pra aba/fechar)
    var ml = function(e){ if(e.clientY<=0 && !dismissed) setOpen(true); };
    document.addEventListener("mouseleave", ml);
    // Mobile: back button / swipe back — injeta state fake, intercepta popstate
    var pushed = false;
    try { history.pushState({__exitGuard:1}, ""); pushed = true; } catch(_){}
    var pop = function(){ if(!dismissed) setOpen(true); };
    window.addEventListener("popstate", pop);
    return function(){
      document.removeEventListener("mouseleave", ml);
      window.removeEventListener("popstate", pop);
    };
  }, [show,dismissed]);
  if(!open||!show) return null;
  return <div style={{position:"fixed",inset:0,background:"rgba(20,10,5,0.78)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fi .25s ease both",backdropFilter:"blur(4px)"}}>
    <div style={{background:"linear-gradient(180deg,#FFFDF8,#FFF8EE)",border:"2px solid #C9A961",borderRadius:16,padding:"26px 22px 22px",maxWidth:380,width:"100%",position:"relative",boxShadow:"0 24px 60px rgba(0,0,0,.5)",animation:"fadeInUp .35s ease both"}}>
      <button onClick={function(){setDismissed(true);setOpen(false)}} style={{position:"absolute",top:10,right:14,background:"none",border:"none",fontSize:24,color:"var(--tl)",cursor:"pointer",fontWeight:300,lineHeight:1}}>×</button>
      <div style={{fontSize:10,fontWeight:900,color:"#8B6914",letterSpacing:"0.14em",marginBottom:8,textAlign:"center"}}>⚡ ESPERA — UNA OFERTA MÁS</div>
      <h3 style={{fontSize:22,fontWeight:900,textAlign:"center",lineHeight:1.2,marginBottom:10,fontFamily:"var(--fh)",fontWeight:400}}>Entendemos — $17 es real.</h3>
      <p style={{fontSize:14,color:"var(--tm)",textAlign:"center",lineHeight:1.55,marginBottom:16}}>
        No queremos que {childName} se quede sin su plan por <strong style={{color:"var(--tx)"}}>$10 de diferencia</strong>.
      </p>
      <div style={{background:"#fff",border:"2px dashed #C9A961",borderRadius:12,padding:"14px 12px",textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:11,color:"#8B6914",fontWeight:800,letterSpacing:"0.08em",marginBottom:4}}>VERSIÓN ESENCIAL</div>
        <div style={{display:"inline-flex",alignItems:"baseline",gap:4}}>
          <span style={{fontSize:13,color:"var(--tl)",textDecoration:"line-through"}}>$17</span>
          <span style={{fontSize:40,fontWeight:900,color:"var(--pr)",letterSpacing:"-0.02em"}}>$7</span>
          <span style={{fontSize:12,color:"var(--tm)",fontWeight:700}}>USD</span>
        </div>
        <div style={{fontSize:11,color:"var(--tm)",marginTop:4,lineHeight:1.4}}>App + plan 21 días + actividades básicas<br/>Misma garantía 7 días</div>
      </div>
      <Btn onClick={function(){setOpen(false);onAccept&&onAccept()}} pulse>SÍ, RESCATAR POR $7 →</Btn>
      <button onClick={function(){setDismissed(true);setOpen(false)}} style={{width:"100%",marginTop:10,padding:10,background:"none",border:"none",fontSize:12,color:"var(--tl)",textDecoration:"underline",cursor:"pointer",fontFamily:"var(--ft)"}}>No gracias, cierro la oportunidad</button>
    </div>
  </div>;
}

function App(){
  const [scr,setScr] = useState("start");
  const [cur,setCur] = useState(1);
  const [ans,setAns] = useState({});
  const [ud,setUd] = useState({childName:"",parentName:"",email:"",whatsapp:"",country:"México"});
  const [optin,setOptin] = useState(true);
  const [lp,setLp] = useState(0);
  const [lmi,setLmi] = useState(0);
  const [sp,setSp] = useState("complete");
  const [ad,setAd] = useState("in");
  const [wi,setWi] = useState(0);
  const [efq,setEfq] = useState(null);
  const [downsell,setDownsell] = useState(false);
  const [bump,setBump] = useState(true); // order bump pre-checked
  const [cc,setCc] = useState({email:"",name:"",card:"",exp:"",cvv:""});
  const [countryOpen,setCountryOpen] = useState(false);
  const [commitYes,setCommitYes] = useState(false);
  const rf = useRef(null);

  const W = ["dejar el celular","volver a jugar","dormir mejor","concentrarse","obedecer sin pelear"];
  const top2 = function(){if(rf.current)rf.current.scrollTo({top:0,behavior:"smooth"})};

  useEffect(function(){if(scr!=="start")return;var t=setInterval(function(){setWi(function(i){return(i+1)%W.length})},2400);return function(){clearInterval(t)}},[scr]);
  useEffect(function(){if(scr!=="loading")return;var p=setInterval(function(){setLp(function(v){if(v>=100){clearInterval(p);setTimeout(function(){setScr("result")},500);return 100}return v+1.4})},60);var m=setInterval(function(){setLmi(function(i){return(i+1)%LOADING_MSGS.length})},1500);return function(){clearInterval(p);clearInterval(m)}},[scr]);

  var stp = STEPS.find(function(s){return s.id===cur});
  var pid = stp ? stp.phase : 1;
  var cn = ud.childName || "tu hijo";
  var pn = ud.parentName || "";

  var goN = function(){
    if(cur+1 > TOTAL_STEPS){ setScr("loading"); return; }
    setAd("out");
    setTimeout(function(){ setCur(cur+1); setAd("in"); top2(); },220);
  };

  var hS = function(slug,val,type){
    if(type==="single") setAns(function(p){var n=Object.assign({},p);n[slug]=val;return n});
    else setAns(function(p){var n=Object.assign({},p);var c=n[slug]||[];if(c.indexOf(val)>=0)n[slug]=c.filter(function(v){return v!==val});else n[slug]=c.concat([val]);return n});
  };

  var ok = function(){
    if(!stp) return false;
    if(stp.type==="single") return !!ans[stp.slug];
    if(stp.type==="multi") return (ans[stp.slug]||[]).length >= (stp.minSelect||1);
    if(stp.type==="mirror"||stp.type==="transition"||stp.type==="commit") return true;
    if(stp.type==="names") return ud.childName.trim().length>0 && ud.parentName.trim().length>0;
    if(stp.type==="contact") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ud.email);
    return true;
  };

  // ═════════════════ START ═════════════════
  if(scr==="start"){
    return <div ref={rf} style={SH} data-act="1"><style>{GCSS}</style>
      <div style={{padding:"68px 20px 32px",textAlign:"center",animation:"fi .45s ease both"}}>
        <div style={{marginBottom:2,display:"flex",justifyContent:"center"}}><Logo color="var(--pr)" size={1.1}/></div>
        <div style={{fontSize:9,color:"var(--tl)",letterSpacing:"0.18em",fontWeight:700,marginBottom:16}}>TEST DE DEPENDENCIA INFANTIL</div>

        <div style={{background:"var(--dl)",border:"1px solid #F5C6C6",borderRadius:12,padding:"10px 14px",marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:900,color:"var(--dn)",letterSpacing:"0.05em",marginBottom:2}}>⚠ 12.347 FAMILIAS YA LO HICIERON</div>
          <div style={{fontSize:11,color:"var(--tm)",lineHeight:1.4}}>El 73% de los niños en LATAM ya muestra señales de dependencia por dopamina.</div>
        </div>

        <h1 style={{fontSize:26,fontWeight:900,lineHeight:1.2,marginBottom:10}}>¿Tu hijo ya no sabe jugar sin pantalla?</h1>
        <p style={{fontSize:16,fontWeight:700,color:"var(--tm)",marginBottom:6}}>Descubre <span style={{color:"var(--pr)"}}>qué tan grave es</span> — y si aún estás a tiempo.</p>

        <div style={{height:36,display:"flex",alignItems:"center",justifyContent:"center",margin:"14px 0",overflow:"hidden"}}>
          <span style={{fontSize:13,color:"var(--tl)",fontWeight:700}}>Hijos que vuelven a&nbsp;</span>
          <span key={wi} style={{display:"inline-block",fontSize:15,fontWeight:900,color:"var(--pr)",animation:"fi .5s ease both",fontStyle:"italic"}}>{W[wi]}</span>
        </div>

        <p style={{fontSize:14,color:"var(--tm)",lineHeight:1.55,marginBottom:18}}>Responde <strong>8 preguntas</strong>. Te damos el diagnóstico y el plan de los próximos 21 días.</p>

        <div style={{marginBottom:20}}><PhoneLoop childName={ud.childName} width={280}/></div>

        <Btn onClick={function(){setScr("quiz");setCur(1);top2()}} pulse>VER SI AÚN ES REVERSIBLE →</Btn>
        <p style={{fontSize:11,color:"var(--tl)",marginTop:10,fontWeight:600}}>Gratis • 2 minutos • 12.347 familias ya lo hicieron</p>

        <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:16,fontSize:11,color:"var(--tl)",fontWeight:600}}>
          <span>🔒 Datos seguros</span>
          <span>📱 Android + iPhone</span>
        </div>
      </div>
    </div>;
  }

  // ═════════════════ QUIZ ═════════════════
  if(scr==="quiz"){
    var an = ad==="in" ? "si .3s ease both" : "so .22s ease both";

    // MIRROR (id 3)
    if(stp && stp.type==="mirror"){
      var hy = hoursPerYear(ans.screenTime);
      var dy = daysPerYear(ans.screenTime);
      var yrsBy12 = (hy * 10 / 24 / 365).toFixed(1);
      return <div ref={rf} style={SH} data-act={actForStep(stp.id)}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"30px 22px 120px",animation:"actTransition .7s ease both"}}>
          <div style={{fontSize:10,color:"#FF5252",fontWeight:800,letterSpacing:"0.14em",marginBottom:14}}>UN MOMENTO</div>
          <h2 style={{fontSize:24,fontWeight:900,lineHeight:1.25,marginBottom:18}}>Lo que acabas de marcar no es poco.</h2>

          <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.6,marginBottom:16,animation:"fadeInUp .5s .1s ease both",opacity:0}}>
            Con ese tiempo, tu hijo pasará <strong style={{color:"var(--dn)"}}>{dy} días enteros</strong> al año frente a una pantalla.
          </p>
          <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.6,marginBottom:16,animation:"fadeInUp .5s .3s ease both",opacity:0}}>
            Eso es más de <strong style={{color:"var(--dn)"}}>{yrsBy12} años</strong> de su vida entera — a los 12 ya habrá vivido una fracción enorme mirando vídeos cortos que no recordará.
          </p>
          <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.6,marginBottom:22,animation:"fadeInUp .5s .5s ease both",opacity:0}}>
            Vamos a mostrarte el número completo al final. Pero antes necesitamos <strong style={{color:"var(--tx)"}}>3 cosas más.</strong>
          </p>

          <div style={{background:"var(--pl)",borderRadius:"var(--rd)",padding:"18px 16px",marginBottom:20,borderLeft:"4px solid var(--pr)"}}>
            <p style={{fontSize:14,fontWeight:700,color:"var(--tx)",lineHeight:1.5}}>No es culpa tuya.<br/>Pero sí es tu decisión pararlo.</p>
          </div>

          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, var(--bg) 25%)",maxWidth:400,margin:"0 auto"}}>
            <Btn onClick={goN} pulse>SEGUIR — QUIERO REVERTIR ESTO →</Btn>
          </div>
        </div>
      </div>;
    }

    // TRANSITION (id 6)
    if(stp && stp.type==="transition"){
      var r = ans.reaction;
      var rMap = {cries:"llanto intenso", aggressive:"gritos y agresividad", apathetic:"apatía total", "asks-again":"pedidos constantes", accepts:"resistencia leve"};
      var rTxt = rMap[r] || "reacción fuerte";
      return <div ref={rf} style={SH} data-act={actForStep(stp.id)}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"30px 22px 120px",animation:"actTransition .7s ease both"}}>
          <div style={{fontSize:10,color:"#FF6B47",fontWeight:800,letterSpacing:"0.14em",marginBottom:14}}>LA VERDAD INCÓMODA</div>
          <h2 style={{fontSize:22,fontWeight:900,lineHeight:1.3,marginBottom:16}}>Lo que describes <span style={{color:"var(--dn)"}}>no es un berrinche normal.</span></h2>
          <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.6,marginBottom:18}}>Es un <strong style={{color:"var(--tx)"}}>síntoma de dependencia por dopamina</strong> — exactamente igual a la de un adulto que no suelta el celular.</p>

          <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:"16px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:900,color:"var(--tl)",letterSpacing:"0.08em",marginBottom:8}}>QUIÉN LO DISEÑÓ ASÍ</div>
            <p style={{fontSize:13,color:"var(--tm)",lineHeight:1.55}}>TikTok, YouTube Kids y Roblox contratan neurocientíficos para que sus apps sean <strong>lo más adictivos posible</strong>. Tu hijo no tiene cómo defenderse.</p>
          </div>

          <div style={{background:"var(--sl)",border:"1px solid #B8DFC9",borderRadius:"var(--rd)",padding:"16px",marginBottom:26}}>
            <div style={{fontSize:11,fontWeight:900,color:"var(--sc)",letterSpacing:"0.08em",marginBottom:8}}>✓ LA BUENA NOTICIA</div>
            <p style={{fontSize:13,color:"var(--tm)",lineHeight:1.55}}>A los <strong style={{color:"var(--sc)"}}>5 años el cerebro se recalibra en 21 días.</strong> A los 10, toma 40 días. A los 15 puede ser tarde.</p>
            <p style={{fontSize:12,color:"var(--tl)",marginTop:8,fontStyle:"italic"}}>Tu hijo marcó: {rTxt}.</p>
          </div>

          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, var(--bg) 25%)",maxWidth:400,margin:"0 auto"}}>
            <Btn onClick={goN} pulse>ENTIENDO — SIGAMOS →</Btn>
          </div>
        </div>
      </div>;
    }

    // COMMITMENT (id 9) — REMOVIDO: matava momentum em low ticket
    if(false && stp && stp.type==="commit"){
      return <div ref={rf} style={SH} data-act={actForStep(stp.id)}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"30px 22px 120px",animation:"actTransition .6s ease both"}}>
          <div style={{fontSize:10,color:"var(--pr)",fontWeight:800,letterSpacing:"0.14em",marginBottom:14}}>MICRO-COMPROMISO</div>
          <h2 style={{fontSize:24,fontWeight:400,lineHeight:1.25,marginBottom:16}}>Antes de continuar, una pregunta seria.</h2>
          <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.6,marginBottom:22}}>Si te damos un plan claro, realista, adaptado a tu hijo…<br/>¿te comprometes a <strong style={{color:"var(--tx)"}}>empezar esta misma semana</strong>?</p>

          <button onClick={function(){setCommitYes(true)}} style={{width:"100%",padding:"20px",background:commitYes?"var(--sl)":"var(--sf)",border:commitYes?"2px solid var(--sc)":"2px solid var(--bd)",borderRadius:"var(--rd)",cursor:"pointer",fontFamily:"var(--ft)",marginBottom:12,transition:"all .2s",transform:commitYes?"scale(1.02)":"none"}}>
            <div style={{fontSize:16,fontWeight:900,color:commitYes?"var(--sc)":"var(--tx)",marginBottom:4}}>{commitYes?"✓ ":""}SÍ, me comprometo</div>
            <div style={{fontSize:12,color:"var(--tm)"}}>Empiezo esta semana, aunque sea con 1 actividad al día</div>
          </button>

          <button onClick={function(){setCommitYes(false);setAd("out");setTimeout(function(){setCur(cur+1);setAd("in");top2()},220)}} style={{width:"100%",padding:"14px",background:"none",border:"none",fontSize:12,color:"var(--tl)",textDecoration:"underline",cursor:"pointer",fontFamily:"var(--ft)",fontWeight:600}}>No estoy listo — prefiero solo ver el diagnóstico</button>

          {commitYes && <div style={{marginTop:20,background:"var(--sl)",border:"1px solid #B8DFC9",borderRadius:12,padding:14,animation:"fi .3s ease both"}}>
            <p style={{fontSize:13,color:"var(--sc)",fontWeight:700,lineHeight:1.5}}>✓ Perfecto. Las familias que dicen "sí" aquí tienen 3x más probabilidad de completar el plan.</p>
          </div>}

          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, #FFFBF5 25%)",maxWidth:400,margin:"0 auto"}}>
            <Btn onClick={goN} disabled={!commitYes}>CONTINUAR →</Btn>
          </div>
        </div>
      </div>;
    }

    // NAMES (id 10)
    if(stp && stp.type==="names"){
      return <div ref={rf} style={SH} data-act={actForStep(stp.id)}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"24px 22px 120px",animation:an}}>
          <div style={{fontSize:11,color:"var(--tl)",fontWeight:700,letterSpacing:"0.05em",marginBottom:8}}>PASO {cur} DE {TOTAL_STEPS}</div>
          <h2 style={{fontSize:22,fontWeight:900,lineHeight:1.3,marginBottom:8}}>{stp.headline}</h2>
          <p style={{fontSize:13,color:"var(--tm)",marginBottom:20,fontStyle:"italic"}}>{stp.micro}</p>

          <label style={{display:"block",fontSize:12,fontWeight:800,color:"var(--tm)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Nombre de tu hijo(a)</label>
          <input type="text" placeholder="Ej: Mateo, Valentina…" value={ud.childName} onChange={function(e){var v=e.target.value;setUd(function(p){var n=Object.assign({},p);n.childName=v;return n})}} style={Object.assign({},INP,{marginBottom:16})}/>

          <label style={{display:"block",fontSize:12,fontWeight:800,color:"var(--tm)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Tu primer nombre</label>
          <input type="text" placeholder="Tu nombre" value={ud.parentName} onChange={function(e){var v=e.target.value;setUd(function(p){var n=Object.assign({},p);n.parentName=v;return n})}} style={INP}/>

          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, #FFFBF5 25%)",maxWidth:400,margin:"0 auto"}}>
            <Btn onClick={goN} disabled={!ok()}>VER EL DIAGNÓSTICO →</Btn>
          </div>
        </div>
      </div>;
    }

    // CONTACT (id 11) — DESHABILITADO: ahora se pide en pricing (S5 optimization)
    if(false && stp && stp.type==="contact"){
      var cObj = COUNTRIES.find(function(c){return c.name===ud.country}) || COUNTRIES[12];
      var phoneNum = ud.whatsapp.replace(/^\+\d+\s*/,"");
      return <div ref={rf} style={SH}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"24px 22px 120px",animation:an}}>
          <div style={{fontSize:11,color:"var(--tl)",fontWeight:700,letterSpacing:"0.05em",marginBottom:8}}>PASO {cur} DE {TOTAL_STEPS} • ÚLTIMO</div>
          <h2 style={{fontSize:21,fontWeight:900,lineHeight:1.3,marginBottom:8}}>¿A dónde enviamos el diagnóstico de <span style={{color:"var(--pr)"}}>{cn}</span>?</h2>
          <p style={{fontSize:13,color:"var(--tm)",marginBottom:18,fontStyle:"italic"}}>Acceso inmediato al app + recordatorios diarios gratis.</p>

          <label style={{display:"block",fontSize:12,fontWeight:800,color:"var(--tm)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Email</label>
          <input type="email" placeholder="tu@email.com" value={ud.email} onChange={function(e){var v=e.target.value;setUd(function(p){var n=Object.assign({},p);n.email=v;return n})}} style={Object.assign({},INP,{marginBottom:16})}/>

          <label style={{display:"block",fontSize:12,fontWeight:800,color:"var(--tm)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>WhatsApp <span style={{color:"var(--tl)",fontWeight:600}}>(opcional — +3x conversión del plan)</span></label>
          <div style={{display:"flex",gap:6,marginBottom:10,position:"relative"}}>
            <button onClick={function(){setCountryOpen(!countryOpen)}} style={{display:"flex",alignItems:"center",gap:5,padding:"14px 10px",fontSize:18,background:"var(--sf)",border:"2px solid var(--bd)",borderRadius:"var(--rd)",cursor:"pointer",fontFamily:"var(--ft)",whiteSpace:"nowrap"}}>
              <span>{cObj.flag}</span><span style={{fontSize:12,fontWeight:700,color:"var(--tx)"}}>{cObj.code}</span><span style={{fontSize:9,color:"var(--tl)"}}>▼</span>
            </button>
            <input type="tel" placeholder="(000) 000-0000" value={phoneNum} onChange={function(e){var v=e.target.value;setUd(function(p){var n=Object.assign({},p);n.whatsapp=cObj.code+" "+v;return n})}} style={Object.assign({},INP,{flex:1})}/>
            {countryOpen && <div style={{position:"absolute",top:"100%",left:0,zIndex:999,background:"var(--sf)",border:"2px solid var(--bd)",borderRadius:"var(--rd)",boxShadow:"0 8px 32px rgba(0,0,0,.15)",maxHeight:240,overflowY:"auto",minWidth:220,marginTop:4}}>
              {COUNTRIES.map(function(c){return <button key={c.name} onClick={function(){setUd(function(p){var n=Object.assign({},p);n.country=c.name;n.whatsapp=c.code+" "+phoneNum;return n});setCountryOpen(false)}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 13px",background:c.name===ud.country?"var(--pl)":"none",border:"none",borderBottom:"1px solid var(--bd)",cursor:"pointer",fontFamily:"var(--ft)",textAlign:"left"}}>
                <span style={{fontSize:18}}>{c.flag}</span><span style={{fontSize:12,fontWeight:600,color:"var(--tx)",flex:1}}>{c.name}</span><span style={{fontSize:11,color:"var(--tl)",fontWeight:700}}>{c.code}</span>
              </button>})}
            </div>}
          </div>
          {countryOpen && <div onClick={function(){setCountryOpen(false)}} style={{position:"fixed",inset:0,zIndex:998}}/>}

          <label style={{display:"flex",alignItems:"flex-start",gap:8,marginTop:10,fontSize:12,color:"var(--tm)",cursor:"pointer",lineHeight:1.4}}>
            <input type="checkbox" checked={optin} onChange={function(e){setOptin(e.target.checked)}} style={{width:16,height:16,accentColor:"var(--pr)",marginTop:2,flexShrink:0}}/>
            <span>Acepto recibir consejos semanales sobre desarrollo infantil</span>
          </label>
          <p style={{fontSize:10,color:"var(--tl)",marginTop:8,lineHeight:1.5}}>🔒 Datos seguros. Nunca los compartimos.</p>

          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, #FFFBF5 25%)",maxWidth:400,margin:"0 auto"}}>
            <Btn onClick={goN} disabled={!ok()} pulse>VER DIAGNÓSTICO DE {cn.toUpperCase()} →</Btn>
          </div>
        </div>
      </div>;
    }

    // Regular single/multi
    return <div ref={rf} style={SH} data-act={actForStep(stp?stp.id:1)}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
      <div key={cur} style={{padding:"24px 20px 120px",animation:an}}>
        <div style={{fontSize:11,color:"var(--tl)",fontWeight:700,marginBottom:6,letterSpacing:"0.05em"}}>PASO {cur} DE {TOTAL_STEPS}</div>
        <h2 style={{fontSize:21,fontWeight:900,lineHeight:1.3,marginBottom:stp&&stp.micro?6:18}}>{stp?stp.headline:""}</h2>
        {stp&&stp.micro?<p style={{fontSize:13,color:"var(--tm)",marginBottom:18,lineHeight:1.5,fontStyle:"italic"}}>{stp.micro}</p>:null}

        {stp&&(stp.type==="single"||stp.type==="multi")?
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {stp.options.map(function(o){
              var sel = stp.type==="single" ? ans[stp.slug]===o.value : (ans[stp.slug]||[]).indexOf(o.value)>=0;
              return <OCard key={o.value} o={o} sel={sel} onClick={function(){hS(stp.slug,o.value,stp.type)}}/>;
            })}
          </div>
        :null}

        <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, #FFFBF5 25%)",maxWidth:400,margin:"0 auto"}}>
          <Btn onClick={goN} disabled={!ok()}>CONTINUAR →</Btn>
        </div>
      </div>
    </div>;
  }

  // ═════════════════ LOADING ═════════════════
  if(scr==="loading"){
    var msg = LOADING_MSGS[lmi].replace("{child}", cn);
    return <div ref={rf} style={SH} data-act="3"><style>{GCSS}</style>
      <div style={{padding:"70px 26px",textAlign:"center",animation:"fi .5s ease both"}}>
        <div style={{fontSize:44,marginBottom:20,animation:"pulse 1.5s ease-in-out infinite"}}>🧠</div>
        <h2 style={{fontSize:20,fontWeight:900,marginBottom:8,lineHeight:1.3}}>Calculando el diagnóstico de {cn}…</h2>
        <p style={{fontSize:13,color:"var(--tm)",marginBottom:32}}>Comparando con 12.000 familias LATAM.</p>
        <div style={{width:"100%",height:8,borderRadius:4,background:"var(--bd)",overflow:"hidden",marginBottom:18}}>
          <div style={{width:Math.min(lp,100)+"%",height:"100%",borderRadius:4,transition:"width .1s linear",background:"linear-gradient(90deg,var(--pr),#FF8A5C,var(--pr))",backgroundSize:"200% 100%",animation:"sh 1.5s linear infinite"}}/>
        </div>
        <p style={{fontSize:12,color:"var(--tl)",fontWeight:700}}>{Math.min(Math.round(lp),100)+"%"}</p>
        <p key={lmi} style={{fontSize:14,color:"var(--tm)",marginTop:26,fontStyle:"italic",animation:"mf 1.5s ease both",minHeight:22}}>{msg}</p>
      </div>
    </div>;
  }

  // ═════════════════ RESULT (DIAGNÓSTICO COM SCORE) ═════════════════
  if(scr==="result"){
    var score = calcScore(ans);
    var lbl = score>=70 ? "ALTA" : score>=50 ? "MODERADA" : "BAJA";
    var color = score>=70 ? "#D32F2F" : score>=50 ? "#E8532E" : "#2D936C";

    var ageAvgMap = {"2-3":38,"4-5":45,"6-7":52,"8-9":58,"10-12":65};
    var healthyMap = {"2-3":28,"4-5":32,"6-7":35,"8-9":40,"10-12":45};
    var avg = ageAvgMap[ans.age] || 50;
    var healthy = healthyMap[ans.age] || 35;

    var in6m = Math.min(score + 12, 98);
    var with21 = Math.max(healthy, score - 30);

    var matchedReview = {
      name: ans.age==="2-3"||ans.age==="4-5" ? "María G." : ans.age==="10-12" ? "Marco" : "Camila",
      detail: ans.age==="2-3"||ans.age==="4-5" ? "Mamá de Emilio (5)" : ans.age==="10-12" ? "Papá de Lucas (8)" : "Mamá de Pedro (6)",
      photo: ans.age==="2-3"||ans.age==="4-5" ? "https://i.pravatar.cc/80?img=26" : ans.age==="10-12" ? "https://i.pravatar.cc/80?img=68" : "https://i.pravatar.cc/80?img=47",
      text: ans.reaction==="aggressive" ? "Mi hijo me pegaba cuando le quitaba la tablet. En 10 días el cambio fue brutal. No lo podía creer." : ans.reaction==="cries" ? "Lloraba 40 minutos cada vez. Hoy pide ir al parque antes de preguntar por el celular." : "Pensé que era imposible. El cambio fue más natural de lo que creía."
    };

    return <div ref={rf} style={SH} data-act="4"><style>{GCSS}</style>
      <div style={{animation:"fi .6s ease both"}}>

        {/* SCORE HERO — primeiro: entrega a dor antes de qualquer coisa */}
        <div style={{background:"linear-gradient(180deg,#FFF,#FFFBF5)",padding:"68px 20px 20px",textAlign:"center",borderBottom:"1px solid var(--bd)"}}>
          <div style={{fontSize:10,color:"var(--tl)",fontWeight:900,letterSpacing:"0.15em",marginBottom:4}}>DIAGNÓSTICO DE {cn.toUpperCase()}</div>
          <div style={{fontSize:22,fontWeight:900,color:color,lineHeight:1.2,marginBottom:16}}>DEPENDENCIA {lbl}</div>

          <ScoreRing score={score} animated/>

          <p style={{fontSize:13,color:"var(--tm)",marginTop:12,lineHeight:1.5,maxWidth:320,margin:"12px auto 0"}}>
            {pn ? pn+", esto es " : "Esto es "}
            <strong style={{color:color}}>{score >= avg ? "peor que el promedio" : "similar al promedio"}</strong>
            {" para niños de "+(ans.age||"su edad")+" años."}
          </p>
        </div>

        {/* DADOS DRAMÁTICOS — hy, dy, yrsBy12 (movidos do mirror) */}
        {ans.screenTime && <div style={{padding:"22px 20px 4px"}}>
          <div style={{fontSize:10,color:"var(--dn)",fontWeight:900,letterSpacing:"0.15em",marginBottom:10,textAlign:"center"}}>⚠ LO QUE ESTO SIGNIFICA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            <div style={{background:"var(--sf)",border:"1.5px solid var(--dn)",borderRadius:"var(--rd)",padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:400,color:"var(--dn)",lineHeight:1}}>{hoursPerYear(ans.screenTime).toLocaleString()}h</div>
              <div style={{fontSize:10,color:"var(--tm)",marginTop:4,fontWeight:600,lineHeight:1.3}}>al año frente<br/>a pantalla</div>
            </div>
            <div style={{background:"var(--sf)",border:"1.5px solid var(--dn)",borderRadius:"var(--rd)",padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:400,color:"var(--dn)",lineHeight:1}}>{daysPerYear(ans.screenTime)}</div>
              <div style={{fontSize:10,color:"var(--tm)",marginTop:4,fontWeight:600,lineHeight:1.3}}>días enteros<br/>sin despegar ojos</div>
            </div>
            <div style={{background:"var(--sf)",border:"1.5px solid var(--dn)",borderRadius:"var(--rd)",padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:400,color:"var(--dn)",lineHeight:1}}>{(hoursPerYear(ans.screenTime) * 10 / 24 / 365).toFixed(1)}</div>
              <div style={{fontSize:10,color:"var(--tm)",marginTop:4,fontWeight:600,lineHeight:1.3}}>años de vida<br/>a los 12 años</div>
            </div>
          </div>
        </div>}

        <div style={{padding:"4px 20px 32px"}}>

          {/* COMPARAÇÃO */}
          <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:"18px 16px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:900,color:"var(--tl)",letterSpacing:"0.08em",marginBottom:12}}>COMPARACIÓN</div>

            {[
              {lbl:"Zona saludable", val:healthy, c:"#2D936C"},
              {lbl:"Promedio LATAM ("+(ans.age||"")+" años)", val:avg, c:"#E8532E"},
              {lbl:cn, val:score, c:color, bold:true},
            ].map(function(b,i){
              return <div key={i} style={{marginBottom:i<2?12:0}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:b.bold?900:700,color:b.bold?b.c:"var(--tm)",marginBottom:4}}>
                  <span>{b.lbl}</span><span>{b.val}/100</span>
                </div>
                <div style={{height:10,borderRadius:5,background:"#F4EFE8",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:5,background:b.c,width:b.val+"%",animation:"drawBar .8s "+(i*0.15)+"s ease both","--bw":b.val+"%"}}/>
                </div>
              </div>
            })}
          </div>

          {/* TRAJETÓRIA — SIN PLAN (peor) */}
          <div style={{background:"#FFF",border:"2px solid var(--dn)",borderRadius:"var(--rd)",padding:"18px 16px",marginBottom:0,position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:900,color:"var(--dn)",letterSpacing:"0.08em"}}>⚠ SI NO HACES NADA</div>
              <div style={{fontSize:10,fontWeight:900,color:"#fff",background:"var(--dn)",padding:"3px 9px",borderRadius:20,letterSpacing:"0.04em"}}>+{in6m-score} PTS EN 6M ↑</div>
            </div>
            <div style={{position:"relative",height:140,marginBottom:6}}>
              {/* linha de trajetória subindo */}
              <svg viewBox="0 0 300 140" preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1}}>
                <defs>
                  <marker id="arrUp" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#B71C1C"/>
                  </marker>
                </defs>
                <path d={"M 50 "+(140-score*1.1)+" Q 150 "+(140-(score+6)*1.1-10)+" 250 "+(140-in6m*1.1)} stroke="#D32F2F" strokeWidth="2.5" fill="none" strokeDasharray="5,4" markerEnd="url(#arrUp)" style={{animation:"fadeInUp 1.2s .8s ease both",opacity:0}}/>
              </svg>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:"100%",position:"relative",zIndex:0}}>
                {[
                  {l:"Hoy",v:score,c:color},
                  {l:"En 3m",v:Math.min(score+6,95),c:"#D32F2F"},
                  {l:"En 6m",v:in6m,c:"#B71C1C"},
                ].map(function(b,i){
                  var barH = Math.round(b.v*1.1);
                  return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                    <div style={{fontSize:15,fontWeight:900,color:b.c,marginBottom:4}}>{b.v}</div>
                    <div style={{width:"100%",background:b.c,borderRadius:"6px 6px 0 0",height:barH,animation:"drawBar 1s "+(0.5+i*0.15)+"s ease both",transformOrigin:"bottom",opacity:0.92}}/>
                  </div>
                })}
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              {["Hoy","En 3m","En 6m"].map(function(l,i){return <div key={i} style={{flex:1,textAlign:"center",fontSize:11,color:"var(--tm)",fontWeight:700}}>{l}</div>})}
            </div>
          </div>

          {/* DIVISOR VS */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"16px 0",gap:10}}>
            <div style={{flex:1,height:1,background:"var(--bd)"}}/>
            <div style={{fontSize:12,fontWeight:900,color:"var(--tl)",letterSpacing:"0.15em",background:"var(--bg)",padding:"4px 12px",border:"1px solid var(--bd)",borderRadius:20}}>VS</div>
            <div style={{flex:1,height:1,background:"var(--bd)"}}/>
          </div>

          {/* TRAJETÓRIA — CON PLAN (mejor) */}
          <div style={{background:"var(--sl)",border:"2px solid var(--sc)",borderRadius:"var(--rd)",padding:"18px 16px",marginBottom:20,position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:900,color:"var(--sc)",letterSpacing:"0.08em"}}>✓ CON EL PLAN DE 21 DÍAS</div>
              <div style={{fontSize:10,fontWeight:900,color:"#fff",background:"var(--sc)",padding:"3px 9px",borderRadius:20,letterSpacing:"0.04em"}}>−{score-with21} PTS EN 21D ↓</div>
            </div>
            <div style={{position:"relative",height:140,marginBottom:6}}>
              <svg viewBox="0 0 300 140" preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1}}>
                <defs>
                  <marker id="arrDn" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="#2D936C"/>
                  </marker>
                </defs>
                <path d={"M 50 "+(140-score*1.1)+" Q 150 "+(140-Math.round((score+with21)*0.6)*1.1)+" 250 "+(140-with21*1.1)} stroke="#2D936C" strokeWidth="2.5" fill="none" strokeDasharray="5,4" markerEnd="url(#arrDn)" style={{animation:"fadeInUp 1.2s .8s ease both",opacity:0}}/>
              </svg>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:"100%",position:"relative",zIndex:0}}>
                {[
                  {l:"Hoy",v:score,c:color},
                  {l:"Día 7",v:Math.round((score+with21)*0.6),c:"#E8A32E"},
                  {l:"Día 21",v:with21,c:"#2D936C"},
                ].map(function(b,i){
                  var barH = Math.round(b.v*1.1);
                  return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                    <div style={{fontSize:15,fontWeight:900,color:b.c,marginBottom:4}}>{b.v}</div>
                    <div style={{width:"100%",background:b.c,borderRadius:"6px 6px 0 0",height:barH,animation:"drawBar 1s "+(0.5+i*0.15)+"s ease both",transformOrigin:"bottom",opacity:0.92}}/>
                  </div>
                })}
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              {["Hoy","Día 7","Día 21"].map(function(l,i){return <div key={i} style={{flex:1,textAlign:"center",fontSize:11,color:"var(--tm)",fontWeight:700}}>{l}</div>})}
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:12,fontSize:11,color:"var(--sc)",fontWeight:700,background:"#fff",padding:"6px 11px",borderRadius:20,border:"1px solid #B8DFC9"}}><Icon name="users" size={12} strokeWidth={2}/>Basado en 12.000 familias reales</div>
          </div>

          {/* LIVE APP PREVIEW — a solução tangível, depois de mostrar a dor+caminho */}
          <div style={{margin:"0 -20px 20px",background:"linear-gradient(180deg,var(--bg),#FFF)",padding:"22px 20px 26px",textAlign:"center",borderTop:"1px solid var(--bd)",borderBottom:"1px solid var(--bd)",position:"relative",overflow:"hidden"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--pr)",color:"#fff",fontSize:10,fontWeight:900,letterSpacing:"0.12em",padding:"5px 12px",borderRadius:20,marginBottom:12,boxShadow:"0 4px 12px rgba(232,83,46,.3)"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#fff",animation:"pulse 1.5s ease-in-out infinite"}}/>
              EN VIVO
            </div>
            <h3 style={{fontSize:20,fontWeight:900,lineHeight:1.15,marginBottom:4,letterSpacing:"-0.01em"}}>
              El plan de <span style={{color:"var(--pr)"}}>{cn}</span> ya está listo
            </h3>
            <p style={{fontSize:12,color:"var(--tm)",fontWeight:600,marginBottom:16}}>Así se ve el app — acceso inmediato</p>
            <PhoneLoop childName={cn} width={260}/>
          </div>

          {/* REVIEW MATCHED — com foto */}
          <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:"16px",marginBottom:20,display:"flex",gap:14,alignItems:"flex-start"}}>
            <img src={matchedReview.photo} alt={matchedReview.name} style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--bd)",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,marginBottom:6}}>⭐⭐⭐⭐⭐</div>
              <p style={{fontSize:14,fontWeight:600,marginBottom:10,fontStyle:"italic",lineHeight:1.5}}>"{matchedReview.text}"</p>
              <div style={{fontSize:13,fontWeight:800}}>{matchedReview.name}</div>
              <div style={{fontSize:11,color:"var(--tl)"}}>{matchedReview.detail} • perfil similar al tuyo</div>
            </div>
          </div>

          {/* CTA */}
          <div style={{background:"linear-gradient(135deg,#FFF0EB,#FFF5E6)",border:"2px solid var(--pr)",borderRadius:"var(--rd)",padding:"22px 18px",textAlign:"center"}}>
            <p style={{fontSize:15,fontWeight:900,marginBottom:6,lineHeight:1.3}}>El plan de 21 días de {cn} está listo.</p>
            <p style={{fontSize:12,color:"var(--tm)",marginBottom:14}}>Un pago único — lo usás hasta que cumpla 12.</p>
            <Btn onClick={function(){setScr("pricing");top2()}} pulse>VER MI PLAN Y EMPEZAR →</Btn>
            <p style={{fontSize:10,color:"var(--tl)",marginTop:10,display:"inline-flex",alignItems:"center",gap:6,justifyContent:"center"}}><Icon name="shield-check" size={11} strokeWidth={2}/>Garantía 7 días • Acceso inmediato</p>
          </div>
        </div>
      </div>
    </div>;
  }

  // ═════════════════ PRICING (1 plano + downsell exit-intent) ═════════════════
  if(scr==="pricing"){
    // FAQ PERSONALIZADO — puxa das respostas
    var triedList = ans.triedMethods || [];
    var bigCh = ans.biggestChallenge;
    var reactionId = ans.reaction;

    var fqs = [];
    // 1. SEMPRE: reacción personalizada
    if(reactionId==="aggressive" || reactionId==="cries"){
      fqs.push({q:"Mi hijo llora/se pone agresivo cuando le quito la pantalla. ¿Este plan funciona en ese caso?",a:"Sí — de hecho está diseñado EXACTAMENTE para eso. El plan usa Sustitución Progresiva: nunca quita todo de golpe. Reduce 10 min cada 2 días mientras introduce actividades sustitutas. En 21 días "+cn+" NO va a hacer berrinche al soltar la pantalla."});
    } else {
      fqs.push({q:"¿Funciona si "+cn+" hace berrinches?",a:"Sí — el plan incluye guiones específicos para cada tipo de reacción emocional. La Sustitución Progresiva NO quita todo de golpe."});
    }
    // 2. SE tentou "parental-control" ou "cold-turkey" e falhou
    if(triedList.indexOf("parental-control")>=0 || triedList.indexOf("cold-turkey")>=0){
      fqs.push({q:"Ya intenté apps de control parental / quitar todo de golpe. ¿Qué hace Desconecta diferente?",a:"Los controles parentales bloquean — pero no resuelven por qué tu hijo quiere la pantalla. Desconecta reemplaza la dopamina de la pantalla con actividades reales que producen la misma satisfacción. Por eso funciona donde el resto falla."});
    }
    // 3. SE tem medo do parceiro/família
    if(bigCh==="partner" || bigCh==="other-adults"){
      fqs.push({q:"Mi pareja / los abuelos no van a colaborar. ¿De qué sirve entonces?",a:"Incluimos una guía específica: \"Cómo hablar con los abuelos (y con tu pareja)\" — argumentos concretos, textos listos para enviar por WhatsApp. Muchas familias empiezan sola una persona; al día 14 el resto ya quiere unirse porque ven los resultados."});
    }
    // 4. SE é próprio pai/mãe que não solta
    if(bigCh==="myself"){
      fqs.push({q:"Honestamente, yo tampoco suelto mi celular. ¿Sirve igual?",a:"Esa honestidad es RARA — y es la mejor señal de que va a funcionar. El plan incluye un mini-track para adultos (5 min al día). Cambia tu relación con la pantalla a la par que tu hijo."});
    }
    // 5. SE marcou "no-time" ou "no-ideas"
    if(bigCh==="no-time" || bigCh==="no-ideas"){
      fqs.push({q:"No tengo tiempo / no sé qué ofrecerle. ¿Cuánto me va a pedir al día?",a:"10–15 minutos al día. Cada actividad trae: materiales exactos, tiempo estimado, qué decir y qué NO decir. Diseñado para padres que trabajan — cero improvisación."});
    }
    // 6. SEMPRE: acceso
    fqs.push({q:"¿Cuándo recibo acceso al app?",a:"Inmediatamente después del pago. Recibes el link por email en 30 segundos. Funciona en Android 5.0+, iPhone iOS 13+ y navegador."});
    // 7. SEMPRE: garantía
    fqs.push({q:"¿Y si al final no me gusta?",a:"Garantía de 7 días — te devolvemos el 100% sin preguntas. El riesgo es completamente nuestro. Más de 12.000 familias ya pasaron por esto; menos del 2% pidió reembolso."});

    var mainPrice = downsell ? 7 : 17;
    var mainOld = downsell ? 27 : 67;
    var ctaTxt = downsell
      ? ("RESCATAR MI ACCESO — $7 →")
      : ("EMPEZAR EL PLAN DE "+cn.toUpperCase()+" HOY →");

    return <div ref={rf} style={SH} data-act="4"><style>{GCSS}</style>
      <div style={{animation:"fi .5s ease both"}}>
        <PersonalCountdown/>

        <div style={{padding:"24px 20px 40px"}}>
          {/* DOWNSELL ALERT — aparece só quando ativado */}
          {downsell && <div style={{background:"linear-gradient(135deg,#FFF8E1,#FFECB3)",border:"2px solid #C9A961",borderRadius:"var(--rd)",padding:"14px",marginBottom:18,textAlign:"center"}}>
            <div style={{fontSize:10,fontWeight:900,color:"#8B6914",letterSpacing:"0.12em",marginBottom:4}}>⚡ OFERTA DE RESCATE</div>
            <div style={{fontSize:13,color:"#5D4A0F",fontWeight:700,lineHeight:1.5}}>Entendemos — $17 es real. Te dejamos entrar por <strong>$7</strong> (versión esencial).<br/>Misma garantía, mismo acceso inmediato.</div>
          </div>}

          <h2 style={{fontSize:22,fontWeight:900,textAlign:"center",marginBottom:6,lineHeight:1.25}}>
            {pn?pn+", el plan de ":"El plan de "}<span style={{color:"var(--pr)"}}>{cn}</span> está listo
          </h2>
          <p style={{fontSize:13,color:"var(--tm)",textAlign:"center",marginBottom:22}}>Acceso inmediato • Un pago único • Hasta los 12 años</p>

          {/* PLANO ÚNICO — hero */}
          <div style={{background:"linear-gradient(180deg,#FFFDF8,#FFF8EE)",border:"2px solid #C9A961",borderRadius:"var(--rd)",padding:"26px 20px",position:"relative",marginBottom:16,boxShadow:"0 8px 32px rgba(201,169,97,.22)"}}>
            <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#C9A961,#B8954E)",color:"#fff",fontSize:10,fontWeight:800,padding:"5px 16px",borderRadius:20,letterSpacing:"0.1em",whiteSpace:"nowrap",boxShadow:"0 2px 10px rgba(184,149,78,.4)"}}>ACCESO COMPLETO</div>

            <div style={{textAlign:"center",marginBottom:18,paddingTop:4}}>
              <div style={{fontSize:22,fontWeight:400,fontFamily:"var(--fh)",letterSpacing:"-0.01em",lineHeight:1.15,marginBottom:6}}>Transformación de 21 días<br/>para {cn}</div>
              <div style={{fontSize:10,color:"#8B6914",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Personalizado con las {TOTAL_STEPS} respuestas del diagnóstico</div>
            </div>

            <div style={{textAlign:"center",marginBottom:18}}>
              <div style={{fontSize:13,color:"var(--tl)",textDecoration:"line-through",marginBottom:2,lineHeight:1}}>Normal: ${mainOld} USD</div>
              <div style={{display:"inline-flex",alignItems:"baseline",gap:4}}>
                <span style={{fontSize:14,color:"var(--pr)",fontWeight:700}}>$</span>
                <span style={{fontSize:58,fontWeight:900,color:"var(--pr)",letterSpacing:"-0.03em",lineHeight:1}}>{mainPrice}</span>
                <span style={{fontSize:13,color:"var(--tm)",fontWeight:700}}>USD</span>
              </div>
              <div style={{fontSize:11,color:"var(--sc)",fontWeight:800,marginTop:4}}>
                Un pago único • Menos de {Math.round(mainPrice/21*100)/100} USD por día
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:22}}>
              {[
                "Plan de 21 días personalizado para "+cn,
                "50+ actividades adaptadas a su edad",
                "Guiones específicos para su tipo de reacción",
                "Rutina nocturna sin pantallas",
                "Guía: Cómo hablar con los abuelos/tu pareja",
                "Recordatorios diarios por WhatsApp",
                "Acceso al app hasta que cumpla 12 años",
              ].map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{color:"var(--sc)",flexShrink:0,marginTop:2}}><Icon name="check" size={16} strokeWidth={2.5}/></span>
                <span style={{fontSize:14,color:"var(--tx)",lineHeight:1.45,fontWeight:500}}>{f}</span>
              </div>})}
            </div>

            <Btn onClick={function(){ setScr("checkout");top2() }} pulse>{ctaTxt}</Btn>
            <p style={{fontSize:11,color:"var(--tl)",textAlign:"center",marginTop:10,fontWeight:600}}>Una vez. Sin suscripción. Sin sorpresas.</p>
          </div>

          {/* GARANTIA GIGANTE — below CTA */}
          <div style={{background:"var(--sl)",border:"2px solid var(--sc)",borderRadius:"var(--rd)",padding:"20px 18px",marginBottom:22,textAlign:"center",position:"relative"}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:"3px solid var(--sc)",color:"var(--sc)",boxShadow:"0 4px 14px rgba(45,147,108,.25)"}}><Icon name="shield-check" size={38} strokeWidth={2}/></div>
            <div style={{fontSize:11,fontWeight:900,color:"var(--sc)",letterSpacing:"0.14em",marginBottom:4}}>GARANTÍA BLINDADA</div>
            <div style={{fontSize:22,fontWeight:900,color:"var(--tx)",lineHeight:1.15,marginBottom:6,fontFamily:"var(--fh)"}}>7 días. 100% de vuelta.</div>
            <p style={{fontSize:13,color:"var(--tm)",lineHeight:1.55,maxWidth:320,margin:"0 auto"}}>Probá el plan 7 días. Si no ves cambio real en {cn}, te devolvemos cada centavo. <strong style={{color:"var(--tx)"}}>Sin formularios. Sin preguntas.</strong></p>
            <div style={{fontSize:11,color:"var(--tl)",marginTop:10,fontStyle:"italic"}}>12.347 familias usaron el plan • menos del 2% pidió reembolso</div>
          </div>

          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:18,marginBottom:28,fontSize:11,color:"var(--tl)",fontWeight:600}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:5}}><Icon name="card" size={14}/>Tarjeta</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:5}}><Icon name="phone" size={14}/>PayPal</span>
            <span style={{display:"inline-flex",alignItems:"center",gap:5}}><Icon name="apple" size={14}/>Apple Pay</span>
          </div>

          <h3 style={{fontSize:20,fontWeight:400,textAlign:"center",marginBottom:6,fontFamily:"var(--fh)"}}>Madres que ya pasaron por esto</h3>
          <p style={{fontSize:12,color:"var(--tl)",textAlign:"center",marginBottom:18,fontStyle:"italic"}}>Perfiles reales • nombres cambiados por privacidad</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:30}}>
            {[
              {n:"Laura M.",d:"Mamá de Sofía (6) • México",ph:"https://i.pravatar.cc/80?img=45",t:"Compré sin muchas expectativas. Al día 9 mi hija me pidió pintar en vez de abrir YouTube. Lloré."},
              {n:"Diego R.",d:"Papá de Mateo (8) • Colombia",ph:"https://i.pravatar.cc/80?img=52",t:"Era imposible sacarle el celular sin gritos. Ahora él mismo lo deja cuando suena el timer."},
              {n:"Patricia S.",d:"Mamá de Andrés (4) • Argentina",ph:"https://i.pravatar.cc/80?img=31",t:"Mi hijo volvió a dormir solo. El cambio más grande no fue la pantalla — fue la paz en casa."},
            ].map(function(r,i){return <div key={i} style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:"14px",display:"flex",gap:12,alignItems:"flex-start"}}>
              <img src={r.ph} alt={r.n} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--bd)",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,marginBottom:4,letterSpacing:"0.05em"}}>⭐⭐⭐⭐⭐</div>
                <p style={{fontSize:13,fontWeight:500,marginBottom:8,fontStyle:"italic",lineHeight:1.5,color:"var(--tx)"}}>"{r.t}"</p>
                <div style={{fontSize:12,fontWeight:800}}>{r.n}</div>
                <div style={{fontSize:10.5,color:"var(--tl)"}}>{r.d}</div>
              </div>
            </div>})}
          </div>

          <h3 style={{fontSize:18,fontWeight:900,textAlign:"center",marginBottom:4}}>Tus preguntas, respondidas</h3>
          <p style={{fontSize:11,color:"var(--tl)",textAlign:"center",marginBottom:14,fontStyle:"italic"}}>Basado en lo que nos contaste</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {fqs.map(function(f,i){return <div key={i} style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",overflow:"hidden"}}>
              <button onClick={function(){setEfq(efq===i?null:i)}} style={{width:"100%",padding:"14px",background:"none",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontFamily:"var(--ft)",textAlign:"left",gap:10}}>
                <span style={{fontSize:13,fontWeight:700,lineHeight:1.4}}>{f.q}</span>
                <span style={{fontSize:18,color:"var(--pr)",fontWeight:900,transform:efq===i?"rotate(45deg)":"none",transition:"transform .2s",flexShrink:0}}>+</span>
              </button>
              {efq===i?<div style={{padding:"0 14px 14px",fontSize:13,color:"var(--tm)",lineHeight:1.55}}>{f.a}</div>:null}
            </div>})}
          </div>

          {/* FINAL CTA RECAP */}
          <div style={{background:"var(--pl)",border:"2px solid var(--pr)",borderRadius:"var(--rd)",padding:"20px 16px",textAlign:"center"}}>
            <p style={{fontSize:15,fontWeight:900,color:"var(--tx)",lineHeight:1.35,marginBottom:12}}>{cn} te necesita hoy.<br/>Mañana ya es un día más.</p>
            <Btn onClick={function(){ setScr("checkout");top2() }} pulse>EMPEZAR AHORA — ${mainPrice} →</Btn>
          </div>
        </div>

        {/* EXIT-INTENT DOWNSELL MODAL — só dispara em intenção real de saída (mouseleave desktop / back button mobile). Sem timer. */}
        <ExitIntent show={scr==="pricing" && !downsell} onAccept={function(){setDownsell(true);top2()}} childName={cn}/>
      </div>
    </div>;
  }

  // ═════════════════ CHECKOUT (com order bump $9) ═════════════════
  if(scr==="checkout"){
    var mainPrice = downsell ? 7 : 17;
    // ┌────────────────────────────────────────────────────────────┐
    // │  ⚠️ CONFIGURE AQUI OS LINKS DO SEU GATEWAY (Hotmart/Kiwify)│
    // │  Cada combinação bump×tipo = 1 produto diferente criado    │
    // │  no seu gateway, com o preço correto já configurado.       │
    // └────────────────────────────────────────────────────────────┘
    var CHECKOUT_LINKS = {
      // Plano sozinho (sem bump)
      plan_only:         "https://pay.kiwify.com/REPLACE_PLAN_17",
      plan_only_downsell:"https://pay.kiwify.com/REPLACE_PLAN_7",
      // Plano + bump personalizado (4 variações)
      bump_berrinches:   "https://pay.kiwify.com/REPLACE_PLAN_BUMP_BERRINCHES_26",
      bump_nocturno:     "https://pay.kiwify.com/REPLACE_PLAN_BUMP_NOCTURNO_26",
      bump_comidas:      "https://pay.kiwify.com/REPLACE_PLAN_BUMP_COMIDAS_26",
      bump_emergencia:   "https://pay.kiwify.com/REPLACE_PLAN_BUMP_EMERGENCIA_26"
    };
    // Order bump personalizado por reaction/criticalMoments
    var bumpTitle, bumpDesc, bumpKey;
    if(ans.reaction==="aggressive" || ans.reaction==="cries"){
      bumpTitle = "Guía de Berrinches Explosivos";
      bumpDesc = "10 guiones palabra-por-palabra para los 4 momentos imposibles de "+cn+": auto, restaurante, casa de abuelos, antes de dormir.";
      bumpKey = "berrinches";
    } else if((ans.criticalMoments||[]).indexOf("bedtime")>=0){
      bumpTitle = "Rutina Nocturna Sin Pantalla";
      bumpDesc = "El protocolo exacto de 7 pasos para que "+cn+" se duerma sin YouTube. Incluye 3 cuentos originales en audio.";
      bumpKey = "nocturno";
    } else if((ans.criticalMoments||[]).indexOf("meals")>=0){
      bumpTitle = "Comidas Sin Pantalla";
      bumpDesc = "15 juegos de mesa + guiones para transformar la hora de comer. "+cn+" va a pedir comer en familia.";
      bumpKey = "comidas";
    } else {
      bumpTitle = "Guía de Emergencia para Berrinches";
      bumpDesc = "10 guiones palabra-por-palabra para los momentos más difíciles con "+cn+" — auto, restaurante, casa de abuelos, antes de dormir.";
      bumpKey = "emergencia";
    }
    var total = mainPrice + (bump?9:0);
    // Monta URL final + parâmetros do quiz como UTMs
    function buildCheckoutUrl(){
      var base;
      if(bump){
        base = CHECKOUT_LINKS["bump_"+bumpKey] || CHECKOUT_LINKS.bump_emergencia;
      } else {
        base = downsell ? CHECKOUT_LINKS.plan_only_downsell : CHECKOUT_LINKS.plan_only;
      }
      var params = new URLSearchParams({
        utm_source:"quiz",
        utm_medium:"checkout",
        utm_campaign:"desconecta21",
        utm_content:bump?("bump_"+bumpKey):"plan_only",
        // Dados úteis pro CRM (Hotmart/Kiwify repassam como query strings)
        child_name:cn||"",
        parent_name:pn||"",
        score:String(calcScore(ans)),
        reaction:ans.reaction||"",
        age:String(ans.age||"")
      });
      return base + (base.indexOf("?")>=0?"&":"?") + params.toString();
    }

    return <div ref={rf} style={SH} data-act="4"><style>{GCSS}</style>
      <div style={{animation:"fi .4s ease both",padding:"52px 20px 40px"}}>
        <button onClick={function(){setScr("pricing");top2()}} style={{background:"none",border:"none",fontSize:13,color:"var(--tl)",fontWeight:700,cursor:"pointer",marginBottom:14,fontFamily:"var(--ft)",display:"inline-flex",alignItems:"center",gap:6}}>← Volver</button>
        <div style={{fontSize:10,fontWeight:900,color:"var(--pr)",letterSpacing:"0.14em",marginBottom:6}}>PASO FINAL • CHECKOUT SEGURO</div>
        <h2 style={{fontSize:22,fontWeight:900,lineHeight:1.2,marginBottom:20}}>El plan de {cn} está a 1 paso.</h2>

        {/* RESUMO DO PEDIDO */}
        <div style={{background:"var(--sf)",border:"2px solid var(--bd)",borderRadius:"var(--rd)",padding:"16px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:800,color:"var(--tl)",letterSpacing:"0.1em",marginBottom:12}}>TU PEDIDO</div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,paddingBottom:10,borderBottom:"1px dashed var(--bd)"}}>
            <div style={{flex:1,paddingRight:8}}>
              <div style={{fontSize:14,fontWeight:800,color:"var(--tx)"}}>Plan 21 días para {cn}</div>
              <div style={{fontSize:11,color:"var(--tl)",marginTop:2}}>Acceso inmediato • hasta los 12 años</div>
            </div>
            <div style={{fontSize:15,fontWeight:900,color:"var(--tx)",whiteSpace:"nowrap"}}>${mainPrice}</div>
          </div>
          {bump && <div style={{display:"flex",justifyContent:"space-between",animation:"fi .3s ease both"}}>
            <div style={{flex:1,paddingRight:8}}>
              <div style={{fontSize:13,fontWeight:800,color:"var(--pr)"}}>+ {bumpTitle}</div>
              <div style={{fontSize:11,color:"var(--tl)",marginTop:2}}>Bonus agregado</div>
            </div>
            <div style={{fontSize:14,fontWeight:900,color:"var(--pr)",whiteSpace:"nowrap"}}>+$9</div>
          </div>}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"2px solid var(--bd)"}}>
            <div style={{fontSize:13,fontWeight:900,color:"var(--tx)"}}>TOTAL HOY</div>
            <div><span style={{fontSize:24,fontWeight:900,color:"var(--pr)"}}>${total}</span><span style={{fontSize:11,color:"var(--tl)",marginLeft:3}}>USD</span></div>
          </div>
        </div>

        {/* ORDER BUMP — design com checkbox gigante e borda tracejada amarela */}
        <label style={{display:"block",cursor:"pointer",background:bump?"linear-gradient(180deg,#FFFBEE,#FFF4D6)":"var(--sf)",border:bump?"3px dashed #E8A32E":"3px dashed #D4C8B8",borderRadius:"var(--rd)",padding:"16px 14px",marginBottom:20,position:"relative",transition:"all .2s",transform:bump?"scale(1.01)":"none"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <input type="checkbox" checked={bump} onChange={function(e){setBump(e.target.checked)}} style={{width:22,height:22,accentColor:"#E8A32E",marginTop:2,flexShrink:0,cursor:"pointer"}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontSize:10,fontWeight:900,color:"#fff",background:"#E8A32E",padding:"3px 8px",borderRadius:20,letterSpacing:"0.08em"}}>⚡ SÍ, AGREGAR +$9</span>
                <span style={{fontSize:10,fontWeight:800,color:"#8B6914"}}>86% de las familias lo agrega</span>
              </div>
              <div style={{fontSize:15,fontWeight:900,color:"var(--tx)",lineHeight:1.25,marginBottom:4}}>{bumpTitle}</div>
              <div style={{fontSize:12,color:"var(--tm)",lineHeight:1.5,marginBottom:6}}>{bumpDesc}</div>
              <div style={{display:"inline-flex",alignItems:"baseline",gap:5}}>
                <span style={{fontSize:11,color:"var(--tl)",textDecoration:"line-through"}}>$27</span>
                <span style={{fontSize:18,fontWeight:900,color:"#B8954E"}}>+$9 USD</span>
                <span style={{fontSize:10,color:"#8B6914",fontWeight:700}}>solo en este pedido</span>
              </div>
            </div>
          </div>
        </label>

        {/* CTA — redireciona pro checkout do gateway baseado na escolha do bump */}
        <Btn onClick={function(){
          var url = buildCheckoutUrl();
          // Em dev (placeholder): mostra pra onde iria
          if(url.indexOf("REPLACE_")>=0){
            alert("🔗 Redirecionaria para:\n\n"+url+"\n\n(Substitua os links REPLACE_* no código pelos seus links reais do Kiwify/Hotmart)");
            return;
          }
          window.location.href = url;
        }} pulse>PAGAR ${total} — IR AL PAGO SEGURO →</Btn>

        <p style={{fontSize:11,color:"var(--tl)",textAlign:"center",marginTop:12,lineHeight:1.5,fontWeight:600}}>
          Al hacer clic te llevamos al checkout seguro de Kiwify.<br/>Tarjeta, PayPal, Pix y Apple Pay disponibles.
        </p>

        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:14,marginTop:14,fontSize:10,color:"var(--tl)",fontWeight:700}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:4}}><Icon name="lock" size={12} strokeWidth={2}/>SSL 256-bit</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:4}}><Icon name="shield-check" size={12} strokeWidth={2}/>Garantía 7 días</span>
        </div>
        <p style={{fontSize:10,color:"var(--tl)",textAlign:"center",marginTop:10,lineHeight:1.5}}>Procesado por Stripe • Tarjeta, PayPal y Apple Pay disponibles</p>
      </div>
    </div>;
  }

  // ═════════════════ OTO 1 — Kit Familia Completa ($37) ═════════════════
  if(scr==="oto1"){
    return <div ref={rf} style={SH} data-act="4"><style>{GCSS}</style>
      <div style={{animation:"fi .5s ease both"}}>
        {/* Banner de sucesso */}
        <div style={{background:"linear-gradient(135deg,#2D936C,#1E7A55)",color:"#fff",padding:"52px 20px 18px",textAlign:"center"}}>
          <div style={{width:54,height:54,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",color:"#2D936C"}}><Icon name="check" size={30} strokeWidth={3}/></div>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:"0.14em",opacity:0.95,marginBottom:4}}>PAGO CONFIRMADO ✓</div>
          <div style={{fontSize:14,fontWeight:700,opacity:0.95}}>Tu acceso está listo. Espera 10 segundos antes de salir…</div>
        </div>

        <div style={{padding:"28px 20px 40px"}}>
          <div style={{fontSize:11,fontWeight:900,color:"var(--pr)",letterSpacing:"0.12em",marginBottom:8,textAlign:"center"}}>⚠ ANTES DE ENTRAR AL APP — LEE ESTO</div>
          <h2 style={{fontSize:24,fontWeight:900,lineHeight:1.2,marginBottom:14,textAlign:"center"}}>
            {pn?pn+", ":""}pagaste por <span style={{color:"var(--pr)"}}>{cn}</span>.<br/>Pero lo que dijiste sobre <u>tu pareja</u>… no se resuelve solo.
          </h2>
          <p style={{fontSize:14,color:"var(--tm)",lineHeight:1.6,marginBottom:20,textAlign:"center"}}>
            El plan funciona <strong>cuando toda la familia está alineada</strong>. Si el otro adulto sigue dando pantalla, el progreso se rompe en 3 días.
          </p>

          {/* Card OTO */}
          <div style={{background:"linear-gradient(180deg,#FFFDF8,#FFF6E3)",border:"3px solid #C9A961",borderRadius:"var(--rd)",padding:"24px 20px",position:"relative",marginBottom:18,boxShadow:"0 10px 32px rgba(201,169,97,.28)"}}>
            <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#C9A961,#B8954E)",color:"#fff",fontSize:10,fontWeight:800,padding:"5px 16px",borderRadius:20,letterSpacing:"0.1em",whiteSpace:"nowrap"}}>SOLO EN ESTA PÁGINA</div>

            <div style={{textAlign:"center",paddingTop:4,marginBottom:16}}>
              <div style={{fontSize:11,color:"#8B6914",fontWeight:800,letterSpacing:"0.1em",marginBottom:4}}>ACTIVAR AHORA POR $37</div>
              <div style={{fontSize:26,fontWeight:400,fontFamily:"var(--fh)",lineHeight:1.15,letterSpacing:"-0.01em",marginBottom:8}}>Transformación Familiar Completa</div>
              <div style={{fontSize:12,color:"var(--tm)",lineHeight:1.5}}>No es un plan para {cn} — es el plan para <strong>toda tu familia</strong>.</div>
            </div>

            <div style={{background:"#fff",borderRadius:10,padding:"14px 14px",marginBottom:16,border:"1px solid #EADBB8"}}>
              <div style={{fontSize:10,fontWeight:900,color:"#8B6914",letterSpacing:"0.1em",marginBottom:10}}>INCLUYE TODO ESTO:</div>
              {[
                {t:"Plan para hasta 3 hermanos", s:"Perfiles personalizados por edad y reacción"},
                {t:"Script de conversa com tu pareja", s:"20 frases probadas, en orden exacto"},
                {t:"Guía para abuelos (imprimible)", s:"Argumentos + cartón de bolsillo"},
                {t:"Grupo WhatsApp privado", s:"Con otras 40 familias en tu misma semana"},
                {t:"Protocolo de recaída", s:"Qué hacer cuando "+cn+" vuelve a pedir pantalla"},
              ].map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:i<4?10:0}}>
                <span style={{color:"var(--sc)",flexShrink:0,marginTop:2}}><Icon name="check" size={15} strokeWidth={2.5}/></span>
                <div><div style={{fontSize:13,fontWeight:800,color:"var(--tx)",lineHeight:1.3}}>{f.t}</div><div style={{fontSize:11,color:"var(--tm)",marginTop:1}}>{f.s}</div></div>
              </div>})}
            </div>

            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:12,color:"var(--tl)",textDecoration:"line-through",marginBottom:2}}>Valor normal: $97 USD</div>
              <div style={{display:"inline-flex",alignItems:"baseline",gap:4}}>
                <span style={{fontSize:13,color:"var(--pr)",fontWeight:700}}>+</span>
                <span style={{fontSize:46,fontWeight:900,color:"var(--pr)",letterSpacing:"-0.03em",lineHeight:1}}>$37</span>
                <span style={{fontSize:12,color:"var(--tm)",fontWeight:700}}>USD</span>
              </div>
              <div style={{fontSize:11,color:"#8B6914",fontWeight:800,marginTop:4}}>Un pago • se suma a tu pedido</div>
            </div>

            <Btn onClick={function(){setScr("thankyou");top2()}} pulse>SÍ, ACTIVAR PARA TODA LA FAMILIA →</Btn>
            <p style={{fontSize:10,color:"var(--tl)",textAlign:"center",marginTop:10,fontWeight:700}}>Un clic • mismo método de pago • garantía 14 días</p>
          </div>

          {/* Social proof curto */}
          <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:14,marginBottom:18,display:"flex",gap:12,alignItems:"flex-start"}}>
            <img src="https://i.pravatar.cc/80?img=20" style={{width:44,height:44,borderRadius:"50%",border:"2px solid var(--bd)",flexShrink:0}}/>
            <div>
              <div style={{fontSize:12,marginBottom:4}}>⭐⭐⭐⭐⭐</div>
              <p style={{fontSize:13,fontStyle:"italic",lineHeight:1.5,color:"var(--tx)",marginBottom:6}}>"El script para mi marido fue lo que salvó el plan. Sin eso, él seguía dando la tablet en el coche y todo se rompía."</p>
              <div style={{fontSize:11,fontWeight:800}}>Elena R.</div>
              <div style={{fontSize:10,color:"var(--tl)"}}>Mamá de 2 • Buenos Aires</div>
            </div>
          </div>

          <button onClick={function(){setScr("oto2");top2()}} style={{width:"100%",padding:14,background:"none",border:"none",fontSize:12,color:"var(--tl)",textDecoration:"underline",cursor:"pointer",fontFamily:"var(--ft)",fontWeight:600}}>No, gracias — continuar solo con el plan básico</button>
        </div>
      </div>
    </div>;
  }

  // ═════════════════ OTO 2 — Desconecta Pro 6 meses ($97) ═════════════════
  if(scr==="oto2"){
    return <div ref={rf} style={SH} data-act="4"><style>{GCSS}</style>
      <div style={{animation:"fi .5s ease both",padding:"52px 20px 40px"}}>
        <div style={{fontSize:10,fontWeight:900,color:"var(--tl)",letterSpacing:"0.14em",marginBottom:8,textAlign:"center"}}>ESPERA — UN PUNTO MÁS IMPORTANTE</div>
        <h2 style={{fontSize:24,fontWeight:900,lineHeight:1.2,marginBottom:12,textAlign:"center"}}>Los 21 días son el <u>comienzo</u>.</h2>
        <p style={{fontSize:14,color:"var(--tm)",lineHeight:1.6,marginBottom:18,textAlign:"center"}}>
          Las vacaciones, cumpleaños, estrés laboral — son los momentos donde <strong>6 de cada 10 familias recae</strong>. Ahí es donde muere el cambio.
        </p>

        {/* Card OTO2 */}
        <div style={{background:"linear-gradient(180deg,#1A1A1A,#2D1810)",color:"#fff",border:"2px solid #C9A961",borderRadius:"var(--rd)",padding:"26px 20px",position:"relative",marginBottom:18,boxShadow:"0 12px 40px rgba(0,0,0,.35)"}}>
          <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#C9A961,#B8954E)",color:"#fff",fontSize:10,fontWeight:800,padding:"5px 16px",borderRadius:20,letterSpacing:"0.1em",whiteSpace:"nowrap"}}>PROGRAMA PREMIUM</div>

          <div style={{textAlign:"center",paddingTop:6,marginBottom:18}}>
            <div style={{fontSize:30,fontWeight:400,fontFamily:"var(--fh)",lineHeight:1.1,letterSpacing:"-0.015em",marginBottom:6}}>Desconecta <span style={{color:"#C9A961"}}>Pro</span></div>
            <div style={{fontSize:12,color:"#D4BFA8",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>6 meses de acompañamiento completo</div>
          </div>

          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"16px 14px",marginBottom:18,border:"1px solid rgba(201,169,97,0.3)"}}>
            {[
              {t:"Consulta 1-on-1 por video (20 min)", s:"Con psicóloga infantil certificada, esta semana"},
              {t:"6 meses de contenido nuevo semanal", s:"Actividades por estación, cumpleaños, vacaciones"},
              {t:"Protocolo de recaída blindado", s:"Qué hacer exactamente cuando "+cn+" pide pantalla otra vez"},
              {t:"Acceso VITALICIO a actualizaciones", s:"Todo lo que creemos en el futuro, gratis"},
              {t:"Comunidad privada Pro", s:"40 familias, mensajes directos con especialistas"},
            ].map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:i<4?11:0}}>
              <span style={{color:"#C9A961",flexShrink:0,marginTop:2}}><Icon name="star-filled" size={14}/></span>
              <div><div style={{fontSize:13,fontWeight:800,color:"#fff",lineHeight:1.3}}>{f.t}</div><div style={{fontSize:11,color:"#D4BFA8",marginTop:1,lineHeight:1.4}}>{f.s}</div></div>
            </div>})}
          </div>

          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:12,color:"#9A8270",textDecoration:"line-through",marginBottom:2}}>Valor normal: $297 USD</div>
            <div style={{display:"inline-flex",alignItems:"baseline",gap:4,color:"#C9A961"}}>
              <span style={{fontSize:13,fontWeight:700}}>+</span>
              <span style={{fontSize:50,fontWeight:900,letterSpacing:"-0.03em",lineHeight:1}}>$97</span>
              <span style={{fontSize:12,fontWeight:700}}>USD</span>
            </div>
            <div style={{fontSize:11,color:"#C9A961",fontWeight:800,marginTop:4}}>Un pago • sin renovación automática</div>
          </div>

          <button onClick={function(){setScr("thankyou");top2()}} style={{width:"100%",padding:"17px 24px",background:"linear-gradient(135deg,#C9A961,#B8954E)",color:"#1A1A1A",border:"none",borderRadius:"var(--rd)",fontFamily:"var(--ft)",fontSize:15,fontWeight:900,cursor:"pointer",letterSpacing:"0.01em",boxShadow:"0 4px 16px rgba(201,169,97,.4)"}}>SÍ, ACTIVAR DESCONECTA PRO →</button>
          <p style={{fontSize:10,color:"#9A8270",textAlign:"center",marginTop:10,fontWeight:700}}>Un clic • garantía 30 días</p>
        </div>

        <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:16,marginBottom:14,display:"flex",gap:12,alignItems:"flex-start"}}>
          <img src="https://i.pravatar.cc/80?img=32" style={{width:44,height:44,borderRadius:"50%",border:"2px solid var(--bd)",flexShrink:0}}/>
          <div>
            <div style={{fontSize:12,marginBottom:4}}>⭐⭐⭐⭐⭐</div>
            <p style={{fontSize:13,fontStyle:"italic",lineHeight:1.5,marginBottom:6}}>"La consulta 1-on-1 cambió todo. La psicóloga vio cosas que el plan no cubre. Vale el Pro solo por eso."</p>
            <div style={{fontSize:11,fontWeight:800}}>Alejandra M.</div>
            <div style={{fontSize:10,color:"var(--tl)"}}>Mamá de gemelos (6) • Santiago</div>
          </div>
        </div>

        <button onClick={function(){setScr("thankyou");top2()}} style={{width:"100%",padding:14,background:"none",border:"none",fontSize:12,color:"var(--tl)",textDecoration:"underline",cursor:"pointer",fontFamily:"var(--ft)",fontWeight:600}}>No, gracias — ir al app ahora</button>
      </div>
    </div>;
  }

  // ═════════════════ THANK YOU ═════════════════
  if(scr==="thankyou"){
    return <div ref={rf} style={SH} data-act="4"><style>{GCSS}</style>
      <div style={{animation:"fi .5s ease both",padding:"72px 24px 40px",textAlign:"center"}}>
        <div style={{width:88,height:88,borderRadius:"50%",background:"linear-gradient(135deg,#2D936C,#1E7A55)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",color:"#fff",boxShadow:"0 8px 28px rgba(45,147,108,.35)"}}><Icon name="check" size={48} strokeWidth={3}/></div>
        <div style={{fontSize:11,fontWeight:900,color:"var(--sc)",letterSpacing:"0.14em",marginBottom:6}}>TODO LISTO ✓</div>
        <h2 style={{fontSize:30,fontWeight:400,fontFamily:"var(--fh)",lineHeight:1.15,letterSpacing:"-0.01em",marginBottom:10}}>Bienvenido, {pn||"familia"}.</h2>
        <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.6,marginBottom:24}}>El plan de <strong style={{color:"var(--pr)"}}>{cn}</strong> está activo. Acabamos de enviar el acceso a <strong>{cc.email||ud.email||"tu email"}</strong>.</p>

        <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:"20px 18px",marginBottom:22,textAlign:"left"}}>
          <div style={{fontSize:11,fontWeight:900,color:"var(--tl)",letterSpacing:"0.1em",marginBottom:12}}>SIGUIENTES PASOS</div>
          {[
            {n:"1",t:"Abrí tu email en 2 minutos",s:"Busca: \"Tu acceso a Desconecta\""},
            {n:"2",t:"Descargá el app o usá el web",s:"Android, iPhone o navegador"},
            {n:"3",t:"Empezá con el día 1 HOY",s:"10 minutos — mientras "+cn+" está contigo"},
          ].map(function(x,i){return <div key={i} style={{display:"flex",gap:12,marginBottom:i<2?12:0}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"var(--pl)",color:"var(--pr)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,flexShrink:0}}>{x.n}</div>
            <div><div style={{fontSize:13,fontWeight:800}}>{x.t}</div><div style={{fontSize:12,color:"var(--tm)"}}>{x.s}</div></div>
          </div>})}
        </div>

        <button onClick={function(){alert("Redirect to app.desconecta.com")}} style={{width:"100%",padding:"17px 24px",background:"var(--pr)",color:"#fff",border:"none",borderRadius:"var(--rd)",fontFamily:"var(--ft)",fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 16px rgba(232,83,46,.35)"}}>ABRIR EL APP AHORA →</button>
        <p style={{fontSize:11,color:"var(--tl)",marginTop:12}}>Soporte: hola@desconecta.com</p>
      </div>
    </div>;
  }

  return null;
}

window.App = App;
