export class AutomatedBugFixer {
  constructor() {
    this.fixPatterns = this.initializeFixPatterns()
  }

  initializeFixPatterns() {
    return {
      // Unsafe localStorage parsing
      'unsafe-localstorage': {
        pattern: /JSON\.parse\s*\(\s*localStorage\.getItem\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\)/g,
        fix: (match, key) => `(() => {
  const data = localStorage.getItem('${key}')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to parse localStorage data:', error)
    return null
  }
})()`,
        description: 'Add null check and error handling for localStorage parsing'
      },

      // Missing useEffect dependencies
      'missing-dependencies': {
        pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([^}]+)\}\s*,\s*\[\s*\]\s*\)/g,
        fix: (match, body) => {
          const deps = this.extractDependencies(body)
          return `useEffect(() => {${body}}, [${deps.join(', ')}])`
        },
        description: 'Add missing dependencies to useEffect'
      },

      // React key with index
      'react-key-index': {
        pattern: /\.map\s*\(\s*\(([^,]+),\s*(?:i|index|idx)\)\s*=>\s*[^}]*key\s*=\s*\{?\s*(?:i|index|idx)\s*\}?/g,
        fix: (match, item) => {
          return match.replace(/key\s*=\s*\{?\s*(?:i|index|idx)\s*\}?/, `key={\`\${${item}.id || ${item}.name || Math.random()}\`}`)
        },
        description: 'Use unique identifier instead of array index for React key'
      },

      // Empty catch blocks
      'empty-catch': {
        pattern: /catch\s*\(\s*([^)]*)\s*\)\s*\{\s*(?:\/\/.*\n)?\s*\}/g,
        fix: (match, error) => `catch (${error || 'error'}) {
    console.error('An error occurred:', ${error || 'error'})
    // TODO: Add proper error handling
  }`,
        description: 'Add error logging to empty catch blocks'
      },

      // Console statements
      'console-statements': {
        pattern: /console\.(log|error|warn|info)\s*\([^)]*\)/g,
        fix: (match) => `// ${match} // TODO: Remove for production`,
        description: 'Comment out console statements'
      },

      // Unsafe token decoding
      'unsafe-token': {
        pattern: /atob\s*\(\s*([^)]+)\s*\)/g,
        fix: (match, token) => `(() => {
  try {
    return atob(${token})
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
})()`,
        description: 'Add error handling for base64 decoding'
      },

      // Missing async/await error handling
      'async-no-try-catch': {
        pattern: /async\s+function\s+(\w+)\s*\([^)]*\)\s*\{([^}]+(?:await[^}]+)+)\}/g,
        fix: (match, name, body) => {
          if (!body.includes('try')) {
            return `async function ${name}() {
  try {${body}}
  catch (error) {
    console.error('Error in ${name}:', error)
    throw error
  }
}`
          }
          return match
        },
        description: 'Wrap async function in try-catch'
      },

      // Direct state mutation
      'state-mutation': {
        pattern: /(\w+)\.push\s*\(|(\w+)\.pop\s*\(|(\w+)\.shift\s*\(|(\w+)\.unshift\s*\(/g,
        fix: (match, var1, var2, var3, var4) => {
          const varName = var1 || var2 || var3 || var4
          if (match.includes('push')) {
            return `[...${varName}, newItem]`
          } else if (match.includes('pop')) {
            return `${varName}.slice(0, -1)`
          } else if (match.includes('shift')) {
            return `${varName}.slice(1)`
          } else if (match.includes('unshift')) {
            return `[newItem, ...${varName}]`
          }
          return match
        },
        description: 'Use immutable array operations'
      },

      // Missing null checks
      'missing-null-check': {
        pattern: /(\w+)\.(\w+)(?!\?)/g,
        fix: (match, obj, prop) => {
          // Only fix if it looks like an object access that might be null
          if (['window', 'document', 'console', 'Math', 'JSON', 'Object', 'Array'].includes(obj)) {
            return match
          }
          return `${obj}?.${prop}`
        },
        description: 'Add optional chaining for null safety'
      },

      // SQL injection prevention
      'sql-injection': {
        pattern: /query\s*\(\s*['"`].*\$\{([^}]+)\}.*['"`]/g,
        fix: (match, variable) => {
          return match.replace(/\$\{[^}]+\}/g, '?') + ` // Use parameterized query with [${variable}]`
        },
        description: 'Use parameterized queries to prevent SQL injection'
      }
    }
  }

  extractDependencies(code) {
    const deps = new Set()

    // Extract variables used in the effect
    const variablePattern = /\b([a-zA-Z_]\w*)\b/g
    const matches = code.match(variablePattern) || []

    // Filter for likely state/prop variables
    matches.forEach(match => {
      if (!['console', 'window', 'document', 'fetch', 'setTimeout', 'setInterval'].includes(match)) {
        if (code.includes(`${match}(`) || code.includes(`set${match.charAt(0).toUpperCase() + match.slice(1)}`)) {
          deps.add(match)
        }
      }
    })

    return Array.from(deps)
  }

  async fixBug(bug, fileContent) {
    const fixes = []

    for (const [type, fixer] of Object.entries(this.fixPatterns)) {
      if (bug.message.toLowerCase().includes(type.replace('-', ' ')) ||
          bug.type === type) {
        const fixedContent = fileContent.replace(fixer.pattern, fixer.fix)
        if (fixedContent !== fileContent) {
          fixes.push({
            type,
            description: fixer.description,
            original: fileContent,
            fixed: fixedContent,
            diff: this.generateDiff(fileContent, fixedContent)
          })
        }
      }
    }

    return fixes
  }

  async fixAllBugs(bugs, fileContent) {
    let fixedContent = fileContent
    const appliedFixes = []

    for (const bug of bugs) {
      const fixes = await this.fixBug(bug, fixedContent)
      if (fixes.length > 0) {
        fixedContent = fixes[0].fixed
        appliedFixes.push(fixes[0])
      }
    }

    return {
      original: fileContent,
      fixed: fixedContent,
      appliedFixes,
      summary: {
        totalBugs: bugs.length,
        fixedBugs: appliedFixes.length,
        remainingBugs: bugs.length - appliedFixes.length
      }
    }
  }

  generateDiff(original, fixed) {
    const originalLines = original.split('\n')
    const fixedLines = fixed.split('\n')
    const diff = []

    const maxLines = Math.max(originalLines.length, fixedLines.length)

    for (let i = 0; i < maxLines; i++) {
      if (originalLines[i] !== fixedLines[i]) {
        if (originalLines[i] !== undefined) {
          diff.push(`- ${originalLines[i]}`)
        }
        if (fixedLines[i] !== undefined) {
          diff.push(`+ ${fixedLines[i]}`)
        }
      }
    }

    return diff
  }

  suggestRefactoring(code) {
    const suggestions = []

    // Check for long functions
    const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]{500,}/g) || []
    if (functionMatches.length > 0) {
      suggestions.push({
        type: 'refactor',
        severity: 'medium',
        message: 'Long function detected',
        suggestion: 'Consider breaking this function into smaller, more focused functions'
      })
    }

    // Check for deeply nested code
    if (/\{[^}]*\{[^}]*\{[^}]*\{/.test(code)) {
      suggestions.push({
        type: 'complexity',
        severity: 'medium',
        message: 'Deep nesting detected',
        suggestion: 'Reduce nesting by using early returns or extracting logic'
      })
    }

    // Check for duplicate code patterns
    const codeBlocks = code.match(/\{[^}]{20,100}\}/g) || []
    const duplicates = codeBlocks.filter((block, index) =>
      codeBlocks.indexOf(block) !== index
    )

    if (duplicates.length > 0) {
      suggestions.push({
        type: 'duplication',
        severity: 'low',
        message: 'Potential code duplication detected',
        suggestion: 'Extract common code into reusable functions or components'
      })
    }

    // Check for magic numbers
    if (/[^0-9](?:3\.14|86400|3600|60|100|1000)[^0-9]/.test(code)) {
      suggestions.push({
        type: 'maintainability',
        severity: 'low',
        message: 'Magic numbers detected',
        suggestion: 'Define constants for magic numbers to improve readability'
      })
    }

    return suggestions
  }

  generateFixReport(result) {
    const report = []

    report.push('# Automated Bug Fix Report')
    report.push(`Generated: ${new Date().toISOString()}`)
    report.push('')

    report.push('## Summary')
    report.push(`- Total bugs detected: ${result.summary.totalBugs}`)
    report.push(`- Bugs fixed automatically: ${result.summary.fixedBugs}`)
    report.push(`- Bugs requiring manual review: ${result.summary.remainingBugs}`)
    report.push('')

    report.push('## Applied Fixes')
    result.appliedFixes.forEach((fix, index) => {
      report.push(`### Fix ${index + 1}: ${fix.description}`)
      report.push(`Type: ${fix.type}`)
      report.push('```diff')
      fix.diff.forEach(line => report.push(line))
      report.push('```')
      report.push('')
    })

    return report.join('\n')
  }
}

