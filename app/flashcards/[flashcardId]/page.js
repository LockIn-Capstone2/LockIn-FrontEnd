"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBars } from "@/components/ui/gradient-bars";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

export default function FlashcardPage() {
  const { flashcardId } = useParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [responseType, setResponseType] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useRouter();

  useEffect(() => {
    if (!flashcardId) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:8080/api/chat/flashcards/${flashcardId}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();

        if (json.error) {
          throw new Error(json.details || json.error);
        }

        if (json.data && Array.isArray(json.data)) {
          setData(json.data);
          setResponseType(json.response_type || "unknown");
        } else {
          throw new Error("No quiz data found in response");
        }

        if (!json.data || json.data.length === 0) {
          throw new Error("Quiz data is empty");
        }
      } catch (err) {
        console.error("Failed to fetch Flashcards:", err);
        setError(err.message || "Failed to load Flashcards");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [flashcardId]);

  const isFlashcard =
    data &&
    (data[0].front || data[0].question) &&
    (data[0].back || data[0].answer || data[0].correct);

  const handleFlashcardNext = () => {
    if (!data) return;

    const next = currentIndex + 1;
    if (next < data.length) {
      setCurrentIndex(next);
      setShowAnswer(false);
    } else {
      // Loop back to first card
      setCurrentIndex(0);
      setShowAnswer(false);
    }
  };

  const handleFlashcardPrevious = () => {
    if (!data) return;

    const prev = currentIndex - 1;
    if (prev >= 0) {
      setCurrentIndex(prev);
      setShowAnswer(false);
    } else {
      // Loop to last card
      setCurrentIndex(data.length - 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Loading flashcards...
        </div>
        <div style={{ fontSize: "1rem", color: "#666" }}>
          Please wait while we prepare your content
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div
          style={{ fontSize: "1.5rem", color: "#d32f2f", marginBottom: "1rem" }}
        >
          Error Loading Flashcards
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

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", color: "#666" }}>
          No Flashcard data available
        </div>
      </div>
    );
  }

  if (isFlashcard) {
    const current = data[currentIndex];
    const frontText = current.front || current.question;
    const backText = current.back || current.answer || current.correct;

    return (
      <div className="relative min-h-screen">
        <GradientBars colors={["#3c5899", "transparent"]} />
        <div className="relative z-20">
          <ThemeToggleButton />

          <div className="p-8 max-w-[800px] m-auto">
            {/* Progress indicator */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "2rem",
                color: "#666",
              }}
            >
              Card {currentIndex + 1} of {data.length}
            </div>

            {/* Flashcard */}
            <div
              style={{
                border: "2px solid #e0e0e0",
                borderRadius: "16px",
                padding: "3rem",
                marginBottom: "2rem",
                backgroundColor: "white",
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              {!showAnswer ? (
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      marginBottom: "1rem",
                      color: "#333",
                    }}
                  >
                    Question
                  </h2>
                  <p
                    style={{
                      fontSize: "1.2rem",
                      lineHeight: "1.6",
                      color: "#555",
                    }}
                  >
                    {frontText}
                  </p>
                </div>
              ) : (
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      marginBottom: "1rem",
                      color: "#333",
                    }}
                  >
                    Answer
                  </h2>
                  <p
                    style={{
                      fontSize: "1.2rem",
                      lineHeight: "1.6",
                      color: "#555",
                    }}
                  >
                    {backText}
                  </p>
                </div>
              )}
            </div>

            {/* Metadata */}
            {(current.difficulty || current.cognitive_skill) && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "2rem",
                  padding: "1rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                {current.difficulty && (
                  <span style={{ marginRight: "1rem", color: "#666" }}>
                    Difficulty: <strong>{current.difficulty}</strong>
                  </span>
                )}
                {current.cognitive_skill && (
                  <span style={{ color: "#666" }}>
                    Skill: <strong>{current.cognitive_skill}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleFlashcardPrevious}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  backgroundColor: "#666",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ← Previous
              </button>

              <button
                onClick={() => setShowAnswer(!showAnswer)}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  backgroundColor: showAnswer ? "#4caf50" : "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {showAnswer ? "Show Question" : "Show Answer"}
              </button>

              <button
                onClick={handleFlashcardNext}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  backgroundColor: "#666",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unknown format
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "1.5rem", color: "#666", marginBottom: "1rem" }}>
        Unknown content format
      </div>
      <div style={{ fontSize: "1rem", color: "#999" }}>
        The content couldn't be displayed as a quiz or flashcards
      </div>
      <pre
        style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          overflow: "auto",
          fontSize: "0.8rem",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
