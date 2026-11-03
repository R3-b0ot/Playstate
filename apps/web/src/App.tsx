import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import playstateWordmark from "../../../assets/brand/playstate-wordmark-neon.svg";
import playstateMark from "../../../assets/brand/playstate-mark-neon.svg";
import { Activity, Archive, ArrowDownRight, ArrowRight, Bell, BookOpen, ChevronDown, CircleHelp, Clock3, Command, FilePlus2, FolderOpen, Gamepad2, Gauge, LayoutDashboard, Plus, Search, Settings2, Sparkles, Trophy, Upload, Users, WifiOff } from "lucide-react";
import { Button, Card, Status, Toast } from "@playstate/ui";
import QuizEditor from "./QuizEditor";
import Presenter, { type PresenterSummary } from "./Presenter";
import { DEMO_QUIZ } from "./demoQuiz";
import { parseQuizFile, validateQuiz, type QuizDefinition } from "@playstate/game-core";

type Page = "Overview" | "Quiz library" | "Results & history" | "Settings" | "Quiz editor";
type Quiz = { id: string; title: string; category: string; questions: number; updated: string; status: "Ready" | "Draft" };
const LIBRARY_KEY = "playstate:quiz-library:v1";
const HISTORY_KEY = "playstate:session-history:v1";
function readHistory(): PresenterSummary[] { try { const value = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); return Array.isArray(value) ? value.filter(item => item && typeof item.quizTitle === "string" && typeof item.completedAt === "string") : []; } catch { return []; } }
function readLibrary(): QuizDefinition[] { try { const value = JSON.parse(localStorage.getItem(LIBRARY_KEY) ?? "[]"); return Array.isArray(value) ? value.filter(item => item && typeof item.id === "string" && typeof item.title === "string" && Array.isArray(item.questions)) : []; } catch { return []; } }
function newId(): string { return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `quiz-${Date.now()}`; }

const nav: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Quiz library", icon: BookOpen },
  { label: "Results & history", icon: Trophy },
  { label: "Settings", icon: Settings2 },
];

