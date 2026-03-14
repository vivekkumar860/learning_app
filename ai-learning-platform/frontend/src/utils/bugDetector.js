export class BugDetector {
  constructor() {
    this.patterns = {
      critical: [
        {
          pattern: /JSON\.parse\s*\(\s*localStorage\.getItem/g,
          message: 'Unsafe localStorage parsing without null check',
          fix: 'Add null/undefined check before JSON.parse'
        },
        {
          pattern: /atob\s*\([^)]*\)(?!.*catch)/g,
          message: 'Unsafe base64 decoding without error handling',
          fix: 'Wrap atob in try-catch block'
        },
        {
          pattern: /\.split\s*\(\s*['"]\.['"]?\s*\)\s*\[\s*\d+\s*\]/g,
          message: 'Array access without bounds checking',
          fix: 'Check array length before accessing index'
        },
        {
          pattern: /await\s+fetch[^}]*(?!\.catch|\stry)/g,
          message: 'Unhandled fetch promise rejection',
          fix: 'Add try-catch or .catch() handler'
        }
      ],
      high: [
        {
          pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*(?:fetch|axios|api)[^}]*\}(?!.*catch)/g,
          message: 'API call in useEffect without error handling',
          fix: 'Add .catch() or try-catch in useEffect'
        },
        {
          pattern: /key\s*=\s*\{?\s*(?:i|index)\s*\}?/g,
          message: 'Using array index as React key',
          fix: 'Use stable unique identifier as key'
        },
        {
          pattern: /useCallback\s*\([^,]*,\s*\[[^\]]*\]\s*\)/g,
          message: 'Potentially missing dependencies in useCallback',
          fix: 'Review and add all dependencies to array'
        },
        {
          pattern: /setState\s*\(\s*[^(]/g,
          message: 'Direct state mutation',
          fix: 'Use functional setState or spread operator'
        }
      ],
      medium: [
        {
          pattern: /console\.(log|error|warn|info)/g,
          message: 'Console statements in production code',
          fix: 'Remove or use proper logging service'
        },
        {
          pattern: /\/\/\s*TODO|FIXME|HACK/gi,
          message: 'Unresolved TODO/FIXME comment',
          fix: 'Address the TODO item'
        },
        {
          pattern: /catch\s*\(\s*[^)]*\)\s*\{\s*\}/g,
          message: 'Empty catch block',
          fix: 'Handle or log the error'
        },
        {
          pattern: /import\s+\*\s+as/g,
          message: 'Wildcard import may affect tree shaking',
          fix: 'Use named imports'
        }
      ],
      low: [
        {
          pattern: /var\s+\w+\s*=/g,
          message: 'Using var instead of let/const',
          fix: 'Use let or const instead'
        },
        {
          pattern: /==(?!=)/g,
          message: 'Using loose equality operator',
          fix: 'Use strict equality (===)'
        },
        {
          pattern: /\+\s*['"]|['"]\s*\+/g,
          message: 'String concatenation instead of template literals',
          fix: 'Use template literals'
        }
      ]
    }

    this.contextualChecks = {
      missingErrorBoundary: (content) => {
        return !content.includes('componentDidCatch') &&
               !content.includes('ErrorBoundary') &&
               content.includes('export default')
      },
      missingPropTypes: (content) => {
        return content.includes('props.') &&
               !content.includes('PropTypes') &&
               !content.includes('interface') &&
               !content.includes('.ts')
      },
      asyncWithoutAwait: (content) => {
        const asyncFuncs = content.match(/async\s+(?:function\s+)?\w+\s*\([^)]*\)\s*\{[^}]*\}/g) || []
        return asyncFuncs.some(func => !func.includes('await'))
      },
      unusedImports: (content) => {
        const imports = content.match(/import\s+(?:\{[^}]*\}|\w+)\s+from/g) || []
        const unused = []
        imports.forEach(imp => {
          const match = imp.match(/import\s+\{?(\w+)/)
          if (match && match[1]) {
            const name = match[1]
            const usageRegex = new RegExp(`(?<!import.*|export.*|//.*|/\\*.*|\\*.*/)\\b${name}\\b`)
            if (!usageRegex.test(content.replace(imp, ''))) {
              unused.push(name)
            }
          }
        })
        return unused
      }
    }
  }

  scanFile(content, filePath) {
    const bugs = []

    // Pattern-based detection
    Object.entries(this.patterns).forEach(([severity, patterns]) => {
      patterns.forEach(({ pattern, message, fix }) => {
        const matches = content.match(pattern) || []
        matches.forEach(match => {
          const lineNumber = this.getLineNumber(content, match)
          bugs.push({
            severity,
            type: 'pattern',
            message,
            fix,
            location: `${filePath}:${lineNumber}`,
            snippet: match.substring(0, 100)
          })
        })
      })
    })

    // Contextual checks
    if (this.contextualChecks.missingErrorBoundary(content)) {
      bugs.push({
        severity: 'medium',
        type: 'structural',
        message: 'Component missing error boundary',
        fix: 'Add error boundary or wrap in existing one',
        location: filePath
      })
    }

    if (this.contextualChecks.asyncWithoutAwait(content)) {
      bugs.push({
        severity: 'medium',
        type: 'async',
        message: 'Async function without await',
        fix: 'Remove async or add await',
        location: filePath
      })
    }

    const unusedImports = this.contextualChecks.unusedImports(content)
    if (unusedImports.length > 0) {
      bugs.push({
        severity: 'low',
        type: 'imports',
        message: `Unused imports: ${unusedImports.join(', ')}`,
        fix: 'Remove unused imports',
        location: filePath
      })
    }

    return bugs
  }

  getLineNumber(content, match) {
    const index = content.indexOf(match)
    return content.substring(0, index).split('\n').length
  }

  generateReport(bugs) {
    const report = {
      summary: {
        total: bugs.length,
        critical: bugs.filter(b => b.severity === 'critical').length,
        high: bugs.filter(b => b.severity === 'high').length,
        medium: bugs.filter(b => b.severity === 'medium').length,
        low: bugs.filter(b => b.severity === 'low').length
      },
      bugs: bugs.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      }),
      timestamp: new Date().toISOString()
    }

    return report
  }
}

