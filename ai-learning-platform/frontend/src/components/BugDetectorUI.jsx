import React, { useState, useEffect } from 'react'
import { BugDetector, BugMonitor } from '../utils/bugDetector'
import { AutomatedBugScanner, MLBugPredictor } from '../utils/bugScanner'

export default function BugDetectorUI() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState(null)
  const [realTimeErrors, setRealTimeErrors] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [monitor] = useState(() => new BugMonitor())
  const [detector] = useState(() => new BugDetector())
  const [predictor] = useState(() => new MLBugPredictor())

  useEffect(() => {
    // Setup real-time error monitoring
    monitor.setupErrorListeners()

    // Update real-time errors every 2 seconds
    const interval = setInterval(() => {
      const report = monitor.getRealTimeReport()
      setRealTimeErrors(report.errors)
    }, 2000)

    return () => clearInterval(interval)
  }, [monitor])

  const scanCurrentFile = async () => {
    if (!selectedFile) return

    setIsScanning(true)
    try {
      // Read file content (in real app, would use FileReader API)
      const content = selectedFile.content

      // Run bug detection
      const bugs = detector.scanFile(content, selectedFile.name)

      // Run ML predictions
      const predictions = predictor.predict(content)

      // Generate report
      const report = detector.generateReport(bugs)
      report.predictions = predictions

      setScanResults(report)
    } catch (error) {
      console.error('Scan failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const scanAllFiles = async () => {
    setIsScanning(true)
    try {
      const scanner = new AutomatedBugScanner()

      // Mock scanning multiple files
      const mockFiles = [
        { path: '/src/App.jsx', bugs: 3 },
        { path: '/src/api/auth.js', bugs: 2 },
        { path: '/src/hooks/useAuth.js', bugs: 1 },
        { path: '/src/components/Dashboard.jsx', bugs: 0 }
      ]

      const allBugs = []
      for (const file of mockFiles) {
        // Simulate scanning
        await new Promise(resolve => setTimeout(resolve, 500))

        // Generate mock bugs
        for (let i = 0; i < file.bugs; i++) {
          allBugs.push({
            severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
            type: 'pattern',
            message: `Issue found in ${file.path}`,
            location: `${file.path}:${Math.floor(Math.random() * 100)}`,
            fix: 'Review and fix the issue'
          })
        }
      }

      const report = detector.generateReport(allBugs)
      setScanResults(report)
    } catch (error) {
      console.error('Full scan failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const clearResults = () => {
    setScanResults(null)
    monitor.clearErrors()
    setRealTimeErrors([])
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🐛 Bug Detection Model
            </h1>
            <div className="flex gap-2">
              <button
                onClick={scanCurrentFile}
                disabled={isScanning || !selectedFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Scan Current File
              </button>
              <button
                onClick={scanAllFiles}
                disabled={isScanning}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? 'Scanning...' : 'Scan All Files'}
              </button>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Real-time Error Monitor */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              📊 Real-time Error Monitor
              {realTimeErrors.length > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                  {realTimeErrors.length} errors
                </span>
              )}
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
              {realTimeErrors.length === 0 ? (
                <div className="text-gray-500">No runtime errors detected</div>
              ) : (
                realTimeErrors.map((error, idx) => (
                  <div key={idx} className="mb-2">
                    <span className="text-red-400">[{error.type}]</span> {error.message || error.reason}
                    <div className="text-xs text-gray-500">{error.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scan Results */}
          {scanResults && (
            <div className="space-y-6">
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{scanResults.summary.total}</div>
                  <div className="text-sm text-gray-600">Total Issues</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{scanResults.summary.critical}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{scanResults.summary.high}</div>
                  <div className="text-sm text-gray-600">High</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{scanResults.summary.medium}</div>
                  <div className="text-sm text-gray-600">Medium</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{scanResults.summary.low}</div>
                  <div className="text-sm text-gray-600">Low</div>
                </div>
              </div>

              {/* Bug List */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Detected Issues</h2>
                <div className="space-y-2">
                  {scanResults.bugs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ✨ No bugs detected! Your code looks clean.
                    </div>
                  ) : (
                    scanResults.bugs.slice(0, 10).map((bug, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${getSeverityColor(bug.severity)} border-opacity-50`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getSeverityIcon(bug.severity)}</span>
                              <span className="font-semibold">{bug.message}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(bug.severity)}`}>
                                {bug.severity.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              📍 Location: <code className="bg-gray-100 px-2 py-1 rounded">{bug.location}</code>
                            </div>
                            {bug.snippet && (
                              <div className="text-sm text-gray-700 mb-2">
                                Code: <code className="bg-gray-100 px-2 py-1 rounded">{bug.snippet}</code>
                              </div>
                            )}
                            <div className="text-sm text-green-700">
                              💡 Fix: {bug.fix}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ML Predictions */}
              {scanResults.predictions && scanResults.predictions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">🤖 ML Predictions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scanResults.predictions.map((prediction, idx) => (
                      <div key={idx} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-purple-900">{prediction.message}</span>
                          <span className="text-sm bg-purple-200 text-purple-900 px-2 py-1 rounded">
                            {prediction.confidence}% confidence
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Type: {prediction.type.replace('-', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Input Simulator */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Test File Content (Paste code to analyze)</h3>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="Paste JavaScript/React code here to analyze..."
              onChange={(e) => setSelectedFile({
                name: 'test.js',
                content: e.target.value
              })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}