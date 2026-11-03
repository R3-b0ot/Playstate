import type { QuizDefinition } from "@playstate/game-core";

export const DEMO_QUIZ: QuizDefinition = {
  id: "playstate-demo-quiz-v1",
  title: "The Playstate Challenge",
  questions: [
    { id: "demo-q1", prompt: "Which planet in our solar system has the most prominent ring system?", options: [{ id:"a",label:"A",text:"Mars" },{ id:"b",label:"B",text:"Saturn" },{ id:"c",label:"C",text:"Venus" },{ id:"d",label:"D",text:"Neptune" }], correctOptionId:"b", explanation:"Saturn's extensive rings are made mostly of ice particles, with rocky debris and dust." },
    { id: "demo-q2", prompt: "What is the chemical symbol for gold?", options: [{ id:"a",label:"A",text:"Ag" },{ id:"b",label:"B",text:"Gd" },{ id:"c",label:"C",text:"Au" },{ id:"d",label:"D",text:"Go" }], correctOptionId:"c", explanation:"Au comes from the Latin word aurum." },
    { id: "demo-q3", prompt: "Which is the largest ocean on Earth?", options: [{ id:"a",label:"A",text:"Atlantic Ocean" },{ id:"b",label:"B",text:"Indian Ocean" },{ id:"c",label:"C",text:"Arctic Ocean" },{ id:"d",label:"D",text:"Pacific Ocean" }], correctOptionId:"d", explanation:"The Pacific Ocean covers more area than all of Earth's land combined." },
    { id: "demo-q4", prompt: "Who wrote the play Romeo and Juliet?", options: [{ id:"a",label:"A",text:"William Shakespeare" },{ id:"b",label:"B",text:"Charles Dickens" },{ id:"c",label:"C",text:"Jane Austen" },{ id:"d",label:"D",text:"Oscar Wilde" }], correctOptionId:"a", explanation:"William Shakespeare wrote the tragedy early in his career." },
    { id: "demo-q5", prompt: "Which instrument measures atmospheric pressure?", options: [{ id:"a",label:"A",text:"Thermometer" },{ id:"b",label:"B",text:"Barometer" },{ id:"c",label:"C",text:"Hygrometer" },{ id:"d",label:"D",text:"Anemometer" }], correctOptionId:"b", explanation:"A barometer measures atmospheric pressure and is used in weather forecasting." }
  ]
};
