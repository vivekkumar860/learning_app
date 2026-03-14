const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

// In-memory bug storage (use database in production)
let bugReports = []
let fixHistory = []

// Bug detection patterns
const bugPatterns = {
  critical: [
    { pattern: /JSON\.parse\s*\(\s*localStorage\.getItem/g, message: 'Unsafe localStorage parsing' },
    { pattern: /eval\s*\(/g, message: 'Dangerous eval() usage' },
    { pattern: /innerHTML\s*=/g, message: 'Potential XSS vulnerability' }
  ],
  high: [
    { pattern: /async.*(?!try.*catch)/g, message: 'Async without error handling' },
    { pattern: /\.then\([^)]*\)(?!.*\.catch)/g, message: 'Promise without catch' }
  ],
  medium: [
    { pattern: /console\.(log|error|warn)/g, message: 'Console statements in code' },
    { pattern: /TODO|FIXME/g, message: 'Unresolved TODO/FIXME' }
  ]
}

// Scan code for bugs
function scanCode(code, filename = 'unknown') {
  const bugs = []
  let bugId = 0

  Object.entries(bugPatterns).forEach(([severity, patterns]) => {
    patterns.forEach(({ pattern, message }) => {
      const matches = code.matchAll(pattern)
      for (const match of matches) {
        const lines = code.substring(0, match.index).split('\n')
        bugs.push({
          id: `${filename}-${bugId++}`,
          file: filename,
          severity,
          message,
          line: lines.length,
          column: lines[lines.length - 1].length,
          snippet: match[0].substring(0, 100),
          timestamp: new Date().toISOString()
        })
      }
    })
  })

  return bugs
}

// API Endpoints

// POST /api/bugs/scan - Scan code for bugs
router.post('/scan', upload.single('code'), async (req, res) => {
  try {
    let code, filename

    if (req.file) {
      // File upload
      code = req.file.buffer.toString()
      filename = req.file.originalname
    } else if (req.body.code) {
      // Direct code submission
      code = req.body.code
      filename = req.body.filename || 'inline-code.js'
    } else {
      return res.status(400).json({ error: 'No code provided' })
    }

    const bugs = scanCode(code, filename)

    // Store report
    const report = {
      id: Date.now().toString(),
      filename,
      bugs,
      timestamp: new Date().toISOString(),
      stats: {
        total: bugs.length,
        critical: bugs.filter(b => b.severity === 'critical').length,
        high: bugs.filter(b => b.severity === 'high').length,
        medium: bugs.filter(b => b.severity === 'medium').length,
        low: bugs.filter(b => b.severity === 'low').length
      }
    }

    bugReports.push(report)

    res.json({
      success: true,
      report
    })
  } catch (error) {
    console.error('Bug scan error:', error)
    res.status(500).json({ error: 'Failed to scan code' })
  }
})

// GET /api/bugs/reports - Get all bug reports
router.get('/reports', (req, res) => {
  res.json({
    reports: bugReports.slice(-50), // Last 50 reports
    total: bugReports.length
  })
})

// GET /api/bugs/report/:id - Get specific bug report
router.get('/report/:id', (req, res) => {
  const report = bugReports.find(r => r.id === req.params.id)
  if (!report) {
    return res.status(404).json({ error: 'Report not found' })
  }
  res.json(report)
})

// POST /api/bugs/fix - Apply automated fix
router.post('/fix', async (req, res) => {
  try {
    const { bugId, code, fix } = req.body

    if (!bugId || !code) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Simple fix patterns
    const fixes = {
      'unsafe-localstorage': (code) => {
        return code.replace(
          /JSON\.parse\s*\(\s*localStorage\.getItem\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\)/g,
          `(() => {
            const data = localStorage.getItem('$1');
            try { return data ? JSON.parse(data) : null; }
            catch(e) { console.error('Parse error:', e); return null; }
          })()`
        )
      },
      'console-statements': (code) => {
        return code.replace(/console\.(log|error|warn|info)\([^)]*\)/g, '// $&')
      },
      'empty-catch': (code) => {
        return code.replace(
          /catch\s*\(\s*([^)]*)\s*\)\s*\{\s*\}/g,
          'catch ($1) { console.error("Error:", $1); }'
        )
      }
    }

    let fixedCode = code
    let appliedFixes = []

    // Apply requested fix or auto-detect
    if (fix && fixes[fix]) {
      fixedCode = fixes[fix](code)
      appliedFixes.push(fix)
    } else {
      // Auto-apply all applicable fixes
      Object.entries(fixes).forEach(([fixName, fixFn]) => {
        const result = fixFn(fixedCode)
        if (result !== fixedCode) {
          fixedCode = result
          appliedFixes.push(fixName)
        }
      })
    }

    // Record fix history
    const fixRecord = {
      id: Date.now().toString(),
      bugId,
      appliedFixes,
      timestamp: new Date().toISOString()
    }
    fixHistory.push(fixRecord)

    res.json({
      success: true,
      fixedCode,
      appliedFixes,
      fixRecord
    })
  } catch (error) {
    console.error('Fix error:', error)
    res.status(500).json({ error: 'Failed to apply fix' })
  }
})

// GET /api/bugs/fix-history - Get fix history
router.get('/fix-history', (req, res) => {
  res.json({
    history: fixHistory.slice(-50),
    total: fixHistory.length
  })
})

// POST /api/bugs/analyze-project - Analyze entire project
router.post('/analyze-project', async (req, res) => {
  try {
    const { files } = req.body

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Files array required' })
    }

    const projectReport = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      files: [],
      summary: {
        totalFiles: files.length,
        totalBugs: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    }

    // Analyze each file
    for (const file of files) {
      const bugs = scanCode(file.content, file.name)
      projectReport.files.push({
        name: file.name,
        bugs,
        bugCount: bugs.length
      })

      // Update summary
      projectReport.summary.totalBugs += bugs.length
      bugs.forEach(bug => {
        projectReport.summary[bug.severity]++
      })
    }

    // Generate recommendations
    projectReport.recommendations = []

    if (projectReport.summary.critical > 0) {
      projectReport.recommendations.push({
        priority: 'CRITICAL',
        message: 'Fix critical security vulnerabilities immediately'
      })
    }

    if (projectReport.summary.high > 5) {
      projectReport.recommendations.push({
        priority: 'HIGH',
        message: 'Refactor error handling patterns'
      })
    }

    if (projectReport.summary.medium > 10) {
      projectReport.recommendations.push({
        priority: 'MEDIUM',
        message: 'Schedule technical debt cleanup'
      })
    }

    res.json({
      success: true,
      report: projectReport
    })
  } catch (error) {
    console.error('Project analysis error:', error)
    res.status(500).json({ error: 'Failed to analyze project' })
  }
})

// WebSocket support for real-time bug detection
router.ws = (ws) => {
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg)

      if (data.type === 'scan') {
        const bugs = scanCode(data.code, data.filename)
        ws.send(JSON.stringify({
          type: 'scan-result',
          bugs,
          timestamp: new Date().toISOString()
        }))
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }))
    }
  })
}

module.exports = router