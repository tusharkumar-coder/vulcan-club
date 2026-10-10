"use client";

import { useState } from "react";
import { ArrowRight, Check, RotateCw, X } from "lucide-react";

const questions = [
  {
    category: "DSA",
    prompt: "What is the time complexity of binary search on a sorted array?",
    answers: ["o(log n)", "log n", "logarithmic"],
    explanation: "Each comparison cuts the remaining search space roughly in half.",
  },
  {
    category: "DSA",
    prompt: "Which data structure processes items in the order they arrive?",
    answers: ["queue", "a queue"],
    explanation: "A queue follows first in, first out (FIFO) order.",
  },
  {
    category: "DSA",
    prompt: "Which traversal explores a graph level by level?",
    answers: ["bfs", "breadth first search", "breadth-first search"],
    explanation: "Breadth-first search visits all nearby nodes before moving farther away.",
  },
  {
    category: "DSA",
    prompt: "Which data structure follows last in, first out (LIFO)?",
    answers: ["stack", "a stack"],
    explanation: "A stack removes the most recently added item first.",
  },
  {
    category: "DSA",
    prompt: "What is the average lookup time for a hash map?",
    answers: ["o(1)", "constant", "constant time"],
    explanation: "Hash maps provide average constant-time lookup by key.",
  },
  {
    category: "DSA",
    prompt: "What is the worst-case time complexity of quicksort?",
    answers: ["o(n^2)", "n^2", "quadratic", "quadratic time"],
    explanation: "Poor pivot choices can split the array very unevenly at every step.",
  },
  {
    category: "DSA",
    prompt: "What is the time complexity of accessing an array item by index?",
    answers: ["o(1)", "constant", "constant time"],
    explanation: "Arrays calculate an indexed item's location directly.",
  },
  {
    category: "DSA",
    prompt: "Which traversal is commonly used to find the shortest path in an unweighted graph?",
    answers: ["bfs", "breadth first search", "breadth-first search"],
    explanation: "BFS explores nodes in increasing distance from the starting node.",
  },
  {
    category: "Web development",
    prompt: "Which HTML element represents the main content of a page?",
    answers: ["main", "<main>", "main element"],
    explanation: "The semantic <main> element identifies the page's primary content.",
  },
  {
    category: "Web development",
    prompt: "Which CSS property sets the color of text?",
    answers: ["color", "the color property"],
    explanation: "The CSS color property controls an element's foreground text color.",
  },
  {
    category: "Web development",
    prompt: "In Flexbox, what does justify-content align items along?",
    answers: ["main axis", "the main axis"],
    explanation: "justify-content distributes items along the flex container's main axis.",
  },
  {
    category: "Web development",
    prompt: "What HTTP status code means that a page was not found?",
    answers: ["404", "not found", "404 not found"],
    explanation: "HTTP 404 indicates that the requested resource could not be found.",
  },
  {
    category: "Web development",
    prompt: "Which HTML attribute connects a label to an input's id?",
    answers: ["for", "htmlfor", "the for attribute"],
    explanation: "A label's for value should match the input element's id.",
  },
  {
    category: "Web development",
    prompt: "What does event.preventDefault() do in JavaScript?",
    answers: ["prevents the default action", "stop default action", "prevent default behavior"],
    explanation:
      "It cancels the browser's built-in action for that event, such as form navigation.",
  },
  {
    category: "Web development",
    prompt:
      "Which CSS position value keeps an element in normal flow until it reaches a scroll threshold?",
    answers: ["sticky", "position sticky", "position: sticky"],
    explanation:
      "position: sticky acts like relative positioning until its scroll threshold is reached.",
  },
  {
    category: "Web development",
    prompt: "What kind of values does localStorage store?",
    answers: ["strings", "string values", "key value strings", "key-value strings"],
    explanation: "Web Storage stores values as strings, so objects need serialization first.",
  },
];

export function CodingPractice() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "">("");
  const [streak, setStreak] = useState(0);
  const question = questions[questionIndex];
  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[\s().:_-]+/g, "");

  const checkAnswer = () => {
    const normalized = normalize(answer);
    const correct = question.answers.some((accepted) => normalized === normalize(accepted));
    setFeedback(correct ? "correct" : "incorrect");
    setStreak((current) => (correct ? current + 1 : 0));
  };

  const nextQuestion = () => {
    setQuestionIndex((current) => (current + 1) % questions.length);
    setAnswer("");
    setFeedback("");
  };

  return (
    <section className="practice-card" aria-labelledby="practice-title">
      <div className="practice-card-top">
        <div>
          <span className="micro">VULCAN / QUICK PRACTICE</span>
          <h3 id="practice-title">Coding interview practice</h3>
        </div>
        <div className="practice-streak" aria-label={`${streak} correct in a row`}>
          <span aria-hidden="true">✳</span> {streak} streak
        </div>
      </div>

      <span className="practice-topic">{question.category}</span>
      <p className="practice-question">{question.prompt}</p>

      <form
        className="practice-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!feedback) checkAnswer();
        }}
      >
        <label className="sr-only" htmlFor="practice-answer">
          Your answer
        </label>
        <input
          id="practice-answer"
          autoComplete="off"
          placeholder="Type your answer…"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setFeedback("");
          }}
        />
        <button className="button" type="submit" disabled={!answer.trim() || Boolean(feedback)}>
          Check answer <ArrowRight size={14} />
        </button>
      </form>

      <div className="practice-response" aria-live="polite">
        <div className={`practice-feedback ${feedback}`}>
          {feedback === "correct" && (
            <>
              <Check size={15} /> Correct answer
            </>
          )}
          {feedback === "incorrect" && (
            <>
              <X size={15} /> Not quite. Update your answer and check again, or continue.
            </>
          )}
        </div>
        <div className={`practice-explanation ${feedback ? "revealed" : ""}`}>
          <span className="practice-explanation-label">
            {feedback ? "Why this works" : "Explanation"}
          </span>
          <p>
            {feedback
              ? question.explanation
              : "Check your answer to reveal the explanation and reasoning."}
          </p>
          {feedback === "incorrect" && (
            <div className="practice-correct-answer">
              Expected answer <code>{question.answers[0]}</code>
            </div>
          )}
        </div>
      </div>

      <button className="practice-skip" type="button" onClick={nextQuestion}>
        <RotateCw size={13} /> Next question
      </button>
    </section>
  );
}
