// Game questions and categories
const questions = {
  "Regulations": [
    { value: 100, question: "Who protects the public health by helping to ensure that prescription drug promotion is truthful, balanced, and accurately communicated", answer: "ODPD" },
    { value: 200, question: "Publications that outline the FDA's current thinking on topics related to regulated products like drugs, biologics, medical devices, and food", answer: "Guidances" },
    { value: 300, question: "Who is responsible for approving new drugs, such as prescription, generic, biosimilars, and over-the-counter drugs", answer: "FDA" }
  ],
  "Clinical Trials": [
    { value: 100, question: "This person, often a physician or other healthcare professional, who oversees the conduct of a clinical trial", answer: "Investigator" },
    { value: 200, question: "Recently, the FDA is no longer mandating the testing of what before humans may be tested?", answer: "Animals" },
    { value: 300, question: "Typically, there are how many clinical trial phases?", answer: "3" }
  ],
  "Potpourri": [
    { value: 100, question: "What does mAb stand for?", answer: "Monoclonal antibody" },
    { value: 200, question: "How many countries allow patient advertising?", answer: "2" },
    { value: 300, question: "What are known as acquired functional capabilities that allow cancer cells to survive, proliferate, and disseminate?", answer: "Hallmarks of cancer" }
  ]
};

// Game state variables
let score = 0;
let answeredQuestions = 0;
let totalQuestions = 0;
let currentQuestion = null;
let currentTile = null;

// DOM Elements
const board = document.getElementById("board");
const scoreDisplay = document.getElementById("score");
const modal = document.getElementById("modal");
const modalQuestion = document.getElementById("modal-question");
const answerInput = document.getElementById("answer-input");
const submitAnswer = document.getElementById("submit-answer");
const closeModal = document.getElementById("close-modal");
const answerForm = document.getElementById("answer-form");
const answerFeedback = document.getElementById("answer-feedback");

// Count total questions
Object.values(questions).forEach(category => {
  totalQuestions += category.length;
});

/**
 * Updates the player's score and display
 * @param {number} points - Points to add/subtract from score
 */
function updateScore(points) {
  score += points;
  scoreDisplay.textContent = `Score: ${score}`;
}

/**
 * Creates the game board with all categories and questions
 */
function createBoard() {
  // Clear existing board if necessary
  board.innerHTML = '';
  
  // Create a column for each category
  Object.entries(questions).forEach(([category, qs], categoryIndex) => {
    const column = document.createElement("div");
    column.classList.add("column");
    column.setAttribute("role", "rowgroup");
    column.setAttribute("aria-label", category);
    
    // Add category header
    const title = document.createElement("h2");
    title.textContent = category;
    title.setAttribute("id", `category-${categoryIndex}`);
    column.appendChild(title);
    
    // Add tiles for each question in the category
    qs.forEach((q, questionIndex) => {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.textContent = `$${q.value}`;
      
      // Accessibility attributes
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("aria-label", `${category} for $${q.value}`);
      tile.setAttribute("id", `tile-${categoryIndex}-${questionIndex}`);
      
      // Add event listeners for both click and keyboard
      tile.addEventListener("click", () => selectTile(q, tile));
      tile.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectTile(q, tile);
        }
      });
      
      column.appendChild(tile);
    });
    
    board.appendChild(column);
  });
}

/**
 * Handles tile selection and opens the question modal
 * @param {Object} question - The question object
 * @param {HTMLElement} tile - The tile element
 */
function selectTile(question, tile) {
  if (tile.classList.contains("disabled")) return;
  
  currentQuestion = question;
  currentTile = tile;
  
  // Set the question in the modal
  modalQuestion.textContent = question.question;
  
  // Clear previous inputs and feedback
  answerInput.value = "";
  answerFeedback.textContent = "";
  answerFeedback.className = "feedback";
  
  // Show the modal
  modal.classList.remove("hidden");
  
  // Focus on the answer input for accessibility
  setTimeout(() => answerInput.focus(), 100);
}

/**
 * Closes the question modal
 */
function closeModalFn() {
  modal.classList.add("hidden");
  currentQuestion = null;
  
  // Return focus to the board
  if (currentTile) {
    currentTile.focus();
    currentTile = null;
  }
}

/**
 * Checks if the answer is correct
 * @param {string} userAnswer - The user's answer
 * @param {string} correctAnswer - The correct answer
 * @returns {boolean} Whether the answer is correct
 */
function checkAnswer(userAnswer, correctAnswer) {
  // Simple fuzzy matching: trim whitespace and compare case-insensitive
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

/**
 * Handles form submission when user answers
 * @param {Event} e - Form submission event
 */
function handleAnswerSubmit(e) {
  e.preventDefault();
  
  if (!currentQuestion) return;
  
  const userAnswer = answerInput.value;
  const correctAnswer = currentQuestion.answer;
  
  // Check if empty answer
  if (!userAnswer.trim()) {
    answerFeedback.textContent = "Please enter an answer";
    answerFeedback.className = "feedback error";
    answerInput.focus();
    return;
  }
  
  // Disable the current tile
  if (currentTile) {
    currentTile.classList.add("disabled");
    currentTile.setAttribute("aria-disabled", "true");
    currentTile.removeAttribute("tabindex");
  }
  
  // Check answer and update feedback/score
  if (checkAnswer(userAnswer, correctAnswer)) {
    updateScore(currentQuestion.value);
    answerFeedback.textContent = `Correct! You earned $${currentQuestion.value}.`;
    answerFeedback.className = "feedback success";
  } else {
    answerFeedback.textContent = `Incorrect. The correct answer is "${correctAnswer}".`;
    answerFeedback.className = "feedback error";
  }
  
  // Increment answered questions count
  answeredQuestions++;
  
  // Check for game over
  if (answeredQuestions >= totalQuestions) {
    setTimeout(() => {
      closeModalFn();
      alert(`Game Over! Your final score is $${score}`);
    }, 1500);
  } else {
    // Close modal after a delay
    setTimeout(closeModalFn, 1500);
  }
}

// Event Listeners
answerForm.addEventListener("submit", handleAnswerSubmit);
closeModal.addEventListener("click", closeModalFn);

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModalFn();
  }
});

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
  createBoard();
});