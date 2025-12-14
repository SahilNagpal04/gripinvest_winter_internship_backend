import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { authAPI } from '../utils/api';
import { isAuthenticated, saveAuth } from '../utils/auth';

const questions = [
  {
    id: 1,
    question: "What is your primary investment goal?",
    options: [
      { text: "Preserve capital with minimal risk", score: 1 },
      { text: "Steady growth with moderate risk", score: 2 },
      { text: "Maximum returns, willing to take high risk", score: 3 }
    ]
  },
  {
    id: 2,
    question: "How would you react if your investment dropped 20% in value?",
    options: [
      { text: "Sell immediately to prevent further loss", score: 1 },
      { text: "Hold and wait for recovery", score: 2 },
      { text: "Buy more at the lower price", score: 3 }
    ]
  },
  {
    id: 3,
    question: "What is your investment time horizon?",
    options: [
      { text: "Less than 3 years", score: 1 },
      { text: "3-7 years", score: 2 },
      { text: "More than 7 years", score: 3 }
    ]
  },
  {
    id: 4,
    question: "How much of your income can you invest?",
    options: [
      { text: "Less than 10%", score: 1 },
      { text: "10-30%", score: 2 },
      { text: "More than 30%", score: 3 }
    ]
  },
  {
    id: 5,
    question: "What is your investment experience?",
    options: [
      { text: "Beginner - Just starting out", score: 1 },
      { text: "Intermediate - Some experience", score: 2 },
      { text: "Advanced - Experienced investor", score: 3 }
    ]
  },
  {
    id: 6,
    question: "How important is liquidity to you?",
    options: [
      { text: "Very important - Need quick access", score: 1 },
      { text: "Somewhat important", score: 2 },
      { text: "Not important - Can lock funds long-term", score: 3 }
    ]
  }
];

export default function Quiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (score) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = async (finalAnswers) => {
    const totalScore = finalAnswers.reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 3;
    const percentage = (totalScore / maxScore) * 100;

    let personality, riskAppetite, description;

    if (percentage <= 40) {
      personality = "Conservative Investor";
      riskAppetite = "low";
      description = "You prefer safety and stability. Low-risk investments like bonds and fixed deposits suit you best.";
    } else if (percentage <= 70) {
      personality = "Balanced Investor";
      riskAppetite = "moderate";
      description = "You seek a balance between risk and returns. A mix of bonds, mutual funds, and ETFs works for you.";
    } else {
      personality = "Aggressive Investor";
      riskAppetite = "high";
      description = "You're comfortable with high risk for potentially high returns. Equity funds and high-yield investments suit you.";
    }

    setResult({ personality, riskAppetite, description, score: totalScore, maxScore });

    // Update user profile if authenticated
    if (isAuthenticated()) {
      setLoading(true);
      try {
        const response = await authAPI.updateProfile({ risk_appetite: riskAppetite });
        const token = localStorage.getItem('token');
        saveAuth(token, response.data.data.user);
      } catch (err) {
        console.error('Failed to update profile:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-2">Investment Personality Quiz</h1>
          <p className="text-gray-600 text-center mb-6">Discover your investment style</p>

          {!result ? (
            <>
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {questions[currentQuestion].question}
                </h2>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.score)}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Back button */}
              {currentQuestion > 0 && (
                <button
                  onClick={() => {
                    setCurrentQuestion(currentQuestion - 1);
                    setAnswers(answers.slice(0, -1));
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
              )}
            </>
          ) : (
            /* Results */
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">
                  {result.riskAppetite === 'low' ? '🛡️' : result.riskAppetite === 'moderate' ? '⚖️' : '🚀'}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{result.personality}</h2>
                <p className="text-gray-600 mb-4">{result.description}</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="spinner"></div>
                </div>
              ) : (
                <>
                  {isAuthenticated() && (
                    <p className="text-green-600 font-medium mb-6">
                      ✓ Your profile has been updated with your risk appetite
                    </p>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={() => router.push(`/products?risk=${result.riskAppetite}`)}
                      className="w-full btn btn-primary"
                    >
                      View Suggested Products
                    </button>
                    <button
                      onClick={restart}
                      className="w-full btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full text-gray-600 hover:text-gray-900"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