// Smart fix suggester using AI-like heuristics
export class SmartFixSuggester {
  constructor() {
    this.contextPatterns = this.initializeContextPatterns()
  }

  initializeContextPatterns() {
    return {
      'react-component': {
        indicators: ['import React', 'useState', 'useEffect', 'return ('],
        fixes: {
          'missing-error-boundary': {
            suggestion: 'Wrap component in an ErrorBoundary',
            code: `<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>`
          },
          'missing-loading-state': {
            suggestion: 'Add loading state management',
            code: `const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)`
          }
        }
      },
      'api-call': {
        indicators: ['fetch', 'axios', 'http', 'api'],
        fixes: {
          'no-retry-logic': {
            suggestion: 'Add retry logic for failed requests',
            code: `async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
}`
          },
          'no-timeout': {
            suggestion: 'Add timeout to prevent hanging requests',
            code: `const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)
try {
  const response = await fetch(url, { signal: controller.signal })
} finally {
  clearTimeout(timeout)
}`
          }
        }
      },
      'state-management': {
        indicators: ['useState', 'setState', 'reducer'],
        fixes: {
          'complex-state': {
            suggestion: 'Consider using useReducer for complex state',
            code: `const [state, dispatch] = useReducer(reducer, initialState)`
          },
          'derived-state': {
            suggestion: 'Use useMemo for expensive computations',
            code: `const derivedValue = useMemo(() => computeExpensiveValue(state), [state])`
          }
        }
      }
    }
  }