export class BugMonitor {
  constructor() {
    this.detector = new BugDetector()
    this.history = []
    this.realTimeErrors = []
  }

  setupErrorListeners() {
    // Catch unhandled errors
    window.addEventListener('error', (e) => {
      this.realTimeErrors.push({
        type: 'runtime-error',
        message: e.message,
        stack: e.error?.stack,
        timestamp: new Date().toISOString(),
        severity: 'critical'
      })
    })

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.realTimeErrors.push({
        type: 'promise-rejection',
        reason: e.reason,
        timestamp: new Date().toISOString(),
        severity: 'high'
      })
    })

    // Monitor React errors
    if (window.React) {
      const originalError = console.error
      console.error = (...args) => {
        if (args[0]?.includes?.('React')) {
          this.realTimeErrors.push({
            type: 'react-error',
            message: args.join(' '),
            timestamp: new Date().toISOString(),
            severity: 'high'
          })
        }
        originalError.apply(console, args)
      }
    }

    // Monitor network failures
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          this.realTimeErrors.push({
            type: 'network-error',
            url: args[0],
            status: response.status,
            timestamp: new Date().toISOString(),
            severity: 'medium'
          })
        }
        return response
      } catch (error) {
        this.realTimeErrors.push({
          type: 'network-failure',
          url: args[0],
          error: error.message,
          timestamp: new Date().toISOString(),
          severity: 'high'
        })
        throw error
      }
    }
  }

  getRealTimeReport() {
    return {
      errors: this.realTimeErrors,
      count: this.realTimeErrors.length,
      lastError: this.realTimeErrors[this.realTimeErrors.length - 1],
      criticalCount: this.realTimeErrors.filter(e => e.severity === 'critical').length
    }
  }

  clearErrors() {
    this.realTimeErrors = []
  }
}

// Export utilities
export const scanProject = async (filePatterns = ['**/*.js', '**/*.jsx']) => {
  const detector = new BugDetector()
  const allBugs = []

  // This would need to be integrated with your file system access
  // For now, returning a function that can be called with file content
  return {
    scanFile: (content, path) => detector.scanFile(content, path),
    generateReport: (bugs) => detector.generateReport(bugs)
  }
}

export default BugDetector