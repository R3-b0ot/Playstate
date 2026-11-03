import { useMemo, useState } from "react";
import { Activity, Archive, ArrowDownRight, ArrowRight, Bell, BookOpen, ChevronDown, CircleHelp, Clock3, Command, FilePlus2, FolderOpen, Gamepad2, Gauge, LayoutDashboard, Plus, Search, Settings2, Sparkles, Trophy, Upload, Users, WifiOff } from "lucide-react";
import { Button, Card, Status } from "@playstate/ui";

type Page = "Overview" | "Quiz library" | "Results & history" | "Settings";
type Quiz = { id: number; title: string; category: string; questions: number; updated: string; status: "Ready" | "Draft" };

const initialQuizzes: Quiz[] = [
  { id: 1, title: "General Knowledge Challenge", category: "General knowledge", questions: 15, updated: "Today", status: "Ready" },
  { id: 2, title: "The Innovation Quiz", category: "Business & technology", questions: 12, updated: "Yesterday", status: "Ready" },
  { id: 3, title: "World Around Us", category: "Geography", questions: 20, updated: "2 days ago", status: "Draft" },
];

const nav: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Quiz library", icon: BookOpen },
  { label: "Results & history", icon: Trophy },
  { label: "Settings", icon: Settings2 },
];

export default function App() {
  const [page, setPage] = useState<Page>("Overview");
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => quizzes.filter(q => (q.title + q.category).toLowerCase().includes(query.toLowerCase())), [quizzes, query]);

  function createQuiz() {
    const title = newTitle.trim();
    if (!title) return;
    setQuizzes(current => [{ id: Date.now(), title, category: "Uncategorised", questions: 0, updated: "Just now", status: "Draft" }, ...current]);
    setNewTitle(""); setShowCreate(false); setPage("Quiz library"); setNotice(`“${title}” created as a draft.`);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => setPage("Overview")} aria-label="Playstate home">
        <img src="/Playstate/assets/brand/playstate-mark-neon.svg" alt="" />
        <span>PLAY<span>STATE</span></span>
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
      <header className="topbar"><div className="breadcrumb"><span>PLAYSTATE</span><ArrowRight size={13}/><strong>{page}</strong></div><div className="top-actions"><Status tone="good">All changes saved</Status><button className="icon-btn" aria-label="Notifications"><Bell size={17}/></button><div className="top-avatar">R</div></div></header>
      <div className="page-content">
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
        {page === "Overview" && <Overview quizzes={quizzes} onCreate={() => setShowCreate(true)} onBrowse={() => setPage("Quiz library")} onOpen={() => setPage("Quiz library")}/>}
        {page === "Quiz library" && <section><PageHeading eyebrow="YOUR CONTENT" title="Quiz library" subtitle="Build your next great quiz. Your content stays on this device." action={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={17}/> Create quiz</Button>}/><div className="library-toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search quizzes..." aria-label="Search quizzes"/></label><span className="muted-text">{filtered.length} quizzes</span></div><div className="quiz-list">{filtered.map(q=><QuizRow key={q.id} quiz={q} onClick={()=>setNotice(`“${q.title}” is ready to open in the quiz editor. Editor is the next build milestone.`)}/>)}</div>{filtered.length===0&&<EmptyState title="No quizzes found" detail="Try another search or create a new quiz." onCreate={()=>setShowCreate(true)}/>}</section>}
        {page === "Results & history" && <section><PageHeading eyebrow="SESSION RECORDS" title="Results & history" subtitle="Your completed quiz sessions will be collected here."/><EmptyState title="No sessions yet" detail="Once you host a quiz, its session summary will appear here." onCreate={()=>setPage("Quiz library")}/></section>}
        {page === "Settings" && <section><PageHeading eyebrow="PREFERENCES" title="Settings" subtitle="Manage your local Playstate experience."/><Card className="settings-card"><div><strong>Appearance</strong><p>Playstate dark cinematic theme</p></div><Status tone="good">Active</Status><div className="settings-divider"/><div><strong>Storage</strong><p>Local-first workspace · No account connected</p></div><Status>On this device</Status><div className="settings-divider"/><div><strong>Application</strong><p>Playstate Preview · Version 0.1.0</p></div><Status tone="live">Preview</Status></Card></section>}
      </div>
      <footer className="app-footer"><span>PLAYSTATE <i>•</i> KNOWLEDGE. COMPETITION. GAME ON.</span><span>PREVIEW BUILD 0.1.0</span></footer>
    </main>

    {showCreate && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCreate(false)}}><form className="create-modal" onSubmit={e=>{e.preventDefault();createQuiz()}}><div className="modal-top"><span className="modal-icon"><FilePlus2 size={20}/></span><button type="button" className="icon-btn" onClick={()=>setShowCreate(false)} aria-label="Close">×</button></div><span className="eyebrow">NEW PROJECT</span><h2>Create a quiz</h2><p>Give your quiz a name. You can add questions in the editor next.</p><label className="field-label" htmlFor="quiz-title">Quiz name</label><input id="quiz-title" className="ps-field" autoFocus maxLength={80} value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. The Big Knowledge Challenge"/><div className="modal-actions"><Button type="button" variant="quiet" onClick={()=>setShowCreate(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={!newTitle.trim()}>Create quiz <ArrowRight size={16}/></Button></div></form></div>}
  </div>;
}

