const feedback = (id, message, correct) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.className = `feedback ${correct ? "success" : "retry"}`;
};

document.querySelectorAll("[data-reveal]").forEach((button) => button.addEventListener("click", () => {
  const target = document.getElementById(button.dataset.reveal);
  target.classList.toggle("show");
  button.textContent = target.classList.contains("show") ? "Hide explanation −" : "Why might elimination help? +";
}));

document.querySelectorAll("[data-choice]").forEach((group) => group.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
  group.querySelectorAll("button").forEach((choice) => choice.classList.remove("selected"));
  button.classList.add("selected");
  if (group.dataset.choice === "lantern") feedback("lantern-feedback", button.textContent === "Model A" ? "Good prediction: the lower-cost lantern needs to make up more of the total." : "Keep an open mind—your calculation will confirm it.", button.textContent === "Model A");
  if (group.dataset.choice === "travel") feedback("travel-feedback", button.textContent === "Bike then bus" ? "Exactly. Bike hire begins cheaper, but its cost rises faster." : "Look at both starting costs and rates: this will become clear on the graph.", button.textContent === "Bike then bus");
})));

document.getElementById("elimination-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const a = Number(document.getElementById("model-a").value), b = Number(document.getElementById("model-b").value);
  feedback("elimination-feedback", a === 48 && b === 32 ? "Correct. 48 + 32 = 80 and 12(48) + 18(32) = 1152." : "Not quite. Check that your two values total 80 and cost $1,152 together.", a === 48 && b === 32);
});

document.getElementById("graph-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const hours = Number(document.getElementById("hours").value), cost = Number(document.getElementById("cost").value);
  feedback("graph-feedback", hours === 4 && cost === 12 ? "Correct. At 4 hours, both options cost $12." : "Try reading where both lines share the same y-value. Reveal the intersection if you need a clue.", hours === 4 && cost === 12);
});

const svg = document.getElementById("cost-graph");
if (svg) {
  const left = 62, bottom = 340, width = 480, height = 280, x = (n) => left + n * 60, y = (n) => bottom - n * 20;
  let markup = "";
  for (let i = 0; i <= 8; i++) markup += `<line class="grid" x1="${x(i)}" y1="60" x2="${x(i)}" y2="${bottom}"/><text class="axis-text" x="${x(i)}" y="362" text-anchor="middle">${i}</text>`;
  for (let i = 0; i <= 14; i += 2) markup += `<line class="grid" x1="${left}" y1="${y(i)}" x2="${left + width}" y2="${y(i)}"/><text class="axis-text" x="50" y="${y(i) + 4}" text-anchor="end">${i}</text>`;
  markup += `<line class="axis" x1="${left}" y1="${bottom}" x2="${left + width + 7}" y2="${bottom}"/><line class="axis" x1="${left}" y1="${bottom}" x2="${left}" y2="52"/><text class="axis-title" x="${left + width}" y="382" text-anchor="end">hours (x)</text><text class="axis-title" x="${left}" y="32">cost, $ (y)</text>`;
  svg.innerHTML = markup;
  const addLine = (id, className, start, end) => { const line = document.createElementNS("http://www.w3.org/2000/svg", "line"); line.id = id; line.setAttribute("class", className); line.setAttribute("x1", x(start[0])); line.setAttribute("y1", y(start[1])); line.setAttribute("x2", x(end[0])); line.setAttribute("y2", y(end[1])); svg.append(line); };
  addLine("bike-line", "line-bike", [0, 4], [5, 14]); addLine("bus-line", "line-bus", [0, 10], [8, 14]);
  const point = document.createElementNS("http://www.w3.org/2000/svg", "g"); point.id = "intersection"; point.style.display = "none"; point.innerHTML = `<circle class="point" cx="${x(4)}" cy="${y(12)}" r="7"/><text class="point-label" x="${x(4) + 12}" y="${y(12) - 12}">(4, 12)</text>`; svg.append(point);
  [["bike-toggle", "bike-line"], ["bus-toggle", "bus-line"], ["point-toggle", "intersection"]].forEach(([toggle, element]) => document.getElementById(toggle).addEventListener("change", (event) => document.getElementById(element).style.display = event.target.checked ? "" : "none"));
}

const renderPractice = (config) => {
  const form = document.getElementById(config.formId);
  if (!form) return;
  let index = 0, streak = 0, questionNumber = 1, current;
  const chooseQuestion = () => {
    current = config.questions[index % config.questions.length];
    index += 1;
    document.getElementById(config.topicId).textContent = current.topic;
    document.getElementById(config.titleId).textContent = current.title;
    document.getElementById(config.promptId).textContent = current.prompt;
    document.getElementById(config.equationsId).innerHTML = current.equations;
    document.getElementById(config.labelOneId).firstChild.textContent = `${current.labelOne} `;
    document.getElementById(config.labelTwoId).firstChild.textContent = `${current.labelTwo} `;
    document.getElementById(config.questionNumberId).textContent = questionNumber;
    form.reset();
    feedback(config.feedbackId, "", false);
    document.getElementById(config.nextId).hidden = true;
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const first = Number(document.getElementById(config.inputOneId).value);
    const second = Number(document.getElementById(config.inputTwoId).value);
    const correct = first === current.answerOne && second === current.answerTwo;
    if (correct) {
      streak += 1;
      feedback(config.feedbackId, `Correct! ${current.success}`, true);
      document.getElementById(config.streakId).textContent = streak;
      document.getElementById(config.nextId).hidden = false;
    } else {
      streak = 0;
      document.getElementById(config.streakId).textContent = streak;
      feedback(config.feedbackId, current.hint, false);
    }
  });
  document.getElementById(config.nextId).addEventListener("click", () => { questionNumber += 1; chooseQuestion(); });
  chooseQuestion();
};

