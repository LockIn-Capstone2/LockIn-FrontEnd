"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { Hourglass } from "ldrs/react";
import "ldrs/react/Hourglass.css";
import { GradientBars } from "@/components/ui/gradient-bars";

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
  const [sessionId] = useState(`session_${Date.now()}`); // Unique session ID
  const [startTime] = useState(Date.now()); // Track session start time
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
  const recordQuizProgress = async (finalScore) => {
    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    try {
      const duration = Date.now() - startTime;

      const response = await fetch(
        "http://localhost:8080/api/progress/quiz-progress",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            // Remove user_id - it's now extracted from JWT token
            ai_chat_history_id: quizId,
            score: finalScore,
            duration_ms: duration,
            session_id: sessionId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to record quiz progress: ${response.status}`);
      }

      console.log(`Quiz progress recorded: Score ${finalScore}%`);
    } catch (error) {
      console.error("Failed to record quiz progress:", error);
    }
  };

  useEffect(() => {
    if (!quizId || !user) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:8080/api/chat/quiz/${quizId}`,
          {
            credentials: "include",
          }
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
  }, [quizId, user]);

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
        // Quiz completed - record progress
        const finalScore = Math.round(
          ((score + (isCorrect ? 1 : 0)) / data.length) * 100
        );
        recordQuizProgress(finalScore);
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

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl text-[#d32f2f] mb-4">Error Loading Quiz</div>
        <div className="text-[1rem] text-[#f43030] mb-8">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="py-3 px-6 text-lg bg-[#1976d2] text-white border-none rounded-[8px] cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl text-[#f00]">No quiz data available</div>
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
      <div className="p-8 max-w-[800px] m-auto text-center">
        <h1 className="text-[#1976d2] mb-4 font-[poppins]">Quiz Complete!</h1>
        <div className="text-2xl mb-2 font-[poppins]">{getScoreMessage()}</div>
        <div className="text-2xl mb-8 font-[poppins]">
          Your score: {score} / {data.length} ({percentage}%)
        </div>
        <button
          onClick={restartQuiz}
          className="py-4 px-8 text-[1.2rem] bg-[#4caf50] text-white border-none rounded-2xl cursor-pointer mr-4 font-[poppins]"
        >
          Restart Quiz
        </button>
        <button
          onClick={() => navigate.push(`/DashBoard/${user.id}`)}
          className="py-4 px-8 text-[1.2rem] bg-[#666] text-white border-none rounded-2xl cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Quiz display
  if (isQuiz) {
    const current = data[currentIndex];
    const progress = ((currentIndex + 1) / data.length) * 100;

    return (
      <div className="relative min-h-screen">
        <GradientBars colors={["#3c5899", "transparent"]} />
        <div className="relative z-20">
          <ThemeToggleButton />
          <div className="p-8 max-w-[800px] m-auto">
            {/* Progress bar */}
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-blue-700 dark:text-white">
                Quiz
              </span>
              <span className="text-sm font-medium text-blue-700 dark:text-white">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-8">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Question counter */}
            <div className="text-center mb-8 font-[poppins]">
              Question {currentIndex + 1} of {data.length}
            </div>

            {/* Question */}
            <h1 className="text-2xl mb-8 leading-6">{current.question}</h1>

            {/* Answer options */}
            <div className="flex flex-col gap-4 mb-8">
              {current.options.map((option, index) => {
                const isSelected = selectedAnswer === option[0];
                const isCorrect = current.correct === option[0];
                const showResult = showAnswer;

                let buttonStyle = {
                  padding: "1rem",
                  fontSize: "1rem",
                  cursor: showResult ? "default" : "pointer",
                  borderRadius: "8px",
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
                  color:
                    selectedAnswer === current.correct ? "#2e7d32" : "#c62828",
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
                <div className="text-[1rem] mb-4">
                  {currentIndex + 1 < data.length
                    ? "Next question in 2 seconds..."
                    : "Quiz complete!"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
