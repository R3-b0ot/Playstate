import { useEffect, useMemo, useState } from "react";
import { AnswerOption, Button, Card, Status } from "@playstate/ui";
import { ArrowLeft, Clock3, Eye, EyeOff, Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { createSession, endSession, expireTimer, lockAnswer, nextQuestion, pauseTimer, resumeTimer, revealAnswer, revealOptions, selectAnswer, startSession, startTimer, type QuizDefinition, type SessionState } from "@playstate/game-core";

export default function Presenter({ quiz, onExit }: { quiz: QuizDefinition; onExit: () => void }) {
  const [session, setSession] = useState<SessionState>(() => startSession(createSession(quiz).state).state);
  const [now, setNow] = useState(Date.now());
  const [audience, setAudience] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const question = session.quiz.questions[session.questionIndex];
  const timerRunning = session.timer.status === "running";
  const remaining = useMemo(() => session.timer.status === "running" && session.timer.startedAt !== null && session.timer.remainingMs !== null
    ? Math.max(0, session.timer.remainingMs - (now - session.timer.startedAt))
    : session.timer.remainingMs, [session.timer, now]);

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
  function begin() { setShowIntro(false); }
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined);
    else document.exitFullscreen?.().catch(() => undefined);
  }
  const finished = session.status === "completed";
  const correct = session.phase === "answer-revealed" && session.outcome === "in-progress";
  const seconds = remaining === null ? null : Math.ceil(remaining / 1000);
  return <div className={`presenter-shell ${audience ? "presenter-audience" : ""}`}>
    <header className="presenter-toolbar">
      <button className="presenter-back" onClick={onExit}><ArrowLeft size={16}/> Exit session</button>
      <div className="presenter-brand">PLAYSTATE <span>LIVE SESSION</span></div>
      <div className="presenter-toolbar-actions"><Button variant="secondary" onClick={()=>setAudience(value=>!value)}>{audience ? <Eye size={15}/> : <EyeOff size={15}/>} {audience ? "Host view" : "Audience view"}</Button><Button variant="secondary" onClick={toggleFullscreen}><Maximize2 size={15}/> Fullscreen</Button></div>
    </header>
    {showIntro ? <main className="presenter-stage presenter-intro"><span className="eyebrow">READY TO HOST</span><h1>{quiz.title}</h1><p>{quiz.questions.length} questions · Timer policy: 60 sec (1–4), 120 sec (5–9), untimed (10+)</p><Button variant="primary" onClick={begin}><Play size={16}/> Start show</Button></main> :
    <main className="presenter-stage">
      <div className="presenter-meta"><Status tone="live">QUESTION {session.questionIndex+1} / {quiz.questions.length}</Status><Status>{session.phase.replaceAll("-", " ")}</Status>{seconds !== null && <div className={`presenter-clock ${seconds <= 10 ? "urgent" : ""}`}><Clock3 size={17}/>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</div>}{seconds === null && session.timer.status === "disabled" && <Status tone="warning">UNTIMED QUESTION</Status>}</div>
      <section className="presenter-question"><span className="eyebrow">THE QUESTION</span><h1>{audience && session.phase === "hidden" ? "Get ready…" : question.prompt}</h1></section>
      {session.phase !== "hidden" && <div className="presenter-options">{question.options.map(option=><AnswerOption key={option.id} letter={option.label} text={option.text} selected={!audience && session.selectedOptionId===option.id} correct={session.phase==="answer-revealed" && session.revealedCorrectOptionId===option.id} disabled={session.phase!=="options-visible" || audience} onClick={()=>run((state,at)=>selectAnswer(state,option.id,at))}/>)}</div>}
      {session.phase === "answer-revealed" && <Card className="presenter-feedback"><Status tone={correct ? "good" : "danger"}>{correct ? "CORRECT ANSWER" : session.outcome === "timed-out" ? "TIME IS UP" : "INCORRECT ANSWER"}</Status><h2>{question.options.find(option=>option.id===question.correctOptionId)?.text}</h2>{question.explanation && <p>{question.explanation}</p>}</Card>}
      {!audience && <Card className="presenter-controls"><div className="presenter-control-label"><span className="eyebrow">HOST CONTROLS</span><strong>{finished ? "Session complete" : "Manage the show"}</strong></div><div className="presenter-control-actions">
        {session.phase==="hidden" && <Button variant="primary" onClick={()=>run((state,at)=>revealOptions(state,at))}>Reveal question & options</Button>}
        {session.phase==="options-visible" && ["idle","paused"].includes(session.timer.status) && session.timer.durationMs !== null && <Button variant="primary" onClick={()=>run((state,at)=>session.timer.status==="paused" ? resumeTimer(state,at) : startTimer(state,at))}><Play size={15}/> {session.timer.status==="paused" ? "Resume countdown" : "Start countdown"}</Button>}
        {session.phase==="options-visible" && timerRunning && <Button variant="secondary" onClick={()=>run((state,at)=>pauseTimer(state,at))}><Pause size={15}/> Pause timer</Button>}
        {session.phase==="options-visible" && <Button variant="secondary" onClick={()=>run((state,at)=>{const paused=state.timer.status==="running" ? pauseTimer(state,at).state : state;return lockAnswer(paused,at);})}>Lock answer</Button>}
        {session.phase==="answer-locked" && <Button variant="primary" onClick={()=>run((state,at)=>revealAnswer(state,at))}>Reveal correct answer</Button>}
        {correct && <Button variant="primary" onClick={()=>run((state,at)=>nextQuestion(state,at))}>Next question <Play size={15}/></Button>}
        {finished && <Button variant="secondary" onClick={onExit}><ArrowLeft size={15}/> Back to library</Button>}
        {!finished && <Button variant="quiet" onClick={()=>{if(window.confirm("End this quiz session?"))run((state,at)=>endSession(state,at));}}><RotateCcw size={15}/> End session</Button>}
      </div></Card>}
      {audience && <div className="audience-caption">KNOWLEDGE. COMPETITION. GAME ON.</div>}
      {finished && <div className="presenter-finished"><span className="eyebrow">SESSION ENDED</span><h2>{session.outcome === "won" ? "Quiz completed!" : session.outcome === "timed-out" ? "Time ran out." : session.outcome === "lost" ? "That’s the end of the run." : "Session ended by host."}</h2><p>{session.outcome === "won" ? "Every question answered correctly." : "The session has been closed."}</p></div>}
    </main>}
    <footer className="presenter-footer"><span>PLAYSTATE <i>•</i> KNOWLEDGE. COMPETITION. GAME ON.</span><span>LOCAL SESSION · NO CLOUD REQUIRED</span></footer>
  </div>;
}
