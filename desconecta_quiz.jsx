import { useState, useEffect, useRef } from "react";

const PHASES = [
  { id: 1, label: "SITUACIÓN", steps: [1,2,3,4] },
  { id: 2, label: "COMPORTAMIENTO", steps: [5,6,7,8,9] },
  { id: 3, label: "FAMILIA", steps: [10,11,12,13] },
  { id: 4, label: "TU PLAN", steps: [14,15,16,17,18] },
];

const STEPS = [
  {id:1,phase:1,type:"single",slug:"age",headline:"¿Cuántos años tiene tu hijo?",micro:"Si tienes más de uno, piensa en el que más usa pantallas",options:[{value:"2-3",label:"2–3 años",icon:"👶"},{value:"4-5",label:"4–5 años",icon:"🧒"},{value:"6-7",label:"6–7 años",icon:"👦"},{value:"8-9",label:"8–9 años",icon:"🧑"},{value:"10-12",label:"10–12 años",icon:"👧"}]},
  {id:2,phase:1,type:"single",slug:"screenTime",headline:"¿Cuántas horas al día pasa frente a una pantalla?",micro:"Sé honesto. No te voy a juzgar. (La mayoría de los padres subestima este número.)",options:[{value:"less-1h",label:"Menos de 1 hora",icon:"🟢"},{value:"1-2h",label:"1 a 2 horas",icon:"🟡"},{value:"2-4h",label:"2 a 4 horas",icon:"🟠"},{value:"4-6h",label:"4 a 6 horas",icon:"🔴"},{value:"6h+",label:"Más de 6 horas",icon:"⛔"},{value:"unknown",label:"No estoy seguro",icon:"🤷"}]},
  {id:3,phase:1,type:"multi",slug:"criticalMoments",minSelect:1,headline:"¿En qué momento la pantalla es IMPOSIBLE de quitar?",micro:"Selecciona todos los que apliquen",options:[{value:"morning",label:"Al despertar",icon:"🌅"},{value:"meals",label:"Durante las comidas",icon:"🍽️"},{value:"car",label:"En el auto",icon:"🚗"},{value:"bored",label:"Cuando se aburre",icon:"😤"},{value:"tantrum",label:"Cuando hace berrinche",icon:"😭"},{value:"bedtime",label:"Antes de dormir",icon:"🌙"},{value:"chores",label:"Mientras hago tareas del hogar",icon:"🏠"},{value:"work",label:"Mientras trabajo",icon:"💼"}]},
  {id:4,phase:1,type:"single",slug:"reaction",headline:"¿Qué pasa cuando intentas quitarle la pantalla?",micro:"Sé brutalmente honesto. Esta respuesta cambia tu plan por completo.",options:[{value:"cries",label:"Llora y hace berrinche",icon:"😢"},{value:"aggressive",label:"Se pone agresivo o grita",icon:"😡"},{value:"apathetic",label:"Se queda sin hacer nada",icon:"😶"},{value:"asks-again",label:"Acepta, pero vuelve a pedir",icon:"🔄"},{value:"accepts",label:"La acepta bien",icon:"😊"}]},
  {id:5,phase:2,type:"multi",slug:"triedMethods",minSelect:1,headline:"¿Qué has intentado hasta ahora para reducir las pantallas?",micro:"Todo lo que hayas probado cuenta",options:[{value:"cold-turkey",label:"Quitar todo de golpe",icon:"🚫"},{value:"schedules",label:"Poner horarios fijos",icon:"⏰"},{value:"parental-control",label:"Apps de control parental",icon:"📱"},{value:"alternatives",label:"Ofrecer alternativas",icon:"🎨"},{value:"talking",label:"Hablar y explicar",icon:"🗣️"},{value:"nothing",label:"Nada todavía",icon:"🤷"}]},
  {id:6,phase:2,type:"multi",slug:"alternatives",minSelect:1,headline:"Cuando NO tiene pantalla… ¿qué hace tu hijo?",micro:"Esto nos dice mucho sobre su nivel de dependencia",options:[{value:"draws",label:"Dibuja o pinta",icon:"🎨"},{value:"toys",label:"Juega con juguetes",icon:"🧩"},{value:"books",label:"Pide leer o que le lean",icon:"📖"},{value:"outdoor",label:"Corre y juega afuera",icon:"🏃"},{value:"bored",label:"Dice que está aburrido",icon:"😐"},{value:"clingy",label:"Se pega a mí pidiendo atención",icon:"😢"},{value:"never-off",label:"Casi nunca está sin pantalla",icon:"📵"}]},
  {id:7,phase:2,type:"multi",slug:"contentType",minSelect:1,headline:"¿Qué tipo de contenido consume más?",micro:"Cada tipo estimula el cerebro de forma diferente. Esto define la intensidad de tu plan.",options:[{value:"cartoons",label:"Series y dibujos animados",icon:"📺"},{value:"games",label:"Videojuegos",icon:"🎮"},{value:"short-videos",label:"Videos cortos (YouTube/TikTok)",icon:"📱"},{value:"music",label:"Videos musicales / slime",icon:"🎵"},{value:"educational",label:"Apps educativas",icon:"📚"},{value:"gameplay",label:"Ver a otros jugar (gameplay)",icon:"🤳"}]},
  {id:8,phase:2,type:"single",slug:"routine",headline:"¿Cómo es un día normal en tu familia?",micro:"",options:[{value:"home-fulltime",label:"Estoy en casa todo el día con mi hijo",icon:"🏠"},{value:"work-outside",label:"Trabajo fuera, mi hijo va a escuela",icon:"💼"},{value:"home-office",label:"Trabajo desde casa",icon:"🏡"},{value:"grandparents",label:"Lo cuidan los abuelos u otra persona",icon:"👵"},{value:"varies",label:"Varía mucho, sin rutina fija",icon:"🔄"}]},
  {id:9,phase:2,type:"single",slug:"biggestChallenge",headline:"Si tuvieras que elegir UNA cosa… ¿cuál es tu mayor obstáculo?",micro:"La respuesta más dolorosa suele ser la más verdadera.",options:[{value:"no-time",label:"No tengo tiempo para entretenerlo",icon:"⏰"},{value:"no-ideas",label:"No sé qué ofrecerle en su lugar",icon:"💡"},{value:"tantrums",label:"La pelea no vale la pena",icon:"😤"},{value:"partner",label:"Mi pareja no colabora",icon:"👫"},{value:"other-adults",label:"Otros adultos le dan pantalla",icon:"👨‍👩‍👧"},{value:"myself",label:"Yo mismo no puedo soltar mi celular",icon:"😩"}]},
  {id:10,phase:3,type:"single",slug:"kidsCount",headline:"¿Cuántos hijos tienes?",micro:"",options:[{value:"1",label:"1 hijo",icon:"👤"},{value:"2",label:"2 hijos",icon:"👥"},{value:"3+",label:"3 o más",icon:"👨‍👩‍👧‍👦"}]},
  {id:11,phase:3,type:"single",slug:"space",headline:"¿Qué espacio tienes en casa para jugar?",micro:"Tu plan se adapta a lo que tienes — no a lo que te falta.",options:[{value:"small-apt",label:"Apartamento pequeño",icon:"🏠"},{value:"big-apt",label:"Apartamento grande o con balcón",icon:"🏢"},{value:"house-yard",label:"Casa con jardín o patio",icon:"🏡"},{value:"near-park",label:"Cerca de un parque o plaza",icon:"🏞️"}]},
  {id:12,phase:3,type:"single",slug:"budget",headline:"¿Cuánto puedes invertir en materiales?",micro:"Plastilina, pinturas, juegos de mesa, libros…",options:[{value:"zero",label:"Cero — solo lo que ya tengo",icon:"💚"},{value:"low",label:"Hasta $20 USD al mes",icon:"💛"},{value:"medium",label:"Hasta $50 USD al mes",icon:"🧡"},{value:"unlimited",label:"Sin límite definido",icon:"❤️"}]},
  {id:13,phase:3,type:"single",slug:"motivation",headline:"¿Qué te hizo buscar una solución HOY?",micro:"No mañana. No la próxima semana. Hoy.",options:[{value:"development",label:"Me preocupa su desarrollo",icon:"🧠"},{value:"sleep",label:"Problemas para dormir",icon:"😴"},{value:"school",label:"Rendimiento escolar bajó",icon:"📉"},{value:"scared",label:"Vi algo que me asustó",icon:"👁️"},{value:"connection",label:"Pierdo la conexión con mi hijo",icon:"💔"},{value:"now-or-never",label:"Es ahora o nunca",icon:"⏰"}]},
  {id:14,phase:4,type:"single",slug:"who",headline:"¿Quién está respondiendo este test?",micro:"",options:[{value:"mom",label:"Mamá",icon:"👩"},{value:"dad",label:"Papá",icon:"👨"},{value:"couple",label:"Los dos juntos",icon:"👫"},{value:"other",label:"Otro cuidador",icon:"👤"}]},
  {id:15,phase:4,type:"text",slug:"childName",headline:"¿Cómo se llama tu hijo(a)?",micro:"Vamos a usar su nombre para personalizar cada día de su plan",placeholder:"Ej: Mateo, Valentina…"},
  {id:16,phase:4,type:"text",slug:"parentName",headline:"¿Y cuál es TU nombre?",micro:"Para hablarte como lo que eres: alguien que está haciendo algo al respecto.",placeholder:"Tu primer nombre"},
  {id:17,phase:4,type:"email",slug:"email",headline:"¿Dónde te enviamos el plan?",micro:"Recibirás el resultado + 3 estrategias bonus en los próximos días.",placeholder:"tu@email.com"},
  {id:18,phase:4,type:"phone",slug:"whatsapp",headline:"¿Quieres recordatorios diarios por WhatsApp?",micro:"Las familias con recordatorio tienen 3x más probabilidad de completar el plan.",placeholder:"+1 (555) 123-4567"},
];

