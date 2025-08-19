"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBars } from "@/components/ui/gradient-bars";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { ShareButtonDemo } from "@/components/shareButtonComponent";
import { Hourglass } from "ldrs/react";

export default function FlashcardPage() {
  const { flashcardId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [responseType, setResponseType] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [startTime] = useState(Date.now());
  const [user, setUser] = useState(null);

  const navigate = useRouter();

  // Get current authenticated user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/progress/current-user",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // User not authenticated, redirect to login
            navigate.push("/LogIn");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        if (userData && userData.user) {
          setUser(userData.user);
        } else {
          navigate.push("/LogIn");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate.push("/LogIn");
      }
    };

    getCurrentUser();
  }, [navigate]);

  // Progress tracking function
  // ... existing code ...

  // Progress tracking function
  const recordProgress = async (cardIndex, isCorrect) => {
    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    try {
      const duration = Date.now() - startTime;

      const response = await fetch(
        "http://localhost:8080/api/progress/flashcard-progress",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            // Remove user_id - it's now extracted from JWT token
            ai_chat_history_id: flashcardId,
            card_index: cardIndex,
            is_correct: isCorrect,
            duration_ms: duration,
            session_id: sessionId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to record progress: ${response.status}`);
      }

      console.log(
        `Progress recorded: Card ${cardIndex}, Correct: ${isCorrect}`
      );
    } catch (error) {
      console.error("Failed to record progress:", error);
    }
  };

  // ... existing code ...
  const startSession = async () => {
    if (!user) return;

    try {
      const response = await fetch("http://localhost:8080/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // Remove body since user ID comes from JWT token
      });

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.status}`);
      }

      console.log("Session started");
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const endSession = async () => {
    if (!user) return;

    try {
      const response = await fetch("http://localhost:8080/api/sessions/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // Remove body since user ID comes from JWT token
      });

      if (!response.ok) {
        throw new Error(`Failed to end session: ${response.status}`);
      }

      console.log("Session ended");
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  };

  useEffect(() => {
    if (!flashcardId || !user) return;

    startSession();

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:8080/api/chat/flashcards/${flashcardId}`,
          {
            credentials: "include",
          }
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

    return () => {
      endSession();
    };
  }, [flashcardId, user]);

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

  // Handle flashcard answer (correct/incorrect)
  const handleFlashcardAnswer = async (isCorrect) => {
    // Record progress for the current card
    await recordProgress(currentIndex, isCorrect);

    // You could add UI feedback here
    console.log(
      `Card ${currentIndex + 1}: ${isCorrect ? "Correct" : "Incorrect"}`
    );
  };

  // Don't render anything until we have user data
  if (!user) {
    return (
      <div className="p-8 text-center">
        <Hourglass size="40" bgOpacity="0.1" speed="1.75" color="white" />
        <div className="text-lg text-white font-[poppins]">
          Authenticating user...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Hourglass size="40" bgOpacity="0.1" speed="1.75" color="white" />
        <div className="text-lg text-white font-[poppins]">
          Please wait while we prepare your content
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl text-[#d32f2f] mb-4 font-[poppins]">
          Error Loading Flashcards
        </div>
        <div className="text-[1rem] text-[#ea0909] mb-8">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="py-3 px-6 text-lg bg-[#1976d2] text-white border-none rounded-[8px] cursor-pointer font-[poppins]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl text-[#ff1818]">
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
            <div className="flex items-center justify-center mb-4">
              <ShareButtonDemo />
            </div>

            {/* User info */}
            <div className="text-center mb-4 font-[poppins] text-sm text-gray-600">
              Studying as: <strong>{user.username}</strong>
            </div>

            {/* Progress indicator */}
            <div className="text-center mb-8 font-[poppins]">
              Card {currentIndex + 1} of {data.length}
            </div>

            {/* Flashcard */}
            <div className="border-2 border-[#e0e0e0] rounded-[16px] p-12 mb-8 min-h-[300px] flex flex-col justify-center items-center text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
              {!showAnswer ? (
                <div>
                  <h2 className="text-2xl mb-4 font-[poppins]">Question</h2>
                  <p className="text-lg font-[poppins]">{frontText}</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl mb-4 font-[poppins]">Answer</h2>
                  <p className="text-lg font-[poppins]">{backText}</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            {(current.difficulty || current.cognitive_skill) && (
              <div className="text-center mb-8 p-4 rounded-[8px]">
                {current.difficulty && (
                  <span className="mr-4">
                    Difficulty: <strong>{current.difficulty}</strong>
                  </span>
                )}
                {current.cognitive_skill && (
                  <span className="">
                    Skill: <strong>{current.cognitive_skill}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Answer buttons - only show when answer is visible */}
            {showAnswer && (
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => handleFlashcardAnswer(false)}
                  className="py-3 px-6 text-lg bg-red-500 text-white border-none rounded-[8px] cursor-pointer hover:bg-red-600 transition-colors"
                >
                  ❌ Incorrect
                </button>
                <button
                  onClick={() => handleFlashcardAnswer(true)}
                  className="py-3 px-6 text-lg bg-green-500 text-white border-none rounded-[8px] cursor-pointer hover:bg-green-600 transition-colors"
                >
                  ✅ Correct
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleFlashcardPrevious}
                className="py-3 px-6 text-lg bg-[#666] text-white border-none rounded-[8px] cursor-pointer"
              >
                ← Previous
              </button>

              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="py-3 px-6 text-lg bg-[#1976d2] text-white border-none rounded-[8px] cursor-pointer"
              >
                {showAnswer ? "Show Question" : "Show Answer"}
              </button>

              <button
                onClick={handleFlashcardNext}
                className="py-3 px-6 text-lg bg-[#666] text-white border-none rounded-[8px] cursor-pointer"
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
    <div className="p-8 text-center">
      <div className="text-2xl mb-4 font-[poppins]">Unknown content format</div>
      <div className="text-[1rem] font-[poppins]">
        The content couldn&apos;t be displayed as a quiz or flashcards
      </div>
    </div>
  );
}
