import { BugDetector, BugMonitor } from './bugDetector'
import { AutomatedBugScanner, MLBugPredictor } from './bugScanner'

// Test suite for Bug Detection Model
export const runTests = () => {
  console.log('🧪 Running Bug Detection Model Tests...\n')

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  // Test 1: Detect unsafe localStorage parsing
  test(() => {
    const detector = new BugDetector()
    const code = `
      const data = JSON.parse(localStorage.getItem('user'))
      console.log(data.name)
    `
    const bugs = detector.scanFile(code, 'test.js')
    return bugs.some(b => b.message.includes('Unsafe localStorage'))
  }, 'Detect unsafe localStorage parsing', results)

  // Test 2: Detect missing error handling in fetch
  test(() => {
    const detector = new BugDetector()
    const code = `
      async function getData() {
        const response = await fetch('/api/data')
        return response.json()
      }
    `
    const bugs = detector.scanFile(code, 'test.js')
    return bugs.some(b => b.message.includes('fetch'))
  }, 'Detect unhandled fetch promise', results)

  // Test 3: Detect React key prop issues
  test(() => {
    const detector = new BugDetector()
    const code = `
      items.map((item, i) => <div key={i}>{item}</div>)
    `
    const bugs = detector.scanFile(code, 'test.jsx')
    return bugs.some(b => b.message.includes('React key'))
  }, 'Detect React key prop issues', results)

  // Test 4: Detect security vulnerabilities
  test(() => {
    const scanner = new AutomatedBugScanner()
    const code = `
      const apiKey = "sk-1234567890abcdef"
      const query = \`SELECT * FROM users WHERE id = \${userId}\`
    `
    const vulnerabilities = scanner.detectSecurityVulnerabilities(code)
    return vulnerabilities.length >= 2
  }, 'Detect security vulnerabilities', results)

  // Test 5: Detect performance issues
  test(() => {
    const scanner = new AutomatedBugScanner()
    const code = `
      for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < items[i].length; j++) {
          process(items[i][j])
        }
      }
    `
    const issues = scanner.detectPerformanceIssues(code)
    return issues.some(i => i.type === 'nested-loops')
  }, 'Detect performance issues', results)

  // Test 6: Detect memory leaks
  test(() => {
    const scanner = new AutomatedBugScanner()
    const code = `
      useEffect(() => {
        window.addEventListener('resize', handleResize)
      }, [])
    `
    const leaks = scanner.detectMemoryLeaks(code)
    return leaks.some(l => l.type === 'event-listener-leak')
  }, 'Detect memory leaks', results)

  // Test 7: ML Predictions
  test(() => {
    const predictor = new MLBugPredictor()
    const code = `
      async function loadData() {
        const data = await fetchData()
        setState(data)
      }
    `
    const predictions = predictor.predict(code)
    return predictions.length > 0
  }, 'ML bug predictions', results)

  // Test 8: Empty catch blocks
  test(() => {
    const detector = new BugDetector()
    const code = `
      try {
        doSomething()
      } catch(e) {
        // Empty
      }
    `
    const bugs = detector.scanFile(code, 'test.js')
    return bugs.some(b => b.message.includes('Empty catch'))
  }, 'Detect empty catch blocks', results)

  // Test 9: Async function without await
  test(() => {
    const detector = new BugDetector()
    const code = `
      async function process() {
        console.log('processing')
        return true
      }
    `
    const bugs = detector.scanFile(code, 'test.js')
    return bugs.some(b => b.message.includes('Async function without await'))
  }, 'Detect async without await', results)

  // Test 10: Direct state mutation
  test(() => {
    const detector = new BugDetector()
    const code = `
      state.items.push(newItem)
      setState(state)
    `
    const bugs = detector.scanFile(code, 'test.js')
    return bugs.some(b => b.severity === 'high')
  }, 'Detect direct state mutation', results)

  // Print results
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Results Summary')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`)
  console.log('='.repeat(50))

  results.tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`)
  })

  return results
}

function test(fn, name, results) {
  try {
    const passed = fn()
    results.tests.push({ name, passed })
    if (passed) {
      results.passed++
      console.log(`✅ PASS: ${name}`)
    } else {
      results.failed++
      console.log(`❌ FAIL: ${name}`)
    }
  } catch (error) {
    results.failed++
    results.tests.push({ name, passed: false, error: error.message })
    console.log(`❌ ERROR: ${name} - ${error.message}`)
  }
}

// Live testing with real code samples
export const testRealCode = () => {
  console.log('\n🔍 Testing on Real Code Samples...\n')

  const detector = new BugDetector()
  const predictor = new MLBugPredictor()

  // Sample problematic React component
  const problematicCode = `
import React, { useState, useEffect } from 'react'

export default function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data))
    setLoading(false)
  }, [])  // Missing userId dependency

  const handleUpdate = () => {
    const token = JSON.parse(localStorage.getItem('token'))  // Unsafe
    user.name = 'New Name'  // Direct mutation
    setUser(user)
  }

  return (
    <div>
      {loading && <p>Loading...</p>}
      {user && (
        <div>
          <h1>{user.name}</h1>
          {user.posts.map((post, i) => (
            <div key={i}>{post.title}</div>  // Index as key
          ))}
        </div>
      )}
    </div>
  )
}
  `

  console.log('Analyzing problematic React component...')
  const bugs = detector.scanFile(problematicCode, 'UserProfile.jsx')
  const predictions = predictor.predict(problematicCode)

  console.log(`\nFound ${bugs.length} bugs:`)
  bugs.forEach(bug => {
    console.log(`  ${getSeverityEmoji(bug.severity)} [${bug.severity.toUpperCase()}] ${bug.message}`)
  })

  console.log(`\nML Predictions (${predictions.length}):`)
  predictions.forEach(pred => {
    console.log(`  🤖 ${pred.confidence}% - ${pred.message}`)
  })

  // Generate report
  const report = detector.generateReport(bugs)
  console.log('\n📊 Summary Report:')
  console.log(`  Total Issues: ${report.summary.total}`)
  console.log(`  Critical: ${report.summary.critical}`)
  console.log(`  High: ${report.summary.high}`)
  console.log(`  Medium: ${report.summary.medium}`)
  console.log(`  Low: ${report.summary.low}`)

  return report
}

function getSeverityEmoji(severity) {
  switch (severity) {
    case 'critical': return '🔴'
    case 'high': return '🟠'
    case 'medium': return '🟡'
    case 'low': return '🔵'
    default: return '⚪'
  }
}

// Run all tests if executed directly
if (typeof window === 'undefined') {
  console.log('🚀 Bug Detection Model Test Suite')
  console.log('=' .repeat(50))
  runTests()
  console.log('\n')
  testRealCode()
}

export default { runTests, testRealCode }