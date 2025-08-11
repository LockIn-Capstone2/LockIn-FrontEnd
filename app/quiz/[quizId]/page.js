"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [responseType, setResponseType] = useState(null);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const navigate = useRouter();

  useEffect(() => {
    if (!quizId) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:8080/api/chat/quiz/${quizId}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();

        // Check for backend errors
        if (json.error) {
          throw new Error(json.details || json.error);
        }

        // Backend already parsed the data for us!
        if (json.data && Array.isArray(json.data)) {
          setData(json.data);
          setResponseType(json.response_type || "unknown");
        } else {
          throw new Error("No quiz data found in response");
        }

        if (!json.data || json.data.length === 0) {
          throw new Error("Quiz data is empty");
        }

        // Reset quiz state
        setCurrentIndex(0);
        setScore(0);
        setShowScore(false);
        setSelectedAnswer(null);
        setShowAnswer(false);
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [quizId]);

  // Determine if it's a quiz
  const isQuiz =
    data &&
    data[0] &&
    data[0].question &&
    Array.isArray(data[0].options) &&
    data[0].options.length >= 2 &&
    data[0].correct;

  const handleAnswer = (selectedOption) => {
    if (!data || !isQuiz) return;

    setSelectedAnswer(selectedOption);
    setShowAnswer(true);

    const currentItem = data[currentIndex];
    const isCorrect = selectedOption === currentItem.correct;

    if (isCorrect) {
      setScore(score + 1);
    }

    // Auto-advance after showing answer
    setTimeout(() => {
      setShowAnswer(false);
      setSelectedAnswer(null);

      const next = currentIndex + 1;
      if (next < data.length) {
        setCurrentIndex(next);
      } else {
        setShowScore(true);
      }
    }, 2000);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Loading quiz...
        </div>
        <div style={{ fontSize: "1rem", color: "#666" }}>
          Please wait while we prepare your content
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div
          style={{ fontSize: "1.5rem", color: "#d32f2f", marginBottom: "1rem" }}
        >
          Error Loading Quiz
        </div>
        <div style={{ fontSize: "1rem", color: "#666", marginBottom: "2rem" }}>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", color: "#666" }}>
          No quiz data available
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (showScore && isQuiz) {
    const percentage = Math.round((score / data.length) * 100);
    const getScoreMessage = () => {
      if (percentage >= 90) return "Excellent! 🎉";
      if (percentage >= 80) return "Great job! 👍";
      if (percentage >= 70) return "Good work! 👏";
      if (percentage >= 60) return "Not bad! 😊";
      return "Keep practicing! 💪";
    };

    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#1976d2", marginBottom: "1rem" }}>
          Quiz Complete!
        </h1>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          {getScoreMessage()}
        </div>
        <div style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
          Your score: {score} / {data.length} ({percentage}%)
        </div>
        <button
          onClick={restartQuiz}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginRight: "1rem",
          }}
        >
          Restart Quiz
        </button>
        <button
          onClick={() => navigate.push("/LockInChat")}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Quiz display
  if (isQuiz) {
    const current = data[currentIndex];
    const progress = ((currentIndex + 1) / data.length) * 100;

    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            marginBottom: "2rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#1976d2",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Question counter */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#666",
          }}
        >
          Question {currentIndex + 1} of {data.length}
        </div>

        {/* Question */}
        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "2rem",
            color: "#333",
            lineHeight: "1.4",
          }}
        >
          {current.question}
        </h1>

        {/* Answer options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {current.options.map((option, index) => {
            const isSelected = selectedAnswer === option[0];
            const isCorrect = current.correct === option[0];
            const showResult = showAnswer;

            let buttonStyle = {
              padding: "1rem",
              fontSize: "1rem",
              cursor: showResult ? "default" : "pointer",
              borderRadius: "8px",
              // border: "2px solid #e0e0e0",
              backgroundColor: "white",
              transition: "all 0.2s ease",
              textAlign: "left",
              color: "black",
            };

            if (showResult) {
              if (isSelected && isCorrect) {
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor: "#4caf50",
                  color: "white",
                  borderColor: "#4caf50",
                };
              } else if (isSelected && !isCorrect) {
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor: "#f44336",
                  color: "white",
                  borderColor: "#f44336",
                };
              } else if (isCorrect) {
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor: "#4caf50",
                  color: "white",
                  borderColor: "#4caf50",
                };
              }
            } else if (isSelected) {
              buttonStyle = {
                ...buttonStyle,
                backgroundColor: "#e3f2fd",
                borderColor: "#1976d2",
              };
            }

            return (
              <button
                key={index}
                style={buttonStyle}
                onClick={() => !showResult && handleAnswer(option[0])}
                disabled={showResult}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback message */}
        {showAnswer && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "8px",
              textAlign: "center",
              marginBottom: "2rem",
              backgroundColor:
                selectedAnswer === current.correct ? "#e8f5e8" : "#ffebee",
              color: selectedAnswer === current.correct ? "#2e7d32" : "#c62828",
            }}
          >
            {selectedAnswer === current.correct
              ? "✅ Correct!"
              : "❌ Incorrect. The correct answer is highlighted above."}
          </div>
        )}

        {/* Navigation */}
        {showAnswer && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "1rem", color: "#666", marginBottom: "1rem" }}
            >
              {currentIndex + 1 < data.length
                ? "Next question in 2 seconds..."
                : "Quiz complete!"}
            </div>
          </div>
        )}
      </div>
    );
  }
}
