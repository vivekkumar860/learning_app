import React, { useState, useEffect } from 'react'
import { BugDetector, BugMonitor } from '../utils/bugDetector'
import { AutomatedBugFixer, SmartFixSuggester } from '../utils/bugFixer'
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function BugDashboard() {
  const [stats, setStats] = useState({
    totalBugs: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    fixed: 0,
    pending: 0
  })

  const [recentBugs, setRecentBugs] = useState([])
  const [fixHistory, setFixHistory] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [selectedBug, setSelectedBug] = useState(null)
  const [autoFixEnabled, setAutoFixEnabled] = useState(true)
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true)

  const detector = new BugDetector()
  const fixer = new AutomatedBugFixer()
  const suggester = new SmartFixSuggester()
  const monitor = new BugMonitor()

  useEffect(() => {
    if (realTimeMonitoring) {
      monitor.setupErrorListeners()
      const interval = setInterval(() => {
        const report = monitor.getRealTimeReport()
        updateRealTimeBugs(report.errors)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [realTimeMonitoring])

  const updateRealTimeBugs = (errors) => {
    setRecentBugs(prev => {
      const newBugs = errors.filter(e =>
        !prev.find(b => b.timestamp === e.timestamp)
      )
      return [...newBugs, ...prev].slice(0, 20)
    })
  }

  const scanProject = async () => {
    setIsScanning(true)
    try {
      // Simulate scanning project files
      const mockFiles = [
        { name: 'App.jsx', bugs: 3 },
        { name: 'api/auth.js', bugs: 2 },
        { name: 'hooks/useAuth.js', bugs: 1 },
        { name: 'components/Dashboard.jsx', bugs: 4 }
      ]

      const allBugs = []
      for (const file of mockFiles) {
        await new Promise(r => setTimeout(r, 500))
        for (let i = 0; i < file.bugs; i++) {
          const severities = ['critical', 'high', 'medium', 'low']
          const severity = severities[Math.floor(Math.random() * 4)]
          allBugs.push({
            id: `${file.name}-${i}`,
            file: file.name,
            severity,
            type: 'pattern',
            message: `Issue in ${file.name}`,
            line: Math.floor(Math.random() * 100),
            fixed: false,
            timestamp: new Date().toISOString()
          })
        }
      }

      setRecentBugs(allBugs)
      updateStats(allBugs)
    } finally {
      setIsScanning(false)
    }
  }

  const updateStats = (bugs) => {
    const stats = {
      totalBugs: bugs.length,
      critical: bugs.filter(b => b.severity === 'critical').length,
      high: bugs.filter(b => b.severity === 'high').length,
      medium: bugs.filter(b => b.severity === 'medium').length,
      low: bugs.filter(b => b.severity === 'low').length,
      fixed: bugs.filter(b => b.fixed).length,
      pending: bugs.filter(b => !b.fixed).length
    }
    setStats(stats)
  }

  const autoFixBug = async (bug) => {
    // Simulate auto-fixing
    await new Promise(r => setTimeout(r, 1000))

    setRecentBugs(prev =>
      prev.map(b => b.id === bug.id ? { ...b, fixed: true } : b)
    )

    setFixHistory(prev => [{
      bugId: bug.id,
      file: bug.file,
      fixType: 'automatic',
      timestamp: new Date().toISOString(),
      description: `Fixed ${bug.message}`
    }, ...prev].slice(0, 10))

    setStats(prev => ({
      ...prev,
      fixed: prev.fixed + 1,
      pending: prev.pending - 1
    }))
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🔴'
      case 'high': return '🟠'
      case 'medium': return '🟡'
      case 'low': return '🔵'
      default: return '⚪'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheckIcon className="h-8 w-8 text-primary" />
            Bug Detection Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Real-time bug monitoring and automated fixing</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={scanProject}
                disabled={isScanning}
                className="btn-primary flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <ClockIcon className="h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <CodeBracketIcon className="h-5 w-5" />
                    Scan Project
                  </>
                )}
              </button>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoFixEnabled}
                  onChange={(e) => setAutoFixEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Auto-fix enabled</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={realTimeMonitoring}
                  onChange={(e) => setRealTimeMonitoring(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Real-time monitoring</span>
              </label>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={`h-2 w-2 rounded-full ${realTimeMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {realTimeMonitoring ? 'Monitoring active' : 'Monitoring paused'}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bugs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBugs}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg shadow p-4 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
              </div>
              <span className="text-2xl">🔴</span>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg shadow p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">High</p>
                <p className="text-2xl font-bold text-orange-900">{stats.high}</p>
              </div>
              <span className="text-2xl">🟠</span>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Medium</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.medium}</p>
              </div>
              <span className="text-2xl">🟡</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Low</p>
                <p className="text-2xl font-bold text-blue-900">{stats.low}</p>
              </div>
              <span className="text-2xl">🔵</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Fixed</p>
                <p className="text-2xl font-bold text-green-900">{stats.fixed}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bugs */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                Recent Bugs
              </h2>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {recentBugs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No bugs detected yet. Click "Scan Project" to start.
                </p>
              ) : (
                recentBugs.map((bug) => (
                  <div
                    key={bug.id || bug.timestamp}
                    className={`p-4 rounded-lg border ${getSeverityColor(bug.severity)} ${
                      bug.fixed ? 'opacity-60' : ''
                    } cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => setSelectedBug(bug)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getSeverityIcon(bug.severity)}</span>
                          <span className="font-semibold">{bug.file || bug.type}</span>
                          {bug.fixed && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                              FIXED
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-1">{bug.message}</p>
                        <p className="text-xs opacity-75">
                          Line {bug.line || 'N/A'} • {new Date(bug.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!bug.fixed && autoFixEnabled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            autoFixBug(bug)
                          }}
                          className="ml-4 px-3 py-1 bg-white rounded text-sm font-medium hover:bg-gray-50"
                        >
                          Auto-fix
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fix History & Suggestions */}
          <div className="space-y-6">
            {/* Fix History */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-green-500" />
                  Fix History
                </h2>
              </div>
              <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
                {fixHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm">
                    No fixes applied yet
                  </p>
                ) : (
                  fixHistory.map((fix, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{fix.file}</p>
                          <p className="text-gray-600">{fix.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(fix.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
                Performance
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Fix Rate</span>
                    <span className="font-medium">
                      {stats.totalBugs > 0
                        ? Math.round((stats.fixed / stats.totalBugs) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.totalBugs > 0
                          ? (stats.fixed / stats.totalBugs) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Critical Resolution</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Scan Coverage</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bug Details Modal */}
        {selectedBug && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedBug(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Bug Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">File:</span>
                    <p className="font-medium">{selectedBug.file || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Severity:</span>
                    <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getSeverityColor(selectedBug.severity)}`}>
                      {selectedBug.severity.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Message:</span>
                    <p className="font-medium">{selectedBug.message}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Suggested Fix:</span>
                    <p className="font-mono text-sm bg-gray-100 p-3 rounded mt-1">
                      {selectedBug.fix || 'Review and fix the issue manually'}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  {!selectedBug.fixed && (
                    <button
                      onClick={() => {
                        autoFixBug(selectedBug)
                        setSelectedBug(null)
                      }}
                      className="btn-primary"
                    >
                      Apply Auto-fix
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBug(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}