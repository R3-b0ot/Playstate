import { useMemo, useState } from "react";
import { createSession, nextQuestion, revealAnswer, revealOptions, selectAnswer, lockAnswer, startSession, timerDurationForQuestion, validateQuiz, type QuizDefinition, type QuizQuestion, type SessionState } from "@playstate/game-core";
import { AnswerOption, Button, Card, EmptyState, Field, Status, TextAreaField } from "@playstate/ui";
import { ArrowLeft, Plus, Play, Save, Trash2 } from "lucide-react";

const makeQuestion = (n: number): QuizQuestion => ({ id: `question-${n}`, prompt: "", options: ["A","B","C","D"].map(id => ({ id, label:id, text:"" })), correctOptionId:"A" });

export default function QuizEditor({ title, onBack, onNotice }: { title: string; onBack: () => void; onNotice: (message: string) => void }) {
  const [questions,setQuestions] = useState<QuizQuestion[]>([]);
  const [selected,setSelected] = useState(0);
  const [session,setSession] = useState<SessionState | null>(null);
  const [showRun,setShowRun] = useState(false);
  const question = questions[selected];
  const quiz: QuizDefinition = useMemo(() => ({ id:"local-preview", title, questions }), [title,questions]);
  const errors = validateQuiz(quiz);
  function updateQuestion(patch: Partial<QuizQuestion>) {
    setQuestions(items => items.map((item,index) => index === selected ? { ...item, ...patch } : item));
  }
  function updateOption(id: string,text: string) {
    updateQuestion({ options: question.options.map(option => option.id === id ? { ...option,text } : option) });
  }
  function startPreview() {
    if (errors.length) { onNotice(errors[0]); return; }
    try {
      const prepared = createSession(quiz).state;
      setSession(startSession(prepared).state);
      setShowRun(true);
    } catch (error) { onNotice(error instanceof Error ? error.message : "Unable to start preview."); }
  }
  function command(action: (state: SessionState) => { state: SessionState }) {
    if (!session) return;
    try { setSession(action(session).state); }
    catch (error) { onNotice(error instanceof Error ? error.message : "That action is not available."); }
  }
  const active = session?.quiz.questions[session.questionIndex];
  const timer = session ? timerDurationForQuestion(session.questionIndex + 1) : null;
  return <section className="editor-page">
    <div className="editor-heading"><div><button className="editor-back" onClick={onBack}><ArrowLeft size={15}/> Quiz library</button><div className="eyebrow">QUIZ BUILDER</div><h1>{title}</h1><p>Build and validate your question set. Draft changes remain in this browser preview.</p></div><div className="editor-heading-actions"><Status tone={errors.length ? "warning" : questions.length ? "good" : "default"}>{errors.length ? `${errors.length} checks to resolve` : questions.length ? "Ready to preview" : "No questions yet"}</Status><Button variant="primary" onClick={startPreview} disabled={!questions.length}><Play size={15}/> Test run</Button></div></div>
    <div className="editor-layout">
      <Card className="question-rail"><div className="editor-section-head"><strong>Questions</strong><span>{questions.length}</span></div>{questions.length ? questions.map((item,index)=><button key={item.id} className={`ps-question-card ${selected===index?"is-selected":""}`} onClick={()=>setSelected(index)}><span className="ps-question-card__number">{String(index+1).padStart(2,"0")}</span><span>{item.prompt.trim() || "Untitled question"}</span></button>) : <EmptyState title="Start your quiz" description="Add your first question to begin building the set."/>}<Button variant="secondary" onClick={()=>{setQuestions(items=>[...items,makeQuestion(items.length+1)]);setSelected(questions.length);setSession(null);}}><Plus size={15}/> Add question</Button></Card>
      <Card className="question-workspace">{question ? <><div className="editor-section-head"><div><span className="eyebrow">QUESTION {String(selected+1).padStart(2,"0")}</span><h2>Question content</h2></div><button className="editor-delete" onClick={()=>{setQuestions(items=>items.filter((_,index)=>index!==selected));setSelected(Math.max(0,selected-1));setSession(null);}} aria-label="Delete question"><Trash2 size={16}/></button></div><TextAreaField label="Question prompt" value={question.prompt} onChange={event=>updateQuestion({prompt:event.target.value})} placeholder="Write the question for your audience..." rows={4}/><div className="editor-answer-head"><strong>Answer options</strong><span>Select the correct answer</span></div><div className="editor-options">{question.options.map(option=><div className="editor-option" key={option.id}><label className="editor-correct"><input type="radio" name="correct-answer" checked={question.correctOptionId===option.id} onChange={()=>updateQuestion({correctOptionId:option.id})}/><span>{option.label}</span></label><input className="ps-field" value={option.text} onChange={event=>updateOption(option.id,event.target.value)} placeholder={`Option ${option.label}`}/></div>)}</div><TextAreaField label="Explanation (optional)" value={question.explanation ?? ""} onChange={event=>updateQuestion({explanation:event.target.value})} placeholder="Add context shown after the answer is revealed..." rows={2}/><div className="editor-footer"><span>Default timer: {timerDurationForQuestion(selected+1) === null ? "Untimed" : `${timerDurationForQuestion(selected+1)!/1000} seconds`}</span><span>Changes are held in browser memory</span></div></> : <EmptyState title="No question selected" description="Add a question to open the editor." action={<Button variant="primary" onClick={()=>setQuestions([makeQuestion(1)])}><Plus size={15}/> Add first question</Button>}/>}</Card>
      <Card className="editor-inspector"><span className="eyebrow">VALIDATION</span><h3>Before you play</h3>{errors.length ? <ul className="validation-list">{errors.slice(0,8).map(error=><li key={error}>{error}</li>)}</ul> : <p className="validation-ok">All current questions pass the basic checks.</p>}<div className="timer-policy"><strong>Default timer policy</strong><span>Questions 1–4 · 60 sec</span><span>Questions 5–9 · 120 sec</span><span>Question 10+ · Untimed</span></div><Button variant="secondary" block onClick={()=>onNotice("Draft editing is local to this browser preview; durable quiz storage is part of the desktop persistence milestone.")}><Save size={15}/> Save status</Button></Card>
    </div>
    {showRun && session && active && <div className="run-overlay"><Card className="run-panel"><div className="run-top"><div><span className="eyebrow">ENGINE TEST SESSION</span><h2>{title}</h2></div><button className="editor-delete" onClick={()=>setShowRun(false)} aria-label="Close test session">×</button></div><div className="run-meta"><Status tone="live">Question {session.questionIndex+1} / {session.quiz.questions.length}</Status><Status tone={timer===null?"warning":"good"}>{timer===null?"Untimed":`${timer/1000}s default`}</Status><Status>{session.phase}</Status></div><h3>{active.prompt}</h3>{session.phase === "hidden" && <Button variant="primary" onClick={()=>command(revealOptions)}>Reveal options</Button>}{session.phase !== "hidden" && <div className="run-options">{active.options.map(option=><AnswerOption key={option.id} letter={option.label} text={option.text} selected={session.selectedOptionId===option.id} correct={session.phase==="answer-revealed" && session.revealedCorrectOptionId===option.id} disabled={session.phase!=="options-visible"} onClick={()=>command(state=>selectAnswer(state,option.id))}/>)}</div>}{session.phase==="options-visible" && <Button variant="primary" disabled={!session.selectedOptionId} onClick={()=>command(lockAnswer)}>Lock answer</Button>}{session.phase==="answer-locked" && <Button variant="primary" onClick={()=>command(revealAnswer)}>Reveal answer</Button>}{session.phase==="answer-revealed" && <div className="run-result"><Status tone={session.outcome==="in-progress"?"good":"danger"}>{session.outcome==="in-progress"?"Correct answer":"Run ended"}</Status>{active.explanation && <p>{active.explanation}</p>}{session.outcome==="in-progress" && <Button variant="primary" onClick={()=>command(nextQuestion)}>Next question</Button>}</div>}{session.status==="completed" && <p className="run-finished">Test session finished · {session.outcome}</p>}</Card></div>}
  </section>;
}