const TR = {
  1: { headline: "No estás solo en esto.", body: "El 87% de los padres dice que sus hijos pasan más tiempo en pantallas del que quisieran. Lo importante no es lo que pasó ayer. Lo importante es que HOY estás aquí.", icon: "💛", cta: "Sigamos" },
  2: { headline: "La buena noticia: el cerebro infantil se adapta RÁPIDO.", body: "Niños que reemplazan solo 1 hora de pantalla por juego libre mejoran su atención y humor en 7 días. Imagina lo que 21 días pueden hacer.", icon: "🧠", cta: "Falta poco — personalicemos tu plan" },
};

const LOADING_MSGS = ["Analizando la edad y el temperamento…","Calculando el nivel de dependencia…","Seleccionando actividades para tu familia…","Filtrando juegos según el espacio…","Ajustando la reducción progresiva…","Preparando guiones para la resistencia…","Armando el calendario de 21 días…","Casi listo — finalizando el plan…"];

const REVIEWS_PRICING = [
  { id: "rv1", text: "Lloraba de culpa cada noche. En 2 semanas mi hijo ya jugaba solo 40 minutos. CUARENTA MINUTOS. Lloré de nuevo… pero de alivio.", name: "María G.", detail: "Mamá de Emilio (5)", gender: "f", c1: "#F093FB", c2: "#F5576C", hair: "#3D2314", skin: "#EDCAAA" },
  { id: "rv2", text: "Mi esposa y yo peleábamos por la tablet. Este plan nos dio un camino juntos. Nuestro hijo duerme sin pantalla hace 3 semanas.", name: "Carlos R.", detail: "Papá de Daniel (7)", gender: "m", c1: "#4FACFE", c2: "#00F2FE", hair: "#1A1A1A", skin: "#D4A574" },
  { id: "rv3", text: "Soy abuela. Criaba a mis nietos con mucha pantalla porque no sabía qué más hacer. Las actividades son tan fáciles que hasta yo puedo hacerlas.", name: "Carmen L.", detail: "Abuela de Sofía (4) y Leo (6)", gender: "f", c1: "#43E97B", c2: "#38F9D7", hair: "#B0B0B0", skin: "#F0D0A8" },
];

