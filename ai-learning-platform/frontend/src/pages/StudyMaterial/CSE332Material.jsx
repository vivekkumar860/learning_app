import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpenIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import materialData from '../../../processed_materials/CSE332/metadata.json'
import quizData from '../../../processed_materials/CSE332/quiz_questions.json'
import flashcardData from '../../../processed_materials/CSE332/flashcards.json'

export default function CSE332Material() {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState({})
  const [completedTopics, setCompletedTopics] = useState([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const [flippedCard, setFlippedCard] = useState(false)

  const units = [
    {
      id: 'unit1',
      title: 'Unit I - Ethics',
      topics: [
        'Definition of Ethics',
        'Importance of Integrity',
        'Ethics in Business World',
        'Corporate Culture & Ethics'
      ],
      description: 'Philosophical and practical foundation of ethics in personal conduct and business'
    },
    {
      id: 'unit2',
      title: 'Unit II - Ethics in IT',
      topics: [
        'IT Professional Ethics',
        'Privacy & Data Protection',
        'Digital Rights',
        'Ethical Hacking'
      ],
      description: 'Ethical considerations specific to information technology professionals'
    },
    {
      id: 'unit3',
      title: 'Unit III - Intellectual Property',
      topics: [
        'Copyright Law',
        'Patents',
        'Trademarks',
        'Trade Secrets'
      ],
      description: 'Legal frameworks protecting creative and intellectual works'
    },
    {
      id: 'unit4',
      title: 'Unit IV - Cyber Law',
      topics: [
        'IT Act 2000',
        'Cyber Crimes',
        'Digital Signatures',
        'E-Commerce Regulations'
      ],
      description: 'Legal aspects of cyberspace and digital transactions'
    },
    {
      id: 'unit5',
      title: 'Unit V - Professional Ethics',
      topics: [
        'Professional Codes of Conduct',
        'Workplace Ethics',
        'Whistleblowing',
        'Corporate Social Responsibility'
      ],
      description: 'Standards and responsibilities in professional environments'
    },
    {
      id: 'unit6',
      title: 'Unit VI - Legal Compliance',
      topics: [
        'Regulatory Frameworks',
        'Data Protection Laws',
        'International Standards',
        'Compliance Auditing'
      ],
      description: 'Understanding and implementing legal requirements in IT'
    }
  ]

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const markTopicComplete = (topic) => {
    setCompletedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }

  const handleQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }))
  }

  const submitQuiz = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    quizData.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_answer) {
        correct++
      }
    })
    return correct
  }

  const nextCard = () => {
    if (currentCard < flashcardData.flashcards.length - 1) {
      setCurrentCard(currentCard + 1)
      setFlippedCard(false)
    }
  }

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setFlippedCard(false)
    }
  }

  const progressPercentage = Math.round((completedTopics.length / 24) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">CSE332 - Industry Ethics and Legal Issues</h1>
              <p className="text-primary-100">Complete Study Material for All 6 Units</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <div className="text-sm text-primary-100">Progress</div>
            </div>
          </div>
          <div className="w-full bg-primary-800 rounded-full h-2 mt-4">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {['overview', 'units', 'quiz', 'flashcards'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpenIcon className="h-6 w-6 mr-2 text-primary" />
                Course Overview
              </h2>
              <p className="text-gray-600 mb-4">
                This course covers the ethical and legal aspects of the IT industry, including
                professional ethics, intellectual property rights, cyber law, and compliance frameworks.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                  <span>6 comprehensive units</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                  <span>24 key topics</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                  <span>{quizData.questions.length} quiz questions</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                  <span>{flashcardData.flashcards.length} flashcards</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AcademicCapIcon className="h-6 w-6 mr-2 text-primary" />
                Learning Outcomes
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Understand ethical theories and their application in IT</li>
                <li>• Apply professional codes of conduct in real-world scenarios</li>
                <li>• Navigate intellectual property laws and regulations</li>
                <li>• Comprehend cyber law and digital compliance requirements</li>
                <li>• Make ethical decisions in complex professional situations</li>
                <li>• Implement legal and regulatory compliance in IT projects</li>
              </ul>
            </div>

            <div className="card md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{units.length}</div>
                  <div className="text-sm text-gray-600">Units</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">24</div>
                  <div className="text-sm text-gray-600">Topics</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{quizData.questions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{flashcardData.flashcards.length}</div>
                  <div className="text-sm text-gray-600">Flashcards</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="space-y-4">
            {units.map(unit => (
              <div key={unit.id} className="card">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection(unit.id)}
                >
                  <div>
                    <h3 className="text-lg font-semibold">{unit.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                  </div>
                  {expandedSections[unit.id] ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {expandedSections[unit.id] && (
                  <div className="mt-4 space-y-2">
                    {unit.topics.map(topic => (
                      <div
                        key={topic}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          completedTopics.includes(topic)
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="text-sm font-medium">{topic}</span>
                        <button
                          onClick={() => markTopicComplete(topic)}
                          className={`p-1 rounded ${
                            completedTopics.includes(topic)
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="card">
            {!showQuiz ? (
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Test Your Knowledge</h2>
                <p className="text-gray-600 mb-6">
                  Take a quiz to test your understanding of Ethics and Legal Issues
                </p>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="btn-primary"
                >
                  Start Quiz ({quizData.questions.length} Questions)
                </button>
              </div>
            ) : showResults ? (
              <div className="text-center py-12">
                <div className="text-6xl font-bold text-primary mb-4">
                  {calculateScore()}/{quizData.questions.length}
                </div>
                <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-gray-600 mb-6">
                  You scored {Math.round((calculateScore() / quizData.questions.length) * 100)}%
                </p>
                <div className="space-y-4 max-w-2xl mx-auto text-left">
                  {quizData.questions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-2">{q.question}</p>
                      <p className={quizAnswers[idx] === q.correct_answer ? 'text-green-600' : 'text-red-600'}>
                        Your answer: {q.options[quizAnswers[idx]] || 'Not answered'}
                      </p>
                      {quizAnswers[idx] !== q.correct_answer && (
                        <p className="text-green-600 text-sm mt-1">
                          Correct: {q.options[q.correct_answer]}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-gray-600 text-sm mt-2">{q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowQuiz(false)
                    setShowResults(false)
                    setQuizAnswers({})
                    setCurrentQuestion(0)
                  }}
                  className="btn-primary mt-6"
                >
                  Take Quiz Again
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Question {currentQuestion + 1} of {quizData.questions.length}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {Object.keys(quizAnswers).length} answered
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-lg font-medium mb-4">
                    {quizData.questions[currentQuestion].question}
                  </p>
                  <div className="space-y-3">
                    {quizData.questions[currentQuestion].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(currentQuestion, idx)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          quizAnswers[currentQuestion] === idx
                            ? 'border-primary bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {currentQuestion === quizData.questions.length - 1 ? (
                    <button
                      onClick={submitQuiz}
                      className="btn-primary"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="btn-primary"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="card">
            {!showFlashcards ? (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Study with Flashcards</h2>
                <p className="text-gray-600 mb-6">
                  Review key concepts with interactive flashcards
                </p>
                <button
                  onClick={() => setShowFlashcards(true)}
                  className="btn-primary"
                >
                  Start Flashcards ({flashcardData.flashcards.length} Cards)
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Card {currentCard + 1} of {flashcardData.flashcards.length}
                  </h2>
                  <button
                    onClick={() => {
                      setShowFlashcards(false)
                      setCurrentCard(0)
                      setFlippedCard(false)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Exit
                  </button>
                </div>

                <div
                  className="relative h-64 cursor-pointer"
                  onClick={() => setFlippedCard(!flippedCard)}
                >
                  <div className={`absolute inset-0 w-full h-full transition-all duration-500 transform-style-preserve-3d ${
                    flippedCard ? 'rotate-y-180' : ''
                  }`}>
                    {/* Front of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden">
                      <div className="h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 flex items-center justify-center text-white">
                        <div className="text-center">
                          <p className="text-2xl font-semibold">
                            {flashcardData.flashcards[currentCard].front}
                          </p>
                          <p className="text-sm mt-4 opacity-75">Click to flip</p>
                        </div>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                      <div className="h-full bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 flex items-center justify-center text-white">
                        <div className="text-center">
                          <p className="text-lg">
                            {flashcardData.flashcards[currentCard].back}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={prevCard}
                    disabled={currentCard === 0}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    {currentCard + 1} / {flashcardData.flashcards.length}
                  </span>
                  <button
                    onClick={nextCard}
                    disabled={currentCard === flashcardData.flashcards.length - 1}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}