export default function App() {
  const [page, setPage] = useState<Page>("Overview");
  const [quizFiles, setQuizFiles] = useState<QuizDefinition[]>(() => localStorage.getItem(LIBRARY_KEY) === null ? [DEMO_QUIZ] : readLibrary());
  const [history, setHistory] = useState<PresenterSummary[]>(readHistory);
  const quizzes: Quiz[] = useMemo(() => quizFiles.map(q => ({ id:q.id, title:q.title, category:"Uncategorised", questions:q.questions.length, updated:"Stored locally", status:q.questions.length && q.questions.every(item => item.prompt.trim() && item.options.every(option => option.text.trim())) ? "Ready" : "Draft" })), [quizFiles]);
  useEffect(() => { try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(quizFiles)); } catch { setNotice("Local library storage is full or unavailable. Export your quiz files to keep a separate copy."); } }, [quizFiles]);
  useEffect(() => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { setNotice("Session history could not be saved in this browser."); } }, [history]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [activeQuiz, setActiveQuiz] = useState("Untitled quiz");
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [hostQuiz, setHostQuiz] = useState<QuizDefinition | null>(null);
  const [launchQuiz, setLaunchQuiz] = useState<QuizDefinition | null>(null);
  const [launchMode, setLaunchMode] = useState<"solo" | "duo">("solo");
  const [splash, setSplash] = useState(true);
  const audienceToken = new URLSearchParams(window.location.search).get("audience");
  useEffect(() => { const id = window.setTimeout(() => setSplash(false), 5000); return () => window.clearTimeout(id); }, []);
  const updateQuiz = useCallback((updated: QuizDefinition) => setQuizFiles(current => current.map(item => item.id === updated.id ? updated : item)), []);
  const recordSession = useCallback((summary: PresenterSummary) => setHistory(current => [summary, ...current]), []);
  const [importedQuiz, setImportedQuiz] = useState<QuizDefinition | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => quizzes.filter(q => (q.title + q.category).toLowerCase().includes(query.toLowerCase())), [quizzes, query]);

  function createQuiz() {
    const title = newTitle.trim();
    if (!title) return;
    const draft: QuizDefinition = { id: newId(), title, questions: [] };
    setQuizFiles(current => [draft, ...current]);
    setNewTitle("");
    setShowCreate(false);
    setActiveQuiz(title);
    setActiveQuizId(draft.id);
    setImportedQuiz(draft);
    setPage("Quiz editor");
    setNotice(`“${title}” created in your local quiz library.`);
  }

  function importQuizFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".playstate")) { setNotice("Choose a Playstate .playstate quiz file."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseQuizFile(String(reader.result ?? ""));
        setQuizFiles(current => [imported, ...current.filter(item => item.id !== imported.id)]); setImportedQuiz(imported); setActiveQuiz(imported.title); setActiveQuizId(imported.id); setPage("Quiz editor");
        setNotice(`“${imported.title}” imported as an independent copy. The original file is unchanged.`);
      } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to import this quiz file."); }
      if (importInput.current) importInput.current.value = "";
    };
    reader.onerror = () => setNotice("The selected quiz file could not be read.");
    reader.readAsText(file);
  }

  if (audienceToken) return <ContestantWindow token={audienceToken}/>;
  if (hostQuiz) return <Presenter quiz={hostQuiz} mode={launchMode} onExit={() => setHostQuiz(null)} onComplete={recordSession}/>;

  return <><div className="app-shell">
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => setPage("Overview")} aria-label="Playstate home">
        <img src={playstateWordmark} alt="Playstate — home" />
      </button>
      <div className="workspace-switch"><div className="workspace-avatar">P</div><div><strong>My workspace</strong><small>Local library</small></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{nav.map(({label,icon:Icon}) => <button key={label} className={`nav-item ${page===label?"active":""}`} onClick={() => setPage(label)}><Icon size={18}/><span>{label}</span>{label==="Quiz library" && <small>{quizzes.length}</small>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="offline-card"><span className="offline-icon"><WifiOff size={15}/></span><div><strong>Working offline</strong><small>Your library is on this device</small></div><span className="online-dot"/></div>
        <div className="profile-row"><div className="profile-avatar">R</div><div><strong>Local host</strong><small>Personal workspace</small></div><Settings2 size={16}/></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>PLAYSTATE</span><ArrowRight size={13}/><strong>{page}</strong></div><div className="top-actions"><Button variant="secondary" onClick={()=>importInput.current?.click()}><Upload size={15}/> Import quiz</Button><input ref={importInput} type="file" accept=".playstate,application/json" hidden onChange={event=>importQuizFile(event.target.files?.[0])}/><button className="icon-btn" aria-label="Notifications"><Bell size={17}/></button><div className="top-avatar">R</div></div></header>
      <div className="page-content">
        {notice && <Toast message={notice} onDismiss={() => setNotice("")}/>}
        {page === "Overview" && <Overview quizzes={quizzes} onCreate={() => setShowCreate(true)} onBrowse={() => setPage("Quiz library")} onOpen={() => setPage("Quiz library")}/>}
        {page === "Quiz library" && <section><PageHeading eyebrow="YOUR CONTENT" title="Quiz library" subtitle="Build your next great quiz. Your content stays on this device." action={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={17}/> Create quiz</Button>}/><div className="library-toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search quizzes..." aria-label="Search quizzes"/></label><span className="muted-text">{filtered.length} quizzes</span></div><div className="quiz-list">{filtered.map(q=><QuizRow key={q.id} quiz={q} onClick={()=>{const found=quizFiles.find(item=>item.id===q.id);if(found){setImportedQuiz(found);setActiveQuiz(found.title);setActiveQuizId(found.id);setPage("Quiz editor");}}} onHost={()=>{const found=quizFiles.find(item=>item.id===q.id);if(found){const validation=validateQuiz(found);if(validation.length){setNotice(validation[0]);return;}setLaunchQuiz(found);}}} onDelete={()=>{if(window.confirm(`Delete “${q.title}” from this browser library? Downloaded .playstate files will not be affected.`)){setQuizFiles(current=>current.filter(item=>item.id!==q.id));}}}/>)}</div>{filtered.length===0&&<EmptyState title="No quizzes found" detail="Try another search or create a new quiz." onCreate={()=>setShowCreate(true)}/>}</section>}
        {page === "Results & history" && <section><PageHeading eyebrow="SESSION RECORDS" title="Results & history" subtitle="Completed quiz sessions saved in this browser."/><div className="session-history-list">{history.length ? history.map((item,index)=><Card className="session-history-row" key={`${item.completedAt}-${index}`}><div><strong>{item.quizTitle}</strong><small>{new Date(item.completedAt).toLocaleString()} · {item.totalQuestions} questions</small></div><Status tone={item.outcome==="won"?"good":item.outcome==="in-progress"?"live":"warning"}>{item.outcome.replaceAll("-"," ")}</Status></Card>) : <EmptyState title="No sessions yet" detail="Host a quiz to see its result summary here." onCreate={()=>setPage("Quiz library")}/>}</div></section>}
        {page === "Quiz editor" && <QuizEditor key={activeQuizId ?? activeQuiz} title={activeQuiz} initialQuiz={quizFiles.find(item=>item.id===activeQuizId) ?? importedQuiz} onQuizChange={updateQuiz} onBack={() => setPage("Quiz library")} onNotice={setNotice}/>}
        {page === "Settings" && <section><PageHeading eyebrow="PREFERENCES" title="Settings" subtitle="Manage your local Playstate experience."/><Card className="settings-card"><div><strong>Appearance</strong><p>Playstate dark cinematic theme</p></div><Status tone="good">Active</Status><div className="settings-divider"/><div><strong>Storage</strong><p>Local-first workspace · No account connected</p></div><Status>On this device</Status><div className="settings-divider"/><div><strong>Application</strong><p>Playstate Preview · Version 0.1.0</p></div><Status tone="live">Preview</Status></Card></section>}
      </div>
      <footer className="app-footer"><span>PLAYSTATE <i>•</i> KNOWLEDGE. COMPETITION. GAME ON.</span><span>PREVIEW BUILD 0.1.0</span></footer>
    </main>

    {launchQuiz && <div className="modal-backdrop role-backdrop"><div className="create-modal role-modal"><div className="eyebrow">CHOOSE YOUR GAME MODE</div><h2>Who is playing today?</h2><p>Choose how this challenge will be hosted.</p><button className="role-choice" onClick={() => {setLaunchMode("solo");setHostQuiz(launchQuiz);setLaunchQuiz(null);}}><strong>Play solo</strong><span>You are the contestant. Playstate takes the Computerji role.</span></button><button className="role-choice" onClick={() => {setLaunchMode("duo");setHostQuiz(launchQuiz);setLaunchQuiz(null);}}><strong>Play with another contestant</strong><span>You become Computerji. A separate contestant window will open.</span></button><div className="modal-actions"><Button variant="quiet" onClick={()=>setLaunchQuiz(null)}>Cancel</Button></div></div></div>}
    {showCreate && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCreate(false)}}><form className="create-modal" onSubmit={e=>{e.preventDefault();createQuiz()}}><div className="modal-top"><span className="modal-icon"><FilePlus2 size={20}/></span><button type="button" className="icon-btn" onClick={()=>setShowCreate(false)} aria-label="Close">×</button></div><span className="eyebrow">NEW PROJECT</span><h2>Create a quiz</h2><p>Give your quiz a name. You can add questions in the editor next.</p><label className="field-label" htmlFor="quiz-title">Quiz name</label><input id="quiz-title" className="ps-field" autoFocus maxLength={80} value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. The Big Knowledge Challenge"/><div className="modal-actions"><Button type="button" variant="quiet" onClick={()=>setShowCreate(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={!newTitle.trim()}>Create quiz <ArrowRight size={16}/></Button></div></form></div>}
  </div>{splash && <div className="playstate-splash"><div className="splash-scanlines"/><div className="splash-logo"><img src={playstateMark} alt="Playstate"/></div><div className="splash-word">PLAYSTATE</div><div className="splash-tag">KNOWLEDGE. COMPETITION. GAME ON.</div><div className="splash-loader"><span/></div><div className="splash-signal">INITIALISING GAME SYSTEM</div></div>}</>;
}

function ContestantWindow({token}:{token:string}) {
 const [payload,setPayload] = useState<any>(()=>{try{return JSON.parse(localStorage.getItem(`playstate:live:${token}`)??"null")}catch{return null}});
 const [now,setNow] = useState(Date.now());
 useEffect(()=>{
   const key=`playstate:live:${token}`;
   const apply=(value:string|null)=>{if(!value)return;try{setPayload(JSON.parse(value))}catch{/* ignore malformed host state */}};
   apply(localStorage.getItem(key));
   const channel=new BroadcastChannel(`playstate:${token}`);
   const receive=(event:MessageEvent)=>{if(event.data?.type==="session")setPayload(event.data.payload)};
   channel.addEventListener("message",receive);
   const update=(event:StorageEvent)=>{if(event.key===key)apply(event.newValue)};
   window.addEventListener("storage",update);
   const poll=window.setInterval(()=>apply(localStorage.getItem(key)),500);
   const clock=window.setInterval(()=>setNow(Date.now()),200);
   return()=>{channel.close();window.removeEventListener("storage",update);window.clearInterval(poll);window.clearInterval(clock)};
 },[token]);
 function choose(optionId:string){
   if(!payload?.session || payload.session.phase!=="options-visible" || payload.session.selectedOptionId) return;
   const message={optionId,at:Date.now()};
   setPayload((current:any)=>current?.session ? {...current,session:{...current.session,selectedOptionId:optionId,phase:"answer-locked",timer:{...current.session.timer,status:current.session.timer.status==="disabled"?"disabled":"paused",remainingMs:current.session.timer.startedAt!==null&&current.session.timer.remainingMs!==null?Math.max(0,current.session.timer.remainingMs-(message.at-current.session.timer.startedAt)):current.session.timer.remainingMs,startedAt:null}}} : current);
   try{localStorage.setItem(`playstate:answer:${token}`,JSON.stringify(message))}catch{/* channel remains available */}
   const channel=new BroadcastChannel(`playstate:${token}`);
   channel.postMessage({type:"answer",...message});
   channel.close();
 }
 if(!payload?.session) return <div className="contestant-window"><header><img src={playstateMark} alt=""/><span>PLAYSTATE · CONTESTANT</span></header><div className="contestant-body"><h1>Waiting for Computerji…</h1><p>Keep this window open. The question will appear when the host shares it.</p></div></div>;
 const s=payload.session; const q=s.quiz.questions[s.questionIndex];
 if(!q)return <div className="contestant-window"><h1>Waiting for the next question…</h1></div>;
 const remaining=s.timer.status==="running"&&s.timer.startedAt!==null&&s.timer.remainingMs!==null?Math.max(0,s.timer.remainingMs-(now-s.timer.startedAt)):s.timer.remainingMs;
 const seconds=remaining===null?null:Math.ceil(remaining/1000);
 const locked=s.phase==="answer-locked"||s.phase==="answer-revealed"||s.phase==="answer-locked"||s.timer.status==="expired";
 return <div className="contestant-window"><header><img src={playstateMark} alt=""/> <span>PLAYSTATE · CONTESTANT</span></header><div className="contestant-body">
 <div className="contestant-meta"><div className="eyebrow">QUESTION {s.questionIndex+1} / {s.quiz.questions.length}</div>{seconds!==null&&<div className={`contestant-clock ${seconds<=10?"urgent":""}`}><Clock3 size={18}/>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</div>}{seconds===null&&s.timer.status==="disabled"&&<span className="eyebrow">UNTIMED QUESTION</span>}</div>
 <h1>{s.phase==="hidden"?"Get ready…":q.prompt}</h1>
 {s.phase!=="hidden"&&<div className="contestant-options">{q.options.filter((o:any)=>!(payload.hiddenOptions??[]).includes(o.id)).map((o:any)=><button key={o.id} disabled={s.phase!=="options-visible"||Boolean(s.selectedOptionId)} className={s.selectedOptionId===o.id?"chosen":""} onClick={()=>choose(o.id)}><b>{o.label}</b>{o.text}</button>)}</div>}
 {s.phase==="options-visible"&&<div className="contestant-lifelines"><span className="eyebrow">YOUR LIFELINES</span>{(payload.selectedLifelines??[]).map((id:string)=>{const names:any={fifty:"50:50", "lucky-elimination":"Lucky Elimination","extra-time":"+30 Seconds","clock-freeze":"Clock Freeze","computerji-hint":"Computerji Hint",shuffle:"Option Shuffle","double-chance":"Double Chance",skip:"Skip Question"};return <button key={id} disabled={(payload.usedLifelines??[]).includes(id)||Boolean(s.selectedOptionId)||(id==="computerji-hint"&&!q.explanation)||(id==="skip"&&s.questionIndex>=s.quiz.questions.length-1)} onClick={()=>{const channel=new BroadcastChannel("playstate:"+token);channel.postMessage({type:"lifeline",id});channel.close();}}>{names[id]??id}{(payload.usedLifelines??[]).includes(id)?" · USED":""}</button>;})}</div>}
 {payload.hint&&<div className="contestant-reveal"><strong>COMPUTERJI'S HINT</strong><span>{payload.hint}</span></div>}
 {s.phase==="answer-locked"&&<h2 className="contestant-reveal">Answer locked. Waiting for Computerji to reveal…</h2>}
 {s.phase==="answer-revealed"&&<div className="contestant-reveal"><h2>{s.outcome==="in-progress"||s.outcome==="won"?"Correct answer!":"Answer revealed"}</h2><strong>{q.options.find((o:any)=>o.id===q.correctOptionId)?.text}</strong></div>}
 </div><footer>{locked?"ANSWER LOCKED · COMPUTERJI WILL REVEAL THE RESULT":"SELECT AN ANSWER TO LOCK IT IN"}</footer></div>;
}

function PageHeading({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle:string;action?:ReactNode}) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }

function Overview({quizzes,onCreate,onBrowse,onOpen}:{quizzes:Quiz[];onCreate:()=>void;onBrowse:()=>void;onOpen:()=>void}) {
 return <section>
  <div className="hero-panel"><div className="hero-grid"/><div className="hero-copy"><div className="eyebrow"><Sparkles size={13}/> YOUR NEXT GAME STARTS HERE</div><h1>Make every<br/><span>question count.</span></h1><p>Create a quiz, bring everyone together, and put knowledge in the spotlight.</p><div className="hero-actions"><Button variant="primary" onClick={onCreate}><Plus size={17}/> Create a quiz</Button><Button variant="secondary" onClick={onBrowse}><FolderOpen size={17}/> Browse library</Button></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-mark"><img src={playstateMark} alt=""/></div><div className="hero-number">01<span> / PLAY</span></div><div className="hero-side-label">KNOWLEDGE IS YOUR ADVANTAGE</div></div><div className="hero-index">PLAYSTATE <span>— 001</span></div></div>
  <div className="section-title"><div><span className="eyebrow">AT A GLANCE</span><h2>Your workspace</h2></div><span className="muted-text">Stored locally on this device</span></div>
  <div className="stats-grid"><Stat icon={BookOpen} label="Total quizzes" value={String(quizzes.length).padStart(2,"0")} detail="In your library" accent="cyan"/><Stat icon={Activity} label="Ready to play" value={String(quizzes.filter(q=>q.status==="Ready").length).padStart(2,"0")} detail="Validated quizzes" accent="lime"/><Stat icon={Clock3} label="Sessions hosted" value="00" detail="No sessions recorded" accent="pink"/></div>
  <div className="lower-grid"><Card className="recent-card"><div className="card-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h3>Recent quizzes</h3></div><Button variant="quiet" onClick={onBrowse}>View library <ArrowRight size={15}/></Button></div><div className="recent-list">{quizzes.length ? quizzes.slice(0,3).map(q=><QuizRow key={q.id} quiz={q} onClick={onOpen}/>) : <div className="recent-empty"><strong>No quizzes yet</strong><span>Create your first quiz to see it here.</span></div>}</div></Card><Card className="quick-card"><div className="quick-orb"><Command size={22}/></div><span className="eyebrow">READY WHEN YOU ARE</span><h3>Bring the room<br/>to life.</h3><p>Your quiz. Your audience. Your moment. Start by building a question set.</p><Button variant="secondary" onClick={onCreate}>Build your first quiz <ArrowDownRight size={16}/></Button><div className="quick-lines"/></Card></div>
 </section>;
}
function Stat({icon:Icon,label,value,detail,accent}:{icon:typeof BookOpen;label:string;value:string;detail:string;accent:string}) {return <Card className={`stat-card stat-${accent}`}><div className="stat-top"><span>{label}</span><Icon size={17}/></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div><div className="stat-track"><span/></div></Card>}
function QuizRow({quiz,onClick,onDelete,onHost}:{quiz:Quiz;onClick:()=>void;onDelete?:()=>void;onHost?:()=>void}) {return <div className="quiz-row-wrap"><button className="quiz-row" onClick={onClick}><span className="quiz-symbol"><BookOpen size={17}/></span><span className="quiz-info"><strong>{quiz.title}</strong><small>{quiz.category} <i>·</i> {quiz.questions} questions</small></span><span className={`quiz-status ${quiz.status==="Ready"?"ready":""}`}>{quiz.status}</span><span className="quiz-date">{quiz.updated}</span><ArrowRight className="row-arrow" size={16}/></button>{onHost && <button className="quiz-row-host" onClick={onHost} aria-label={`Host ${quiz.title}`} title="Host quiz">▶</button>}{onDelete && <button className="quiz-row-delete" onClick={onDelete} aria-label={`Delete ${quiz.title}`} title="Remove from local library">×</button>}</div>}
function EmptyState({title,detail,onCreate}:{title:string;detail:string;onCreate:()=>void}) {return <Card className="empty-state"><div className="empty-icon"><Archive size={22}/></div><h3>{title}</h3><p>{detail}</p><Button variant="secondary" onClick={onCreate}>Go to quizzes <ArrowRight size={15}/></Button></Card>}