const REVIEWS_START = [
  { id: "rs1", text: "En 1 semana mi hijo ya pedía jugar afuera", name: "Camila", detail: "mamá de Pedro (6)", gender: "f", c1: "#FF9A9E", c2: "#FAD0C4", hair: "#2C1810", skin: "#EDCAAA" },
  { id: "rs2", text: "Pensé que iba a ser imposible. El cambio fue natural", name: "Renata", detail: "mamá de Sofía (4)", gender: "f", c1: "#A18CD1", c2: "#FBC2EB", hair: "#5C3317", skin: "#F0D0A8" },
  { id: "rs3", text: "Mi hijo dormía con la tablet. Hoy se duerme con un libro", name: "Marco", detail: "papá de Lucas (8)", gender: "m", c1: "#84FAB0", c2: "#8FD3F4", hair: "#1A1A1A", skin: "#D4A574" },
];

function FemaleAvatar({ id, c1, c2, hair, skin, size }) {
  var isGray = hair === "#B0B0B0";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: "50%", flexShrink: 0, display: "block" }}>
      <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/></linearGradient></defs>
      <circle cx="50" cy="50" r="50" fill={"url(#" + id + ")"}/>
      <ellipse cx="50" cy="44" rx="20" ry="22" fill={skin}/>
      <circle cx="43" cy="40" r="2" fill="#333"/>
      <circle cx="57" cy="40" r="2" fill="#333"/>
      <path d="M46 50 Q50 53 54 50" stroke="#C4846C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="43" cy="47" rx="3.5" ry="2" fill="#F5A0A0" opacity="0.3"/>
      <ellipse cx="57" cy="47" rx="3.5" ry="2" fill="#F5A0A0" opacity="0.3"/>
      {isGray
        ? <path d="M30 38 Q30 20 50 18 Q70 20 70 38 Q68 30 50 26 Q32 30 30 38Z" fill={hair}/>
        : <><path d="M28 38 Q28 18 50 16 Q72 18 72 38 Q70 28 60 24 Q50 22 40 24 Q30 28 28 38Z" fill={hair}/><path d="M28 38 Q24 46 27 56 Q29 48 30 42Z" fill={hair}/><path d="M72 38 Q76 46 73 56 Q71 48 70 42Z" fill={hair}/></>
      }
      <path d="M30 80 Q30 68 50 64 Q70 68 70 80 L70 100 L30 100Z" fill={c1} opacity="0.85"/>
    </svg>
  );
}

function MaleAvatar({ id, c1, c2, hair, skin, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: "50%", flexShrink: 0, display: "block" }}>
      <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/></linearGradient></defs>
      <circle cx="50" cy="50" r="50" fill={"url(#" + id + ")"}/>
      <ellipse cx="50" cy="44" rx="19" ry="21" fill={skin}/>
      <circle cx="43" cy="40" r="2" fill="#333"/>
      <circle cx="57" cy="40" r="2" fill="#333"/>
      <path d="M46 50 Q50 53 54 50" stroke="#B07858" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M31 36 Q31 20 50 18 Q69 20 69 36 Q67 28 50 24 Q33 28 31 36Z" fill={hair}/>
      <rect x="32" y="24" width="36" height="10" rx="5" fill={hair} opacity="0.6"/>
      <path d="M32 80 Q32 68 50 64 Q68 68 68 80 L68 100 L32 100Z" fill={c1} opacity="0.85"/>
    </svg>
  );
}

function PersonAvatar({ person, size }) {
  var s = size || 44;
  if (person.gender === "f") return <FemaleAvatar id={person.id} c1={person.c1} c2={person.c2} hair={person.hair} skin={person.skin} size={s}/>;
  return <MaleAvatar id={person.id} c1={person.c1} c2={person.c2} hair={person.hair} skin={person.skin} size={s}/>;
}

