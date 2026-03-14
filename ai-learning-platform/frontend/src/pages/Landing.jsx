import { Link } from 'react-router-dom'
import {
  AcademicCapIcon,
  SparklesIcon,
  ChartBarIcon,
  BookOpenIcon,
  UserGroupIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: SparklesIcon,
      title: "AI-Powered Learning",
      description: "Get personalized tutoring and instant answers to your questions",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BookOpenIcon,
      title: "Smart Study Materials",
      description: "Upload PDFs, documents, and get AI-generated summaries and notes",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ChartBarIcon,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics and insights",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: UserGroupIcon,
      title: "Collaborative Learning",
      description: "Join study groups and learn together with peers",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: LightBulbIcon,
      title: "Interactive Quizzes",
      description: "Test your knowledge with AI-generated quizzes and flashcards",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: AcademicCapIcon,
      title: "Expert Content",
      description: "Access curated content from top educators worldwide",
      color: "from-pink-500 to-rose-500"
    }
  ]

  const testimonials = [
    { name: "Sarah Chen", role: "Computer Science Student", text: "This platform transformed how I study. The AI tutor is like having a personal teacher 24/7!" },
    { name: "Michael Rodriguez", role: "Medical Student", text: "The flashcards and quiz features helped me ace my exams. Couldn't imagine studying without it." },
    { name: "Emily Johnson", role: "High School Teacher", text: "My students love the interactive features. It makes learning engaging and fun!" }
  ]

  const stats = [
    { value: "50K+", label: "Active Learners" },
    { value: "1M+", label: "Questions Answered" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "AI Support" }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-effect shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">LearnAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#testimonials" className="nav-link">Testimonials</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-10 animate-gradient"></div>
        <div className="container mx-auto px-6 pt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full mb-6 animate-pulse-slow">
              <StarIcon className="h-5 w-5" />
              <span className="font-semibold">Trusted by 50,000+ learners</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Learn Smarter with
              <span className="gradient-text"> AI-Powered</span>
              <br />Education
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Upload your study materials, get instant AI tutoring, generate quizzes,
              and track your progress — all in one intelligent platform designed for modern learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/register" className="btn-primary text-lg flex items-center justify-center group">
                Start Learning Free
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary text-lg">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                  <div className="text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-xl text-gray-600">Powerful features designed to accelerate your learning journey</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="card card-hover group">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Learners Worldwide</h2>
            <p className="text-xl text-gray-600">See what our users have to say about their experience</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="card">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary-600 mr-4"></div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of students achieving their academic goals with AI-powered learning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105">
              Start Free Trial
            </Link>
            <Link to="/login" className="text-white border-2 border-white/50 hover:border-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition-all">
              Sign In
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-white/80">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <SparklesIcon className="h-8 w-8" />
              <span className="text-2xl font-bold">LearnAI</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            © 2024 LearnAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}