renderPractice({
  formId: "elimination-practice-form", topicId: "elimination-practice-topic", titleId: "elimination-practice-title", promptId: "elimination-practice-prompt", equationsId: "elimination-practice-equations", labelOneId: "elimination-label-a", labelTwoId: "elimination-label-b", inputOneId: "practice-model-a", inputTwoId: "practice-model-b", feedbackId: "elimination-practice-feedback", nextId: "elimination-next", streakId: "elimination-streak", questionNumberId: "elimination-question-number",
  questions: [
    { topic: "Solar lighting", title: "Lantern stock", prompt: "A store has 70 lanterns. Model A costs $14 and Model B costs $20. The total value is $1,160. How many of each model are there?", equations: "a + b = 70 &nbsp;&nbsp; 14a + 20b = 1160", labelOne: "Model A", labelTwo: "Model B", answerOne: 40, answerTwo: 30, success: "There are 40 Model A lanterns and 30 Model B lanterns.", hint: "Check that the two amounts add to 70 and give a total value of $1,160." },
    { topic: "Recycling drive", title: "Two types of collection bags", prompt: "A recycling group filled 54 bags. Paper bags weigh 3 kg and plastic bags weigh 5 kg. The total mass was 198 kg. How many bags of each type were filled?", equations: "p + q = 54 &nbsp;&nbsp; 3p + 5q = 198", labelOne: "Paper bags", labelTwo: "Plastic bags", answerOne: 36, answerTwo: 18, success: "There are 36 paper bags and 18 plastic bags.", hint: "Your two values must add to 54 and their weighted mass must be 198 kg." },
    { topic: "School garden", title: "Seedling trays", prompt: "A garden has 44 seedling trays. Small trays hold 6 seedlings and large trays hold 10 seedlings. There are 328 seedlings altogether. How many of each tray are there?", equations: "s + l = 44 &nbsp;&nbsp; 6s + 10l = 328", labelOne: "Small trays", labelTwo: "Large trays", answerOne: 28, answerTwo: 16, success: "There are 28 small trays and 16 large trays.", hint: "Make sure the tray counts total 44 and the seedling count totals 328." },
    { topic: "Sports event", title: "Ticket sales", prompt: "A match sold 90 tickets. Student tickets cost $4 and adult tickets cost $7. The total income was $495. How many of each ticket were sold?", equations: "s + a = 90 &nbsp;&nbsp; 4s + 7a = 495", labelOne: "Student tickets", labelTwo: "Adult tickets", answerOne: 45, answerTwo: 45, success: "There are 45 student tickets and 45 adult tickets.", hint: "Check the ticket total and total income separately." }
  ]
});

renderPractice({
  formId: "graph-practice-form", topicId: "graph-practice-topic", titleId: "graph-practice-title", promptId: "graph-practice-prompt", equationsId: "graph-practice-equations", labelOneId: "graph-label-x", labelTwoId: "graph-label-y", inputOneId: "practice-hours", inputTwoId: "practice-cost", feedbackId: "graph-practice-feedback", nextId: "graph-next", streakId: "graph-streak", questionNumberId: "graph-question-number",
  questions: [
    { topic: "Travel options", title: "Two fare rules", prompt: "A visitor is choosing between two transport passes. Pass A costs a $3 starting fee plus $1.50 per hour. Pass B costs a $7 starting fee plus $0.50 per hour. After how many hours will the passes cost the same, and what will that cost be?", equations: "Pass A: y = 1.5x + 3 &nbsp;&nbsp; Pass B: y = 0.5x + 7", labelOne: "Hours", labelTwo: "Equal cost ($)", answerOne: 4, answerTwo: 9, success: "After 4 hours, both passes cost $9.", hint: "Set the two expressions for cost equal, then substitute your hours value back into either rule." },
    { topic: "Mobile data", title: "Comparing phone plans", prompt: "Two mobile data plans have different charges. Plan A costs a $5 connection fee plus $3 for each data unit. Plan B costs a $15 connection fee plus $1 for each data unit. At how many data units will the plans cost the same, and what is the shared cost?", equations: "Plan A: y = 3x + 5 &nbsp;&nbsp; Plan B: y = x + 15", labelOne: "Data units", labelTwo: "Equal cost ($)", answerOne: 5, answerTwo: 20, success: "At 5 data units, both plans cost $20.", hint: "The two plans must have the same cost at the intersection." },
    { topic: "Bike hire", title: "Two hire services", prompt: "A student compares two bike-hire services for a day out. Service A charges $6 plus $2 per hour. Service B charges $12 plus $1 per hour. For how many hours are the services equal in cost, and what is the cost?", equations: "Service A: y = 2x + 6 &nbsp;&nbsp; Service B: y = x + 12", labelOne: "Hours", labelTwo: "Equal cost ($)", answerOne: 6, answerTwo: 18, success: "After 6 hours, both services cost $18.", hint: "Use the fact that both rules have the same cost at the intersection." },
    { topic: "Fundraising", title: "Two donation targets", prompt: "Two groups are collecting donations. Group A starts with $2 and raises $4 each week. Group B starts with $10 and raises $2 each week. After how many weeks will their totals match, and what will that total be?", equations: "Group A: y = 4x + 2 &nbsp;&nbsp; Group B: y = 2x + 10", labelOne: "Weeks", labelTwo: "Equal total ($)", answerOne: 4, answerTwo: 18, success: "After 4 weeks, both groups have raised $18.", hint: "Equate 4x + 2 and 2x + 10 to find the number of weeks." }
  ]
});