const GCSS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{background:#FFFBF5}
:root{--bg:#FFFBF5;--sf:#FFF;--pr:#E8532E;--pl:#FFF0EB;--sc:#2D936C;--sl:#E8F5EE;--tx:#1A1A1A;--tm:#555;--tl:#888;--dn:#D32F2F;--bd:#E8E0D8;--rd:14px;--ft:'Nunito','Segoe UI',sans-serif}
@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes si{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:none}}
@keyframes so{from{opacity:1;transform:none}to{opacity:0;transform:translateX(-50px)}}
@keyframes wf{0%{opacity:0;transform:translateY(12px)}12%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0;transform:translateY(-12px)}}
@keyframes sh{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes mf{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}`;

const SH = {fontFamily:"var(--ft)",background:"var(--bg)",color:"var(--tx)",minHeight:"100vh",maxWidth:480,margin:"0 auto",overflowY:"auto",position:"relative",lineHeight:1.55};
const INP = {width:"100%",padding:"18px 16px",fontSize:17,fontFamily:"var(--ft)",border:"2px solid var(--bd)",borderRadius:"var(--rd)",background:"var(--sf)",outline:"none",fontWeight:600,color:"var(--tx)"};

function Btn({children,onClick,disabled}){
  return <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"18px 32px",background:disabled?"#ccc":"var(--pr)",color:disabled?"#999":"#fff",border:"none",borderRadius:"var(--rd)",fontFamily:"var(--ft)",fontSize:17,fontWeight:800,cursor:disabled?"default":"pointer",transition:"all .2s",boxShadow:disabled?"none":"0 4px 16px rgba(232,83,46,.35)"}}>{children}</button>;
}

function PBar({pid}){
  return <div style={{display:"flex",gap:4,padding:"16px 20px 8px",background:"var(--bg)"}}>
    {PHASES.map(function(p){return <div key={p.id} style={{flex:1,textAlign:"center"}}>
      <div style={{height:4,borderRadius:2,marginBottom:6,background:p.id<=pid?"var(--pr)":"var(--bd)",transition:"background .3s"}}/>
      <span style={{fontSize:10,fontWeight:p.id===pid?900:600,color:p.id===pid?"var(--pr)":"var(--tl)",letterSpacing:"0.08em"}}>{p.label}</span>
    </div>})}
  </div>;
}

function OCard({o,sel,onClick}){
  return <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:sel?"var(--pl)":"var(--sf)",border:sel?"2px solid var(--pr)":"2px solid var(--bd)",borderRadius:"var(--rd)",cursor:"pointer",textAlign:"left",transition:"all .15s",fontFamily:"var(--ft)",transform:sel?"scale(1.02)":"none",boxShadow:sel?"0 2px 12px rgba(232,83,46,.12)":"none"}}>
    <span style={{fontSize:24,lineHeight:1}}>{o.icon}</span>
    <span style={{fontSize:15,fontWeight:sel?700:500,color:"var(--tx)",flex:1}}>{o.label}</span>
    {sel && <span style={{color:"var(--pr)",fontWeight:800,fontSize:18}}>✓</span>}
  </button>;
}

function RCard({person, text, big}){
  return <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:big?"18px":"14px 16px",textAlign:"left"}}>
    <div style={{fontSize:12,marginBottom:8}}>⭐⭐⭐⭐⭐</div>
    <p style={{fontSize:14,fontWeight:600,marginBottom:12,fontStyle:"italic",lineHeight:1.55}}>"{text}"</p>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <PersonAvatar person={person} size={big ? 44 : 36}/>
      <div>
        <div style={{fontSize:13,fontWeight:800,color:"var(--tx)"}}>{person.name}</div>
        <div style={{fontSize:12,color:"var(--tl)"}}>{person.detail}</div>
      </div>
    </div>
  </div>;
}

export default function App(){
  const[scr,setScr]=useState("start");
  const[cur,setCur]=useState(1);
  const[ans,setAns]=useState({});
  const[ud,setUd]=useState({childName:"",parentName:"",email:"",whatsapp:""});
  const[optin,setOptin]=useState(true);
  const[lp,setLp]=useState(0);
  const[lmi,setLmi]=useState(0);
  const[sp,setSp]=useState("complete");
  const[tn,setTn]=useState(null);
  const[ad,setAd]=useState("in");
  const[cd,setCd]=useState(900);
  const[wi,setWi]=useState(0);
  const[efq,setEfq]=useState(null);
  const rf=useRef(null);
  const W=["dejar el celular","jugar de verdad","dormir mejor","concentrarse","obedecer sin pelear"];
  const top2=function(){if(rf.current)rf.current.scrollTo({top:0,behavior:"smooth"})};

  useEffect(function(){if(scr!=="start")return;var t=setInterval(function(){setWi(function(i){return(i+1)%W.length})},2600);return function(){clearInterval(t)}},[scr]);
  useEffect(function(){if(scr!=="pricing")return;var t=setInterval(function(){setCd(function(p){return Math.max(0,p-1)})},1000);return function(){clearInterval(t)}},[scr]);
  useEffect(function(){if(scr!=="loading")return;var p=setInterval(function(){setLp(function(v){if(v>=100){clearInterval(p);setTimeout(function(){setScr("result")},600);return 100}return v+1.2})},70);var m=setInterval(function(){setLmi(function(i){return(i+1)%LOADING_MSGS.length})},1800);return function(){clearInterval(p);clearInterval(m)}},[scr]);

  var stp=STEPS.find(function(s){return s.id===cur});
  var pid=stp?stp.phase:1;
  var cn=ud.childName||"tu hijo";
  var pn=ud.parentName||"";

  var goN=function(){
    if(cur===4&&!tn){setTn(1);top2();return}
    if(cur===9&&!tn){setTn(2);top2();return}
    if(cur+1>18){setScr("loading");return}
    setAd("out");setTimeout(function(){setCur(cur+1);setTn(null);setAd("in");top2()},250);
  };

  var hS=function(slug,val,type){
    if(type==="single")setAns(function(p){var n={};for(var k in p)n[k]=p[k];n[slug]=val;return n});
    else setAns(function(p){var n={};for(var k in p)n[k]=p[k];var c=n[slug]||[];if(c.indexOf(val)>=0)n[slug]=c.filter(function(v){return v!==val});else n[slug]=c.concat([val]);return n});
  };

  var ok=function(){
    if(!stp)return false;
    if(stp.type==="single")return!!ans[stp.slug];
    if(stp.type==="multi")return(ans[stp.slug]||[]).length>=(stp.minSelect||1);
    if(stp.type==="text")return stp.slug==="childName"?ud.childName.trim().length>0:ud.parentName.trim().length>0;
    if(stp.type==="email")return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ud.email);
    return true;
  };

  var fmt=function(s){return Math.floor(s/60).toString().padStart(2,"0")+":"+(s%60).toString().padStart(2,"0")};
  var stl={"less-1h":"menos de 1h","1-2h":"1-2h","2-4h":"2-4h","4-6h":"4-6h","6h+":"6h+","unknown":"~3h"};
  var mol={development:"su desarrollo",sleep:"el sueño",school:"la escuela",scared:"lo que viste",connection:"la conexión","now-or-never":"actuar ya"};

  // ═══════ START ═══════
  if(scr==="start"){
    return <div ref={rf} style={SH}><style>{GCSS}</style>
      <div style={{padding:"40px 24px 32px",textAlign:"center",animation:"fi .45s ease both"}}>
        <div style={{fontSize:28,fontWeight:900,letterSpacing:"-0.03em",color:"var(--pr)",marginBottom:8}}>DESCONECTA</div>
        <div style={{fontSize:11,color:"var(--tl)",letterSpacing:"0.15em",fontWeight:600,marginBottom:40}}>EL PLAN DE 21 DÍAS</div>
        <h1 style={{fontSize:26,fontWeight:900,lineHeight:1.25,marginBottom:8}}>El plan de 21 días que ayuda a tu hijo a…</h1>
        <div style={{height:42,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,overflow:"hidden"}}>
          <span key={wi} style={{display:"inline-block",fontSize:24,fontWeight:900,color:"var(--pr)",animation:"wf 2.6s ease both",fontStyle:"italic"}}>{W[wi]}</span>
        </div>
        <p style={{fontSize:16,fontWeight:700,marginBottom:6,lineHeight:1.4}}>…sin berrinches, sin culpa, y sin quitarle todo de golpe.</p>
        <div style={{width:50,height:3,background:"var(--pr)",borderRadius:2,margin:"24px auto"}}/>
        <p style={{fontSize:15,color:"var(--tm)",marginBottom:12,lineHeight:1.6}}>Responde unas preguntas rápidas y recibe un plan personalizado para la edad y el temperamento de tu hijo.</p>
        <p style={{fontSize:15,fontWeight:700,marginBottom:36}}>Es gratis. Toma 3 minutos. Y puede cambiar todo.</p>
        <Btn onClick={function(){setScr("quiz")}}>QUIERO MI PLAN PERSONALIZADO</Btn>
        <p style={{fontSize:13,color:"var(--tl)",marginTop:16,fontWeight:600}}>Más de 12,000 familias ya hicieron el test</p>
        <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:12}}>
          {REVIEWS_START.map(function(rv){return <RCard key={rv.id} person={rv} text={rv.text}/>})}
        </div>
        <p style={{fontSize:11,color:"var(--tl)",marginTop:24,lineHeight:1.5}}>Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.</p>
      </div>
    </div>;
  }

  // ═══════ QUIZ ═══════
  if(scr==="quiz"){
    if(tn){var t=TR[tn];return <div ref={rf} style={SH}><style>{GCSS}</style><PBar pid={pid}/>
      <div style={{padding:"60px 28px",textAlign:"center",animation:"fi .45s ease both"}}>
        <div style={{fontSize:52,marginBottom:20}}>{t.icon}</div>
        <h2 style={{fontSize:24,fontWeight:900,marginBottom:16,lineHeight:1.3}}>{t.headline}</h2>
        <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.7,marginBottom:40}}>{t.body}</p>
        <Btn onClick={function(){setTn(null);goN()}}>{t.cta}</Btn>
      </div>
    </div>;}

    var hl=stp?stp.headline:"";
    if(stp&&stp.slug==="email"&&ud.childName)hl=ud.childName+" ya tiene plan. ¿Dónde te lo enviamos?";
    var an2=ad==="in"?"si .3s ease both":"so .25s ease both";

    return <div ref={rf} style={SH}><style>{GCSS}</style><PBar pid={pid}/>
      <div key={cur} style={{padding:"24px 20px 120px",animation:an2}}>
        <div style={{fontSize:12,color:"var(--tl)",fontWeight:700,marginBottom:8,letterSpacing:"0.05em"}}>{"PREGUNTA "+cur+" DE 18"}</div>
        <h2 style={{fontSize:22,fontWeight:900,lineHeight:1.3,marginBottom:stp&&stp.micro?8:20}}>{hl}</h2>
        {stp&&stp.micro?<p style={{fontSize:14,color:"var(--tm)",marginBottom:20,lineHeight:1.5,fontStyle:"italic"}}>{stp.micro}</p>:null}

        {stp&&(stp.type==="single"||stp.type==="multi")?
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {stp.options.map(function(o){
              var sel=stp.type==="single"?ans[stp.slug]===o.value:(ans[stp.slug]||[]).indexOf(o.value)>=0;
              return <OCard key={o.value} o={o} sel={sel} onClick={function(){hS(stp.slug,o.value,stp.type)}}/>;
            })}
          </div>
        :null}

        {stp&&stp.type==="text"?<input type="text" placeholder={stp.placeholder} value={stp.slug==="childName"?ud.childName:ud.parentName} onChange={function(e){var v=e.target.value;setUd(function(p){var n={};for(var k in p)n[k]=p[k];n[stp.slug]=v;return n})}} style={Object.assign({},INP,{marginBottom:24})}/>:null}

        {stp&&stp.type==="email"?<div style={{marginBottom:24}}>
          <input type="email" placeholder={stp.placeholder} value={ud.email} onChange={function(e){var v=e.target.value;setUd(function(p){var n={};for(var k in p)n[k]=p[k];n.email=v;return n})}} style={INP}/>
          <label style={{display:"flex",alignItems:"center",gap:10,marginTop:14,fontSize:13,color:"var(--tm)",cursor:"pointer"}}>
            <input type="checkbox" checked={optin} onChange={function(e){setOptin(e.target.checked)}} style={{width:18,height:18,accentColor:"var(--pr)"}}/>
            Quiero recibir consejos semanales sobre desarrollo infantil
          </label>
          <p style={{fontSize:11,color:"var(--tl)",marginTop:10,lineHeight:1.5}}>Tus datos están seguros. No los compartimos con nadie.</p>
        </div>:null}

        {stp&&stp.type==="phone"?<div style={{marginBottom:24}}><input type="tel" placeholder={stp.placeholder} value={ud.whatsapp} onChange={function(e){var v=e.target.value;setUd(function(p){var n={};for(var k in p)n[k]=p[k];n.whatsapp=v;return n})}} style={INP}/></div>:null}

        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"12px 20px 20px",background:"linear-gradient(transparent, #FFFBF5 20%)"}}>
          {stp&&stp.type==="phone"?
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Btn onClick={goN}>QUIERO RECIBIR POR WHATSAPP</Btn>
              <button onClick={goN} style={{background:"none",border:"none",fontSize:14,color:"var(--tl)",cursor:"pointer",fontFamily:"var(--ft)",fontWeight:600,padding:8,textDecoration:"underline"}}>Saltar — solo quiero por email</button>
            </div>
          :<Btn onClick={goN} disabled={!ok()}>{stp&&stp.slug==="email"?"VER MI PLAN PERSONALIZADO →":"CONTINUAR →"}</Btn>}
        </div>
      </div>
    </div>;
  }

  // ═══════ LOADING ═══════
  if(scr==="loading"){
    return <div ref={rf} style={SH}><style>{GCSS}</style>
      <div style={{padding:"80px 28px",textAlign:"center",animation:"fi .6s ease both"}}>
        <div style={{fontSize:48,marginBottom:24}}>✨</div>
        <h2 style={{fontSize:22,fontWeight:900,marginBottom:8,lineHeight:1.3}}>{"Creando el plan de 21 días para "+cn+"…"}</h2>
        <p style={{fontSize:14,color:"var(--tm)",marginBottom:40}}>Esto toma unos segundos. Vale la pena esperar.</p>
        <div style={{width:"100%",height:8,borderRadius:4,background:"var(--bd)",overflow:"hidden",marginBottom:24}}>
          <div style={{width:Math.min(lp,100)+"%",height:"100%",borderRadius:4,transition:"width .1s linear",background:"linear-gradient(90deg,var(--pr),#FF8A5C,var(--pr))",backgroundSize:"200% 100%",animation:"sh 1.5s linear infinite"}}/>
        </div>
        <p style={{fontSize:13,color:"var(--tl)",fontWeight:600}}>{Math.min(Math.round(lp),100)+"%"}</p>
        <p key={lmi} style={{fontSize:15,color:"var(--tm)",marginTop:32,fontStyle:"italic",animation:"mf 1.8s ease both",minHeight:24}}>{LOADING_MSGS[lmi]}</p>
      </div>
    </div>;
  }

  // ═══════ RESULT ═══════
  if(scr==="result"){
    var screenT=stl[ans.screenTime]||"varias horas";
    var motiv=mol[ans.motivation]||"tu hijo";
    var bens=[
      {ic:"🧠",ti:"Atención restaurada",de:cn+" va a recuperar la capacidad de concentrarse sin pantalla."},
      {ic:"💛",ti:"Conexión fortalecida",de:"Momentos reales juntos. Sin pantalla compitiendo por la atención."},
      {ic:"🌙",ti:"Sueño reparado",de:"Reducir estímulos antes de dormir mejora el sueño notablemente."},
      {ic:"🎨",ti:"Creatividad desbloqueada",de:cn+" va a redescubrir el placer de jugar, crear e imaginar."},
    ];
    var days=["Mapear los horarios de pantalla actuales","Introducir 1 actividad sustituta","Repetir + agregar ritual de transición","Reducir 30 min en el momento más crítico","Día de juego guiado (con guión para ti)","Revisión — celebrar pequeñas victorias","Ajustar el plan para la Semana 2"];

    return <div ref={rf} style={SH}><style>{GCSS}</style>
      <div style={{animation:"fi .6s ease both"}}>
        <div style={{background:"linear-gradient(135deg,var(--pl),#FFF5E6)",padding:"36px 24px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>🎯</div>
          <h1 style={{fontSize:24,fontWeight:900,lineHeight:1.25,marginBottom:8}}>{"El plan de "+cn+" está listo"+(pn?", "+pn:"")+"."}</h1>
          <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.5}}>Basado en tus respuestas, creamos un programa de <strong>Sustitución Progresiva</strong> personalizado.</p>
        </div>
        <div style={{padding:"24px 20px 32px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:32}}>
            {[{ic:"🧒",la:cn,su:ans.age?(ans.age+" años"):""},{ic:"📱",la:screenT,su:"por día"},{ic:"🎯",la:"Motivación",su:motiv},{ic:"📅",la:"21 días",su:"reducción progresiva"}].map(function(c,i){
              return <div key={i} style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:"14px 12px",textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:4}}>{c.ic}</div>
                <div style={{fontSize:14,fontWeight:800}}>{c.la}</div>
                <div style={{fontSize:11,color:"var(--tl)",fontWeight:600}}>{c.su}</div>
              </div>
            })}
          </div>
          <h3 style={{fontSize:18,fontWeight:900,marginBottom:16,textAlign:"center"}}>Lo que este plan va a hacer por tu familia:</h3>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:36}}>
            {bens.map(function(b,i){return <div key={i} style={{display:"flex",gap:14,padding:16,background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",borderLeft:"4px solid var(--pr)"}}>
              <span style={{fontSize:28,lineHeight:1}}>{b.ic}</span>
              <div><div style={{fontSize:15,fontWeight:800,marginBottom:4}}>{b.ti}</div><div style={{fontSize:13,color:"var(--tm)",lineHeight:1.5}}>{b.de}</div></div>
            </div>})}
          </div>
          <h3 style={{fontSize:18,fontWeight:900,marginBottom:16}}>Tu plan — Vista previa:</h3>
          <div style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",overflow:"hidden",marginBottom:12}}>
            <div style={{background:"var(--sc)",color:"#fff",padding:"10px 16px",fontSize:13,fontWeight:800,letterSpacing:"0.05em"}}>SEMANA 1 — OBSERVACIÓN Y PRIMEROS CAMBIOS</div>
            {days.map(function(d,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<6?"1px solid var(--bd)":"none"}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,background:"var(--sl)",color:"var(--sc)",flexShrink:0}}>{String(i+1)}</div>
              <span style={{fontSize:13,fontWeight:500}}>{d}</span>
            </div>})}
          </div>
          {[2,3].map(function(w){return <div key={w} style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",padding:"28px 16px",textAlign:"center",marginBottom:10}}>
            <span style={{fontSize:28,display:"block",marginBottom:6}}>🔒</span>
            <span style={{fontSize:13,fontWeight:700,color:"var(--tm)"}}>{"Semana "+w+" — Disponible con el plan completo"}</span>
          </div>})}
          <div style={{marginTop:28,textAlign:"center"}}>
            <p style={{fontSize:13,color:"var(--tl)",fontWeight:600,marginBottom:12}}>4,837 familias empezaron el desafío este mes</p>
            <Btn onClick={function(){setScr("pricing");top2()}}>QUIERO EL PLAN COMPLETO DE 21 DÍAS →</Btn>
          </div>
        </div>
      </div>
    </div>;
  }

  // ═══════ PRICING ═══════
  if(scr==="pricing"){
    var pls=[
      {id:"basic",nm:"Primeros Pasos",pr:27,op:0,bd:"",ft:["Plan de 21 días (PDF)","Checklist diario","7 actividades por edad"]},
      {id:"complete",nm:"Transformación Completa",pr:47,op:97,bd:"MÁS ELEGIDO",ft:["Todo lo del plan básico","50 actividades por edad","Guiones para berrinches","Rutina nocturna sin pantallas","Guía: Hablar con abuelos"]},
      {id:"family",nm:"Familia Desconectada",pr:97,op:197,bd:"MEJOR VALOR",ft:["Todo lo del plan completo","Acceso al app por 3 meses","Comunidad de padres","Sesión en vivo mensual","Actividades por temporada"]},
    ];
    var fqs=[
      {q:"¿Funciona para cualquier edad?",a:"Sí. El plan se adapta a la edad que indicaste (2-12 años). Las actividades y guiones cambian según la edad."},
      {q:"¿Y si mi hijo hace mucho berrinche?",a:"El plan incluye guiones listos. La Sustitución Progresiva reduce gradualmente — NO quita todo de golpe."},
      {q:"¿Necesito mucho tiempo libre?",a:"No. Diseñado para padres que trabajan. La mayoría de actividades toman 10-15 minutos."},
      {q:"¿Y si mi pareja no colabora?",a:"Incluye la guía Cómo alinear a la familia para hablar con parejas, abuelos y cuidadores."},
    ];
    return <div ref={rf} style={SH}><style>{GCSS}</style>
      <div style={{animation:"fi .5s ease both"}}>
        <div style={{background:"linear-gradient(90deg,var(--dn),#FF6B35)",color:"#fff",padding:"12px 16px",textAlign:"center",fontSize:14,fontWeight:800}}>{"🔥 OFERTA ESPECIAL — Expira en "+fmt(cd)}</div>
        <div style={{padding:"28px 20px 40px"}}>
          <h2 style={{fontSize:22,fontWeight:900,textAlign:"center",marginBottom:6,lineHeight:1.3}}>{"Elige tu plan"+(pn?", "+pn:"")}</h2>
          <p style={{fontSize:14,color:"var(--tm)",textAlign:"center",marginBottom:28}}>Acceso inmediato al Plan de 21 Días + bonos exclusivos</p>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:32}}>
            {pls.map(function(pl){var is2=sp===pl.id;return <button key={pl.id} onClick={function(){setSp(pl.id)}} style={{width:"100%",textAlign:"left",cursor:"pointer",background:is2?"var(--pl)":"var(--sf)",border:is2?"2px solid var(--pr)":"2px solid var(--bd)",borderRadius:"var(--rd)",padding:"20px 18px",position:"relative",fontFamily:"var(--ft)",transform:is2?"scale(1.02)":"none",transition:"all .2s",boxShadow:is2?"0 4px 20px rgba(232,83,46,.15)":"none"}}>
              {pl.bd?<div style={{position:"absolute",top:-10,right:16,background:"var(--pr)",color:"#fff",fontSize:10,fontWeight:800,padding:"4px 12px",borderRadius:20,letterSpacing:"0.05em"}}>{pl.bd}</div>:null}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:16,fontWeight:800}}>{pl.nm}</div>
                <div style={{textAlign:"right"}}>
                  {pl.op>0?<span style={{fontSize:13,color:"var(--tl)",textDecoration:"line-through",marginRight:6}}>{"$"+pl.op}</span>:null}
                  <span style={{fontSize:26,fontWeight:900,color:"var(--pr)"}}>{"$"+pl.pr}</span>
                  <span style={{fontSize:12,color:"var(--tl)"}}> USD</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {pl.ft.map(function(f,i){return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  <span style={{color:"var(--sc)",fontWeight:800,fontSize:14,marginTop:1}}>✓</span>
                  <span style={{fontSize:13,color:"var(--tm)"}}>{f}</span>
                </div>})}
              </div>
            </button>})}
          </div>
          <Btn onClick={function(){alert("Checkout — integra tu pasarela de pago aquí")}}>{sp==="basic"?"EMPEZAR POR $27 →":sp==="complete"?"QUIERO LA TRANSFORMACIÓN COMPLETA →":"QUIERO EL PLAN FAMILIAR →"}</Btn>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:16,fontSize:12,color:"var(--tl)"}}>
            <span>💳 Tarjeta</span><span>📲 PayPal</span><span>🍎 Apple Pay</span>
          </div>
          <div style={{marginTop:28,background:"var(--sl)",border:"1px solid #B8DFC9",borderRadius:"var(--rd)",padding:20,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:8}}>🛡️</div>
            <div style={{fontSize:16,fontWeight:800,marginBottom:6,color:"var(--sc)"}}>Garantía incondicional de 7 días</div>
            <p style={{fontSize:13,color:"var(--tm)",lineHeight:1.6}}>Si en 7 días no sientes que vas por el camino correcto, te devolvemos el 100%. Sin preguntas. <strong>El riesgo es completamente nuestro.</strong></p>
          </div>
          <h3 style={{fontSize:18,fontWeight:900,textAlign:"center",marginTop:32,marginBottom:16}}>Lo que dicen otras familias:</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
            {REVIEWS_PRICING.map(function(rv){return <RCard key={rv.id} person={rv} text={rv.text} big/>})}
          </div>
          <h3 style={{fontSize:18,fontWeight:900,textAlign:"center",marginBottom:16}}>Preguntas frecuentes</h3>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32}}>
            {fqs.map(function(f,i){return <div key={i} style={{background:"var(--sf)",border:"1px solid var(--bd)",borderRadius:"var(--rd)",overflow:"hidden"}}>
              <button onClick={function(){setEfq(efq===i?null:i)}} style={{width:"100%",padding:"14px 16px",background:"none",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontFamily:"var(--ft)",textAlign:"left"}}>
                <span style={{fontSize:14,fontWeight:700}}>{f.q}</span>
                <span style={{fontSize:18,color:"var(--tl)",transform:efq===i?"rotate(45deg)":"none",transition:"transform .2s"}}>+</span>
              </button>
              {efq===i?<div style={{padding:"0 16px 14px",fontSize:13,color:"var(--tm)",lineHeight:1.6}}>{f.a}</div>:null}
            </div>})}
          </div>
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:15,fontWeight:800,marginBottom:12}}>Cada día sin plan es un día más de pantalla.</p>
            <Btn onClick={function(){alert("Checkout — integra tu pasarela de pago aquí")}}>EMPEZAR AHORA →</Btn>
            <p style={{fontSize:11,color:"var(--tl)",marginTop:12}}>Pago único. Sin suscripciones. Acceso de por vida.</p>
          </div>
        </div>
      </div>
    </div>;
  }

  return null;
}
