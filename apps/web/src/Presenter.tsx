import { useEffect, useMemo, useRef, useState } from "react";
import { AnswerOption, Button, Card, Status } from "@playstate/ui";
import { ArrowLeft, Clock3, Eye, EyeOff, Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { createSession, endSession, expireTimer, lockAnswer, nextQuestion, pauseTimer, resumeTimer, revealAnswer, revealOptions, selectAnswer, startSession, startTimer, type QuizDefinition, type SessionState } from "@playstate/game-core";

export type PresenterSummary = { quizTitle: string; totalQuestions: number; outcome: SessionState["outcome"]; completedAt: string };

export default function Presenter({ quiz, mode = "solo", onExit, onComplete }: { quiz: QuizDefinition; mode?: "solo" | "duo"; onExit: () => void; onComplete?: (summary: PresenterSummary) => void }) {
  const [session, setSession] = useState<SessionState>(() => startSession(createSession(quiz).state).state);
  const [now, setNow] = useState(Date.now());
  const [audience, setAudience] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [lifelines, setLifelines] = useState({ fifty: false, audience: false, computerji: false });
  const [audienceToken] = useState(() => crypto.randomUUID());
  const [contestantWindow, setContestantWindow] = useState<Window | null>(null);
  const lastTick = useRef(-1);
  const reported = useRef(false);
  const question = session.quiz.questions[session.questionIndex];
  const prizeLadder = [10,20,40,80,100,150,200,300,600,800,1200,1500,2000];
  const timerRunning = session.timer.status === "running";
  const remaining = useMemo(() => session.timer.status === "running" && session.timer.startedAt !== null && session.timer.remainingMs !== null
    ? Math.max(0, session.timer.remainingMs - (now - session.timer.startedAt))
    : session.timer.remainingMs, [session.timer, now]);

  useEffect(() => {
    if (mode !== "duo") return;
    const key = `playstate:live:${audienceToken}`;
    const message = JSON.stringify({ session, quizTitle: quiz.title });
    try { localStorage.setItem(key, message); } catch { /* popup may still use BroadcastChannel */ }
    const channel = new BroadcastChannel(`playstate:${audienceToken}`);
    channel.postMessage({ type: "session", payload: { session, quizTitle: quiz.title } });
    channel.close();
  }, [mode, audienceToken, session, quiz.title]);

  useEffect(() => {
    if (mode !== "duo") return;
    const channel = new BroadcastChannel(`playstate:${audienceToken}`);
    const receive = (event: MessageEvent) => {
      if (event.data?.type !== "answer" || typeof event.data.optionId !== "string") return;
      setSession(current => {
        if (current.phase !== "options-visible") return current;
        try {
          const selected = selectAnswer(current, event.data.optionId, Date.now()).state;
          return lockAnswer(selected, Date.now()).state;
        } catch { return current; }
      });
    };
    channel.addEventListener("message", receive);
    const key = `playstate:answer:${audienceToken}`;
    const storageReceive = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;
      try {
        const message = JSON.parse(event.newValue);
        if (typeof message.optionId === "string") setSession(current => {
          if (current.phase !== "options-visible") return current;
          try {
            const selected = selectAnswer(current, message.optionId, Date.now()).state;
            return lockAnswer(selected, Date.now()).state;
          } catch { return current; }
        });
      } catch { /* ignore malformed cross-window messages */ }
    };
    window.addEventListener("storage", storageReceive);
    return () => { channel.close(); window.removeEventListener("storage", storageReceive); };
  }, [mode, audienceToken]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (session.timer.startedAt !== null && session.timer.remainingMs !== null && tick - session.timer.startedAt >= session.timer.remainingMs) {
        try { setSession(expireTimer(session, tick).state); } catch { /* state may already have advanced */ }
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [timerRunning, session]);

  function run(action: (state: SessionState, at: number) => { state: SessionState }) {
    try { const at = Date.now(); setSession(action(session, at).state); setNow(at); }
    catch (error) { window.alert(error instanceof Error ? error.message : "That action is not available."); }
  }
  useEffect(() => {
    if (session.status === "completed" && !reported.current) {
      reported.current = true;
      onComplete?.({ quizTitle: quiz.title, totalQuestions: quiz.questions.length, outcome: session.outcome, completedAt: new Date().toISOString() });
    }
  }, [session.status, session.outcome, quiz, onComplete]);

  function contestantUrl() { const url = new URL(window.location.href); url.searchParams.set("audience", audienceToken); return url.toString(); }
  function begin() { setShowIntro(false); if (mode === "duo") { const popup = window.open(contestantUrl(), "playstate-contestant", "popup,width=1100,height=780"); if (popup) setContestantWindow(popup); } }
  function shareQuestion() {
    const at = Date.now();
    try {
      const visible = revealOptions(session, at).state;
      setSession(visible.timer.durationMs === null ? visible : startTimer(visible, at).state);
      setNow(at);
      playTone(760, 0.2);
    } catch (error) { window.alert(error instanceof Error ? error.message : "Unable to share this question."); }
  }
  function playTone(frequency=620, duration=0.08) { if (!soundOn) return; try { const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext; const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = "sine"; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(0.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.01); gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration); oscillator.onended = () => context.close(); } catch { /* audio is optional */ } }
  function useFiftyFifty() { if (lifelines.fifty || session.phase !== "options-visible") return; const wrong = question.options.filter(o => o.id !== question.correctOptionId); setHiddenOptions(wrong.slice(0,2).map(o=>o.id)); setLifelines(v=>({...v,fifty:true})); playTone(880,0.18); }
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined);
    else document.exitFullscreen?.().catch(() => undefined);
  }
  const finished = session.status === "completed";
  const correct = session.phase === "answer-revealed" && session.outcome === "in-progress";
  const seconds = remaining === null ? null : Math.ceil(remaining / 1000);
  useEffect(() => { if (seconds !== null && seconds !== lastTick.current) { lastTick.current = seconds; if (seconds <= 10 && seconds >= 0) playTone(seconds <= 3 ? 880 : 520, 0.045); } }, [seconds]);
  return <div className={`presenter-shell ${audience ? "presenter-audience" : ""}`}>
    <header className="presenter-toolbar">
      <button className="presenter-back" onClick={onExit}><ArrowLeft size={16}/> Exit session</button>
      <div className="presenter-brand">PLAYSTATE <span>{mode === "duo" ? "COMPUTERJI DESK" : "SOLO CHALLENGE"}</span></div>
      <div className="presenter-toolbar-actions"><Button variant="secondary" onClick={()=>setSoundOn(v=>!v)}>{soundOn ? "Sound on" : "Sound off"}</Button>{mode === "duo" && <Button variant="secondary" onClick={()=>{const w=window.open(contestantUrl(),"playstate-contestant","popup,width=1100,height=780");if(w)setContestantWindow(w);}}>{contestantWindow && !contestantWindow.closed ? "Reopen contestant" : "Open contestant"}</Button>}<Button variant="secondary" onClick={toggleFullscreen}><Maximize2 size={15}/> Fullscreen</Button></div>
    </header>
    {showIntro ? <main className="presenter-stage presenter-intro"><span className="eyebrow">READY TO HOST</span><h1>{quiz.title}</h1><p>{quiz.questions.length} questions · Timer policy: 60 sec (1–4), 120 sec (5–9), untimed (10+)</p><Button variant="primary" onClick={begin}><Play size={16}/> Start show</Button></main> :
    <main className="presenter-stage">
      <div className="presenter-meta"><Status tone="live">QUESTION {session.questionIndex+1} / {quiz.questions.length}</Status><Status>{session.phase.replaceAll("-", " ")}</Status><Status tone="warning">₹{prizeLadder[session.questionIndex]?.toLocaleString("en-IN") ?? "—"} TIER</Status>{seconds !== null && <div className={`presenter-clock ${seconds <= 10 ? "urgent" : ""}`}><Clock3 size={17}/>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</div>}{seconds === null && session.timer.status === "disabled" && <Status tone="warning">UNTIMED QUESTION</Status>}</div>
      <div className="game-layout"><aside className="prize-ladder"><div className="eyebrow">PRIZE LADDER</div>{prizeLadder.map((amount,index)=><div key={amount} className={`prize-step ${index===session.questionIndex?"current":index<session.questionIndex?"passed":""}`}><span>{index+1}</span><strong>₹{amount.toLocaleString("en-IN")}</strong></div>)}</aside><section className="presenter-main"><section className="presenter-question"><span className="eyebrow">THE QUESTION</span><h1>{audience && session.phase === "hidden" ? "Get ready…" : question.prompt}</h1></section>
      {session.phase !== "hidden" && <div className="presenter-options">{question.options.filter(option=>!hiddenOptions.includes(option.id)).map(option=><AnswerOption key={option.id} letter={option.label} text={option.text} selected={!audience && session.selectedOptionId===option.id} correct={session.phase==="answer-revealed" && session.revealedCorrectOptionId===option.id} disabled={session.phase!=="options-visible" || audience || mode==="duo"} onClick={()=>run((state,at)=>selectAnswer(state,option.id,at))}/>)}</div>}
      {session.phase === "answer-revealed" && <Card className="presenter-feedback"><Status tone={correct ? "good" : "danger"}>{correct ? "CORRECT ANSWER" : session.outcome === "timed-out" ? "TIME IS UP" : "INCORRECT ANSWER"}</Status><h2>{question.options.find(option=>option.id===question.correctOptionId)?.text}</h2>{question.explanation && <p>{question.explanation}</p>}</Card>}
      {!audience && <Card className="presenter-controls"><div className="presenter-control-label"><span className="eyebrow">HOST CONTROLS</span><strong>{finished ? "Session complete" : "Manage the show"}</strong></div><div className="presenter-control-actions">
        {session.phase==="hidden" && <Button variant="primary" onClick={()=>mode==="duo" ? shareQuestion() : run((state,at)=>revealOptions(state,at))}>{mode==="duo" ? "Share Question & Start Timer" : "Reveal question & options"}</Button>}
        {mode==="solo" && session.phase==="options-visible" && ["idle","paused"].includes(session.timer.status) && session.timer.durationMs !== null && <Button variant="primary" onClick={()=>run((state,at)=>session.timer.status==="paused" ? resumeTimer(state,at) : startTimer(state,at))}><Play size={15}/> {session.timer.status==="paused" ? "Resume countdown" : "Start countdown"}</Button>}
        {session.phase==="options-visible" && timerRunning && <Button variant="secondary" onClick={()=>run((state,at)=>pauseTimer(state,at))}><Pause size={15}/> Pause timer</Button>}
        {session.phase==="options-visible" && mode==="solo" && <><Button variant="secondary" disabled={lifelines.fifty} onClick={useFiftyFifty}>50:50 {lifelines.fifty ? "USED" : ""}</Button><Button variant="secondary" disabled={lifelines.audience} onClick={()=>{setLifelines(v=>({...v,audience:true}));playTone(740,0.14);window.alert("Audience Poll is reserved for a connected audience in a future release.");}}>Audience poll</Button><Button variant="secondary" disabled={lifelines.computerji} onClick={()=>{setLifelines(v=>({...v,computerji:true}));playTone(660,0.14);window.alert("Computerji hint is not available for this question yet.");}}>Ask Computerji</Button><Button variant="secondary" onClick={()=>run((state,at)=>{const paused=state.timer.status==="running" ? pauseTimer(state,at).state : state;return lockAnswer(paused,at);})}>Lock answer</Button></>}
        {session.phase==="answer-locked" && <Button variant="primary" onClick={()=>run((state,at)=>revealAnswer(state,at))}>Reveal correct answer</Button>}
        {correct && <Button variant="primary" onClick={()=>run((state,at)=>nextQuestion(state,at))}>Next question <Play size={15}/></Button>}
        {finished && <Button variant="secondary" onClick={onExit}><ArrowLeft size={15}/> Back to library</Button>}
        {!finished && <Button variant="quiet" onClick={()=>{if(window.confirm("End this quiz session?"))run((state,at)=>endSession(state,at));}}><RotateCcw size={15}/> End session</Button>}
      </div></Card>}
      {audience && <div className="audience-caption">KNOWLEDGE. COMPETITION. GAME ON.</div>}
      </section></div>\n      {finished && <div className="presenter-finished"><span className="eyebrow">SESSION ENDED</span><h2>{session.outcome === "won" ? "Quiz completed!" : session.outcome === "timed-out" ? "Time ran out." : session.outcome === "lost" ? "That’s the end of the run." : "Session ended by host."}</h2><p>{session.outcome === "won" ? "Every question answered correctly." : "The session has been closed."}</p></div>}
    </main>}
    <footer className="presenter-footer"><span>PLAYSTATE <i>•</i> KNOWLEDGE. COMPETITION. GAME ON.</span><span>LOCAL SESSION · NO CLOUD REQUIRED</span></footer>
  </div>;
}