  suggestFixes(code, bugs) {
    const suggestions = []

    // Analyze code context
    const context = this.analyzeContext(code)

    // Generate targeted suggestions based on context and bugs
    bugs.forEach(bug => {
      const fix = this.generateSmartFix(bug, context, code)
      if (fix) {
        suggestions.push(fix)
      }
    })

    // Add context-specific improvements
    Object.entries(this.contextPatterns).forEach(([type, pattern]) => {
      if (pattern.indicators.some(ind => code.includes(ind))) {
        Object.entries(pattern.fixes).forEach(([fixType, fix]) => {
          if (this.shouldSuggestFix(fixType, code)) {
            suggestions.push({
              type: fixType,
              category: type,
              ...fix,
              priority: 'recommended'
            })
          }
        })
      }
    })

    return suggestions
  }

  analyzeContext(code) {
    return {
      isReactComponent: /import.*React|function.*return.*\</.test(code),
      hasApiCalls: /fetch|axios|http/.test(code),
      hasStateManagement: /useState|useReducer|redux/.test(code),
      hasAsyncOperations: /async|await|Promise/.test(code),
      complexity: this.calculateComplexity(code)
    }
  }

  calculateComplexity(code) {
    const conditions = (code.match(/if|else|switch|case|\?:|&&|\|\|/g) || []).length
    const loops = (code.match(/for|while|map|forEach|reduce/g) || []).length
    return conditions + loops
  }

  generateSmartFix(bug, context, code) {
    // Generate context-aware fixes based on bug type and code context
    if (bug.severity === 'critical') {
      return {
        type: 'critical-fix',
        priority: 'urgent',
        suggestion: `Critical bug: ${bug.message}`,
        autoFix: true,
        confidence: 0.9
      }
    }

    return null
  }

  shouldSuggestFix(fixType, code) {
    // Smart heuristic to determine if a fix should be suggested
    const patterns = {
      'missing-error-boundary': !code.includes('ErrorBoundary'),
      'missing-loading-state': !code.includes('loading') && code.includes('fetch'),
      'no-retry-logic': code.includes('fetch') && !code.includes('retry'),
      'no-timeout': code.includes('fetch') && !code.includes('AbortController'),
      'complex-state': (code.match(/useState/g) || []).length > 3,
      'derived-state': code.includes('filter') || code.includes('sort')
    }

    return patterns[fixType] || false
  }
}

export default AutomatedBugFixer