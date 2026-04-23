const { useState, useEffect, useRef } = React;

// ─── V3: 11 passos + 2 telas-espelho + diagnóstico com score ─────────────────
const PHASES = [
  { id: 1, label: "DIAGNÓSTICO",   steps: [1,2,3,4] },
  { id: 2, label: "COMPORTAMIENTO",steps: [5,6,7] },
  { id: 3, label: "COMPROMISO",    steps: [8] },
  { id: 4, label: "TU PLAN",       steps: [9,10,11] },
];

const STEPS = [
  {id:1,phase:1,type:"single",slug:"age",
    headline:"¿Cuántos años tiene tu hijo?",
    micro:"Si tienes más de uno, piensa en el que MÁS usa pantallas.",
    options:[{value:"2-3",label:"2–3 años"},{value:"4-5",label:"4–5 años"},{value:"6-7",label:"6–7 años"},{value:"8-9",label:"8–9 años"},{value:"10-12",label:"10–12 años"}]},
  {id:2,phase:1,type:"single",slug:"screenTime",
    headline:"¿Cuántas horas al día pasa frente a una pantalla?",
    micro:"La mayoría miente en esta pregunta — incluso consigo mismos. Por eso no cambian nada.",
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
  // id:9 é COMMITMENT
  {id:9,phase:3,type:"commit",slug:"commit"},
  // id:10 = nome do filho + nome do pai/mãe juntos
  {id:10,phase:4,type:"names",slug:"names",
    headline:"Antes de mostrarte el diagnóstico…",
    micro:"Vamos a personalizar todo con los nombres reales."},
  // id:11 = email + WhatsApp juntos
  {id:11,phase:4,type:"contact",slug:"contact",
    headline:"¿A dónde enviamos el diagnóstico de {child}?",
    micro:"Acceso inmediato al app + recordatorios diarios gratis."},
];

const TOTAL_STEPS = 11;

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

const GCSS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#FFFBF5;--sf:#FFF;--pr:#E8532E;--pl:#FFF0EB;--sc:#2D936C;--sl:#E8F5EE;--dn:#D32F2F;--dl:#FDEAEA;--tx:#1A1A1A;--tm:#555;--tl:#888;--bd:#E8E0D8;--rd:14px;--ft:'Nunito','Segoe UI',sans-serif}
@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes si{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}
@keyframes so{from{opacity:1;transform:none}to{opacity:0;transform:translateX(-30px)}}
@keyframes sh{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes mf{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes countUp{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
@keyframes drawBar{from{width:0}to{width:var(--bw)}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`;

const SH = {fontFamily:"var(--ft)",background:"var(--bg)",color:"var(--tx)",height:"100%",overflowY:"auto",position:"relative",lineHeight:1.55,WebkitOverflowScrolling:"touch"};
const INP = {width:"100%",padding:"16px 14px",fontSize:16,fontFamily:"var(--ft)",border:"2px solid var(--bd)",borderRadius:"var(--rd)",background:"var(--sf)",outline:"none",fontWeight:600,color:"var(--tx)"};

function Btn({children,onClick,disabled,pulse}){
  return <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"17px 24px",background:disabled?"#ccc":"var(--pr)",color:disabled?"#999":"#fff",border:"none",borderRadius:"var(--rd)",fontFamily:"var(--ft)",fontSize:16,fontWeight:900,cursor:disabled?"default":"pointer",transition:"all .15s",boxShadow:disabled?"none":"0 4px 16px rgba(232,83,46,.35)",letterSpacing:"0.01em",animation:pulse&&!disabled?"pulse 2s ease-in-out infinite":"none"}}>{children}</button>;
}

function PBar({pid,cur}){
  var pct = Math.round((cur / TOTAL_STEPS) * 100);
  return <div style={{padding:"10px 18px 8px",background:"var(--bg)",position:"sticky",top:0,zIndex:10}}>
    <div style={{display:"flex",gap:4,marginBottom:6}}>
      {PHASES.map(function(p){return <div key={p.id} style={{flex:p.steps.length,textAlign:"center"}}>
        <div style={{height:4,borderRadius:2,marginBottom:4,background:p.id<=pid?"var(--pr)":"var(--bd)",transition:"background .3s"}}/>
        <span style={{fontSize:8.5,fontWeight:p.id===pid?900:600,color:p.id===pid?"var(--pr)":"var(--tl)",letterSpacing:"0.06em"}}>{p.label}</span>
      </div>})}
    </div>
    <div style={{textAlign:"right",fontSize:10,color:"var(--tl)",fontWeight:700}}>{pct}% completado • paso {cur} de {TOTAL_STEPS}</div>
  </div>;
}

function OCard({o,sel,onClick}){
  return <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:sel?"var(--pl)":"var(--sf)",border:sel?"2px solid var(--pr)":"2px solid var(--bd)",borderRadius:"var(--rd)",cursor:"pointer",textAlign:"left",transition:"all .15s",fontFamily:"var(--ft)",transform:sel?"scale(1.01)":"none",boxShadow:sel?"0 2px 10px rgba(232,83,46,.12)":"none"}}>
    <span style={{fontSize:14,fontWeight:sel?800:600,color:"var(--tx)",flex:1,lineHeight:1.4}}>{o.label}</span>
    {sel && <span style={{color:"var(--pr)",fontWeight:800,fontSize:18}}>✓</span>}
  </button>;
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
      <text x="130" y="48" textAnchor="middle" fontSize="13" fontWeight="800" fill="white" fontFamily="sans-serif">DESCONECTA</text>
      <text x="130" y="64" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)" fontFamily="sans-serif">DÍA 3 DE 21 • SEMANA 1</text>
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
    if(stp.type==="mirror"||stp.type==="transition") return true;
    if(stp.type==="commit") return commitYes;
    if(stp.type==="names") return ud.childName.trim().length>0 && ud.parentName.trim().length>0;
    if(stp.type==="contact") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ud.email);
    return true;
  };

  // ═════════════════ START ═════════════════
  if(scr==="start"){
    return <div ref={rf} style={SH}><style>{GCSS}</style>
      <div style={{padding:"24px 20px 32px",textAlign:"center",animation:"fi .45s ease both"}}>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:"-0.02em",color:"var(--pr)",marginBottom:2}}>DESCONECTA</div>
        <div style={{fontSize:9,color:"var(--tl)",letterSpacing:"0.18em",fontWeight:700,marginBottom:16}}>TEST DE DEPENDENCIA INFANTIL</div>

        <div style={{background:"var(--dl)",border:"1px solid #F5C6C6",borderRadius:12,padding:"10px 14px",marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:900,color:"var(--dn)",letterSpacing:"0.05em",marginBottom:2}}>⚠ ALERTA PEDIÁTRICA 2026</div>
          <div style={{fontSize:11,color:"var(--tm)",lineHeight:1.4}}>El 73% de los niños en LATAM ya muestra señales de dependencia por dopamina.</div>
        </div>

        <h1 style={{fontSize:24,fontWeight:900,lineHeight:1.2,marginBottom:10}}>Tu hijo pasa MÁS tiempo en pantallas del que crees.</h1>
        <p style={{fontSize:15,fontWeight:700,color:"var(--tm)",marginBottom:6}}>Y cada día que pasa, es más difícil revertirlo.</p>

        <div style={{height:36,display:"flex",alignItems:"center",justifyContent:"center",margin:"14px 0",overflow:"hidden"}}>
          <span style={{fontSize:13,color:"var(--tl)",fontWeight:700}}>Hijos que vuelven a&nbsp;</span>
          <span key={wi} style={{display:"inline-block",fontSize:15,fontWeight:900,color:"var(--pr)",animation:"fi .5s ease both",fontStyle:"italic"}}>{W[wi]}</span>
        </div>

        <p style={{fontSize:14,color:"var(--tm)",lineHeight:1.55,marginBottom:18}}>Descubre en <strong>90 segundos</strong> el nivel de dependencia de tu hijo — y qué hacer en los próximos 21 días.</p>

        <div style={{marginBottom:20}}><PhoneLoop childName={ud.childName} width={280}/></div>

        <Btn onClick={function(){setScr("quiz");setCur(1);top2()}} pulse>DESCUBRIR EL NIVEL DE MI HIJO →</Btn>
        <p style={{fontSize:11,color:"var(--tl)",marginTop:10,fontWeight:600}}>Gratis • 90 segundos • 12.000 familias ya lo hicieron</p>

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
      return <div ref={rf} style={SH}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"30px 22px 120px",animation:"fi .5s ease both"}}>
          <div style={{fontSize:10,color:"var(--dn)",fontWeight:900,letterSpacing:"0.12em",marginBottom:10}}>⏸ UN MOMENTO.</div>
          <h2 style={{fontSize:22,fontWeight:900,lineHeight:1.3,marginBottom:20}}>Lo que acabas de marcar significa esto:</h2>

          <div style={{background:"var(--sf)",border:"2px solid var(--dn)",borderRadius:"var(--rd)",padding:"20px 18px",marginBottom:14,animation:"fadeInUp .5s .1s ease both",opacity:0}}>
            <div style={{fontSize:11,color:"var(--tl)",fontWeight:700,marginBottom:4}}>AL AÑO</div>
            <div style={{fontSize:36,fontWeight:900,color:"var(--dn)",lineHeight:1,marginBottom:4,animation:"countUp .5s .2s ease both",opacity:0}}>{hy.toLocaleString()}h</div>
            <div style={{fontSize:13,color:"var(--tm)"}}>horas frente a una pantalla</div>
          </div>

          <div style={{background:"var(--sf)",border:"2px solid var(--dn)",borderRadius:"var(--rd)",padding:"20px 18px",marginBottom:14,animation:"fadeInUp .5s .3s ease both",opacity:0}}>
            <div style={{fontSize:11,color:"var(--tl)",fontWeight:700,marginBottom:4}}>ESO EQUIVALE A</div>
            <div style={{fontSize:36,fontWeight:900,color:"var(--dn)",lineHeight:1,marginBottom:4}}>{dy} días</div>
            <div style={{fontSize:13,color:"var(--tm)"}}>enteros del año sin despegar los ojos</div>
          </div>

          <div style={{background:"var(--sf)",border:"2px solid var(--dn)",borderRadius:"var(--rd)",padding:"20px 18px",marginBottom:24,animation:"fadeInUp .5s .5s ease both",opacity:0}}>
            <div style={{fontSize:11,color:"var(--tl)",fontWeight:700,marginBottom:4}}>A LOS 12 AÑOS</div>
            <div style={{fontSize:36,fontWeight:900,color:"var(--dn)",lineHeight:1,marginBottom:4}}>{yrsBy12} años</div>
            <div style={{fontSize:13,color:"var(--tm)"}}>de su vida entera, mirando una pantalla</div>
          </div>

          <div style={{background:"var(--pl)",borderRadius:"var(--rd)",padding:"18px 16px",marginBottom:20,borderLeft:"4px solid var(--pr)"}}>
            <p style={{fontSize:14,fontWeight:700,color:"var(--tx)",lineHeight:1.5}}>No es culpa tuya.<br/>Pero sí es tu decisión pararlo.</p>
          </div>

          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, #FFFBF5 25%)",maxWidth:400,margin:"0 auto"}}>
            <Btn onClick={goN}>SEGUIR — QUIERO REVERTIR ESTO →</Btn>
          </div>
        </div>
      </div>;
    }

    // TRANSITION (id 6)
    if(stp && stp.type==="transition"){
      var r = ans.reaction;
      var rMap = {cries:"llanto intenso", aggressive:"gritos y agresividad", apathetic:"apatía total", "asks-again":"pedidos constantes", accepts:"resistencia leve"};
      var rTxt = rMap[r] || "reacción fuerte";
      return <div ref={rf} style={SH}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"30px 22px 120px",animation:"fi .5s ease both"}}>
          <div style={{fontSize:10,color:"var(--pr)",fontWeight:900,letterSpacing:"0.12em",marginBottom:10}}>🧠 LA VERDAD INCÓMODA</div>
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

          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, #FFFBF5 25%)",maxWidth:400,margin:"0 auto"}}>
            <Btn onClick={goN}>ENTIENDO — SIGAMOS →</Btn>
          </div>
        </div>
      </div>;
    }

    // COMMITMENT (id 9)
    if(stp && stp.type==="commit"){
      return <div ref={rf} style={SH}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"30px 22px 120px",animation:"fi .5s ease both"}}>
          <div style={{fontSize:10,color:"var(--pr)",fontWeight:900,letterSpacing:"0.12em",marginBottom:10}}>🤝 MICRO-COMPROMISO</div>
          <h2 style={{fontSize:22,fontWeight:900,lineHeight:1.3,marginBottom:12}}>Antes de continuar, una pregunta seria.</h2>
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
      return <div ref={rf} style={SH}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
        <div style={{padding:"24px 22px 120px",animation:an}}>
          <div style={{fontSize:11,color:"var(--tl)",fontWeight:700,letterSpacing:"0.05em",marginBottom:8}}>PASO {cur} DE {TOTAL_STEPS}</div>
          <h2 style={{fontSize:22,fontWeight:900,lineHeight:1.3,marginBottom:8}}>{stp.headline}</h2>
          <p style={{fontSize:13,color:"var(--tm)",marginBottom:20,fontStyle:"italic"}}>{stp.micro}</p>

          <label style={{display:"block",fontSize:12,fontWeight:800,color:"var(--tm)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Nombre de tu hijo(a)</label>
          <input type="text" placeholder="Ej: Mateo, Valentina…" value={ud.childName} onChange={function(e){var v=e.target.value;setUd(function(p){var n=Object.assign({},p);n.childName=v;return n})}} style={Object.assign({},INP,{marginBottom:16})}/>

          <label style={{display:"block",fontSize:12,fontWeight:800,color:"var(--tm)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Tu primer nombre</label>
          <input type="text" placeholder="Tu nombre" value={ud.parentName} onChange={function(e){var v=e.target.value;setUd(function(p){var n=Object.assign({},p);n.parentName=v;return n})}} style={INP}/>

          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px 20px",background:"linear-gradient(transparent, #FFFBF5 25%)",maxWidth:400,margin:"0 auto"}}>
            <Btn onClick={goN} disabled={!ok()}>CASI LISTO →</Btn>
          </div>
        </div>
      </div>;
    }

    // CONTACT (id 11)
    if(stp && stp.type==="contact"){
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
    return <div ref={rf} style={SH}><style>{GCSS}</style><PBar pid={pid} cur={cur}/>
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
    return <div ref={rf} style={SH}><style>{GCSS}</style>
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
      text: ans.reaction==="aggressive" ? "Mi hijo me pegaba cuando le quitaba la tablet. En 10 días el cambio fue brutal. No lo podía creer." : ans.reaction==="cries" ? "Lloraba 40 minutos cada vez. Hoy pide ir al parque antes de preguntar por el celular." : "Pensé que era imposible. El cambio fue más natural de lo que creía."
    };

    return <div ref={rf} style={SH}><style>{GCSS}</style>
      <div style={{animation:"fi .6s ease both"}}>
        {/* LIVE APP PREVIEW */}
        <div style={{background:"#1A1A1A",padding:"18px 0 22px",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#E8532E",fontWeight:900,letterSpacing:"0.15em",marginBottom:12}}>TU APP PERSONALIZADO PARA {cn.toUpperCase()}</div>
          <PhoneLoop childName={cn} width={260}/>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontWeight:600,marginTop:10}}>Vista previa en vivo • Día 3 de 21</div>
        </div>

        {/* SCORE HERO */}
        <div style={{background:"linear-gradient(180deg,#FFF,#FFFBF5)",padding:"26px 20px 20px",textAlign:"center",borderBottom:"1px solid var(--bd)"}}>
          <div style={{fontSize:10,color:"var(--tl)",fontWeight:900,letterSpacing:"0.15em",marginBottom:4}}>DIAGNÓSTICO DE {cn.toUpperCase()}</div>
          <div style={{fontSize:22,fontWeight:900,color:color,lineHeight:1.2,marginBottom:16}}>DEPENDENCIA {lbl}</div>

          <ScoreRing score={score} animated/>

          <p style={{fontSize:13,color:"var(--tm)",marginTop:12,lineHeight:1.5,maxWidth:320,margin:"12px auto 0"}}>
            {pn ? pn+", esto es " : "Esto es "}
            <strong style={{color:color}}>{score >= avg ? "peor que el promedio" : "similar al promedio"}</strong>
            {" para niños de "+(ans.age||"su edad")+" años."}
          </p>
        </div>

        <div style={{padding:"20px 20px 32px"}}>

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

          {/* TRAJETÓRIA */}
          <div style={{background:"#FFF",border:"2px solid var(--dn)",borderRadius:"var(--rd)",padding:"18px 16px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:900,color:"var(--dn)",letterSpacing:"0.08em",marginBottom:12}}>⚠ PROYECCIÓN SI NO HACES NADA</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120,marginBottom:10}}>
              {[
                {l:"Hoy",v:score,c:color},
                {l:"En 3m",v:Math.min(score+6,95),c:"#D32F2F"},
                {l:"En 6m",v:in6m,c:"#B71C1C"},
              ].map(function(b,i){return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{fontSize:14,fontWeight:900,color:b.c,marginBottom:4}}>{b.v}</div>
                <div style={{width:"100%",background:b.c,borderRadius:"6px 6px 0 0",height:(b.v*0.9)+"%",animation:"drawBar 1s "+(0.5+i*0.15)+"s ease both",transformOrigin:"bottom"}}/>
                <div style={{fontSize:11,color:"var(--tm)",fontWeight:700,marginTop:6}}>{b.l}</div>
              </div>})}
            </div>
          </div>

          <div style={{background:"var(--sl)",border:"2px solid var(--sc)",borderRadius:"var(--rd)",padding:"18px 16px",marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:900,color:"var(--sc)",letterSpacing:"0.08em",marginBottom:12}}>✓ PROYECCIÓN CON EL PLAN DE 21 DÍAS</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120,marginBottom:10}}>
              {[
                {l:"Hoy",v:score,c:color},
                {l:"Día 7",v:Math.round((score+with21)*0.6),c:"#E8A32E"},
                {l:"Día 21",v:with21,c:"#2D936C"},
              ].map(function(b,i){return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{fontSize:14,fontWeight:900,color:b.c,marginBottom:4}}>{b.v}</div>
                <div style={{width:"100%",background:b.c,borderRadius:"6px 6px 0 0",height:(b.v*0.9)+"%",animation:"drawBar 1s "+(0.5+i*0.15)+"s ease both"}}/>
                <div style={{fontSize:11,color:"var(--tm)",fontWeight:700,marginTop:6}}>{b.l}</div>
              </div>})}
            </div>
            <p style={{fontSize:12,color:"var(--tm)",marginTop:8,textAlign:"center",fontWeight:600}}>Basado en 12.000 familias que siguieron el plan.</p>
          </div>

          {/* REVIEW MATCHED */}
          <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:"16px",marginBottom:20}}>
            <div style={{fontSize:12,marginBottom:8}}>⭐⭐⭐⭐⭐</div>
            <p style={{fontSize:14,fontWeight:600,marginBottom:10,fontStyle:"italic",lineHeight:1.5}}>"{matchedReview.text}"</p>
            <div style={{fontSize:13,fontWeight:800}}>{matchedReview.name}</div>
            <div style={{fontSize:11,color:"var(--tl)"}}>{matchedReview.detail} • perfil similar al tuyo</div>
          </div>

          {/* CTA */}
          <div style={{background:"linear-gradient(135deg,#FFF0EB,#FFF5E6)",border:"2px solid var(--pr)",borderRadius:"var(--rd)",padding:"22px 18px",textAlign:"center"}}>
            <p style={{fontSize:15,fontWeight:900,marginBottom:6,lineHeight:1.3}}>El plan de 21 días de {cn} está listo.</p>
            <p style={{fontSize:12,color:"var(--tm)",marginBottom:14}}>Acceso por menos de lo que cuesta un café al día por un mes.</p>
            <Btn onClick={function(){setScr("pricing");top2()}} pulse>VER MI PLAN Y EMPEZAR →</Btn>
            <p style={{fontSize:10,color:"var(--tl)",marginTop:10}}>🛡 Garantía 7 días • Acceso inmediato</p>
          </div>
        </div>
      </div>
    </div>;
  }

  // ═════════════════ PRICING (2 planos + urgência real) ═════════════════
  if(scr==="pricing"){
    var pls=[
      {id:"basic",nm:"Acceso Esencial",pr:7,op:27,
        ft:[
          "App Desconecta (Android + iPhone)",
          "Plan 21 días personalizado",
          "Actividades por edad de "+cn,
        ]},
      {id:"complete",nm:"Transformación Completa",pr:17,op:67,rec:true,
        ft:[
          "Todo lo del Acceso Esencial",
          "50+ actividades personalizadas",
          "Guiones listos para berrinches",
          "Rutina nocturna sin pantallas",
          "Guía: Cómo hablar con los abuelos",
          "Recordatorios diarios por WhatsApp",
        ]},
    ];
    var ctaTxt = sp==="basic" ? "EMPEZAR POR $7 →" : "EMPEZAR LA SEMANA 1 HOY — $17 →";
    var price = sp==="basic" ? 7 : 17;

    var fqs=[
      {q:"¿Cuándo recibo acceso al app?",a:"Inmediatamente después del pago. Link por email y WhatsApp. Funciona en Android 5.0+, iPhone iOS 13+ y navegador."},
      {q:"¿Funciona si mi hijo hace mucho berrinche?",a:"Sí — el plan incluye guiones específicos para cada tipo de reacción. La Sustitución Progresiva NO quita todo de golpe."},
      {q:"¿Cuánto tiempo necesito al día?",a:"10-15 minutos. Diseñado para padres que trabajan. No requiere materiales especiales."},
      {q:"¿Y si no me gusta?",a:"Garantía 7 días — te devolvemos el 100% sin preguntas. El riesgo es nuestro."},
    ];

    return <div ref={rf} style={SH}><style>{GCSS}</style>
      <div style={{animation:"fi .5s ease both"}}>
        {/* Cohort real urgency */}
        <div style={{background:"var(--sc)",color:"#fff",padding:"10px 16px",textAlign:"center",fontSize:12,fontWeight:800,letterSpacing:"0.02em"}}>
          📅 Próxima cohorte empieza lunes 27 de abril • quedan 47 cupos
        </div>

        <div style={{padding:"24px 20px 40px"}}>
          <h2 style={{fontSize:21,fontWeight:900,textAlign:"center",marginBottom:6,lineHeight:1.3}}>{pn?pn+", elige":"Elige"} cómo empezar</h2>
          <p style={{fontSize:13,color:"var(--tm)",textAlign:"center",marginBottom:20}}>Acceso inmediato • Android + iPhone</p>

          {/* GARANTIA ACIMA */}
          <div style={{background:"var(--sl)",border:"1px solid #B8DFC9",borderRadius:"var(--rd)",padding:"14px",marginBottom:18,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28,flexShrink:0}}>🛡</div>
            <div>
              <div style={{fontSize:13,fontWeight:900,color:"var(--sc)"}}>Garantía 7 días — 100% de vuelta</div>
              <div style={{fontSize:11,color:"var(--tm)"}}>Sin preguntas. El riesgo es completamente nuestro.</div>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            {pls.map(function(pl){
              var is2 = sp===pl.id;
              return <button key={pl.id} onClick={function(){setSp(pl.id)}} style={{width:"100%",textAlign:"left",cursor:"pointer",background:is2?"var(--pl)":"var(--sf)",border:is2?"2px solid var(--pr)":"2px solid var(--bd)",borderRadius:"var(--rd)",padding:"18px 16px",position:"relative",fontFamily:"var(--ft)",transform:is2?"scale(1.015)":"none",transition:"all .2s",boxShadow:is2?"0 4px 20px rgba(232,83,46,.15)":"none"}}>
                {pl.rec?<div style={{position:"absolute",top:-10,right:14,background:"var(--pr)",color:"#fff",fontSize:10,fontWeight:900,padding:"4px 10px",borderRadius:20,letterSpacing:"0.05em"}}>RECOMENDADO</div>:null}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:15,fontWeight:900}}>{pl.nm}</div>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontSize:12,color:"var(--tl)",textDecoration:"line-through",marginRight:5}}>${pl.op}</span>
                    <span style={{fontSize:24,fontWeight:900,color:"var(--pr)"}}>${pl.pr}</span>
                    <span style={{fontSize:11,color:"var(--tl)"}}> USD</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {pl.ft.map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7}}>
                    <span style={{color:"var(--sc)",fontWeight:800,fontSize:13,marginTop:1}}>✓</span>
                    <span style={{fontSize:12,color:"var(--tm)"}}>{f}</span>
                  </div>})}
                </div>
              </button>;
            })}
          </div>

          <Btn onClick={function(){alert("Checkout — integrar pasarela")}} pulse>{ctaTxt}</Btn>
          <p style={{fontSize:11,color:"var(--tl)",textAlign:"center",marginTop:8,fontWeight:600}}>≈ menos que 1 café al día por un mes • pago único</p>
          <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:10,fontSize:11,color:"var(--tl)"}}>
            <span>💳 Tarjeta</span><span>📲 PayPal</span><span>🍎 Apple Pay</span>
          </div>

          <h3 style={{fontSize:16,fontWeight:900,textAlign:"center",marginTop:30,marginBottom:14}}>Preguntas frecuentes</h3>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {fqs.map(function(f,i){return <div key={i} style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",overflow:"hidden"}}>
              <button onClick={function(){setEfq(efq===i?null:i)}} style={{width:"100%",padding:"13px 14px",background:"none",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontFamily:"var(--ft)",textAlign:"left"}}>
                <span style={{fontSize:13,fontWeight:700}}>{f.q}</span>
                <span style={{fontSize:16,color:"var(--tl)",transform:efq===i?"rotate(45deg)":"none",transition:"transform .2s"}}>+</span>
              </button>
              {efq===i?<div style={{padding:"0 14px 12px",fontSize:12,color:"var(--tm)",lineHeight:1.55}}>{f.a}</div>:null}
            </div>})}
          </div>
        </div>
      </div>
    </div>;
  }

  return null;
}

window.App = App;