function PageHeading({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle:string;action?:React.ReactNode}) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }

function Overview({quizzes,onCreate,onBrowse,onOpen}:{quizzes:Quiz[];onCreate:()=>void;onBrowse:()=>void;onOpen:()=>void}) {
 return <section>
  <div className="hero-panel"><div className="hero-grid"/><div className="hero-copy"><div className="eyebrow"><Sparkles size={13}/> YOUR NEXT GAME STARTS HERE</div><h1>Make every<br/><span>question count.</span></h1><p>Create a quiz, bring everyone together, and put knowledge in the spotlight.</p><div className="hero-actions"><Button variant="primary" onClick={onCreate}><Plus size={17}/> Create a quiz</Button><Button variant="secondary" onClick={onBrowse}><FolderOpen size={17}/> Browse library</Button></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-mark"><img src="/Playstate/assets/brand/playstate-mark-neon.svg" alt=""/></div><div className="hero-number">01<span> / PLAY</span></div><div className="hero-side-label">KNOWLEDGE IS YOUR ADVANTAGE</div></div><div className="hero-index">PLAYSTATE <span>— 001</span></div></div>
  <div className="section-title"><div><span className="eyebrow">AT A GLANCE</span><h2>Your workspace</h2></div><span className="muted-text">Stored locally on this device</span></div>
  <div className="stats-grid"><Stat icon={BookOpen} label="Total quizzes" value={String(quizzes.length).padStart(2,"0")} detail="In your library" accent="cyan"/><Stat icon={Activity} label="Ready to play" value={String(quizzes.filter(q=>q.status==="Ready").length).padStart(2,"0")} detail="Validated quizzes" accent="lime"/><Stat icon={Clock3} label="Sessions hosted" value="00" detail="No sessions recorded" accent="pink"/></div>
  <div className="lower-grid"><Card className="recent-card"><div className="card-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h3>Recent quizzes</h3></div><Button variant="quiet" onClick={onBrowse}>View library <ArrowRight size={15}/></Button></div><div className="recent-list">{quizzes.slice(0,3).map(q=><QuizRow key={q.id} quiz={q} onClick={onOpen}/>)}</div></Card><Card className="quick-card"><div className="quick-orb"><Command size={22}/></div><span className="eyebrow">READY WHEN YOU ARE</span><h3>Bring the room<br/>to life.</h3><p>Your quiz. Your audience. Your moment. Start by building a question set.</p><Button variant="secondary" onClick={onCreate}>Build your first quiz <ArrowDownRight size={16}/></Button><div className="quick-lines"/></Card></div>
 </section>;
}
function Stat({icon:Icon,label,value,detail,accent}:{icon:typeof BookOpen;label:string;value:string;detail:string;accent:string}) {return <Card className={`stat-card stat-${accent}`}><div className="stat-top"><span>{label}</span><Icon size={17}/></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div><div className="stat-track"><span/></div></Card>}
function QuizRow({quiz,onClick}:{quiz:Quiz;onClick:()=>void}) {return <button className="quiz-row" onClick={onClick}><span className="quiz-symbol"><BookOpen size={17}/></span><span className="quiz-info"><strong>{quiz.title}</strong><small>{quiz.category} <i>·</i> {quiz.questions} questions</small></span><span className={`quiz-status ${quiz.status==="Ready"?"ready":""}`}>{quiz.status}</span><span className="quiz-date">{quiz.updated}</span><ArrowRight className="row-arrow" size={16}/></button>}
function EmptyState({title,detail,onCreate}:{title:string;detail:string;onCreate:()=>void}) {return <Card className="empty-state"><div className="empty-icon"><Archive size={22}/></div><h3>{title}</h3><p>{detail}</p><Button variant="secondary" onClick={onCreate}>Go to quizzes <ArrowRight size={15}/></Button></Card>}
