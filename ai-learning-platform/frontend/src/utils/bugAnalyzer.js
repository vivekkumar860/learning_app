import fs from 'fs'
import path from 'path'
import { BugDetector, BugMonitor } from './bugDetector'
import { AutomatedBugScanner, MLBugPredictor } from './bugScanner'

export class BugAnalyzer {
  constructor() {
    this.detector = new BugDetector()
    this.scanner = new AutomatedBugScanner()
    this.predictor = new MLBugPredictor()
    this.monitor = new BugMonitor()
  }

  // Comprehensive project analysis
  async analyzeProject(projectRoot) {
    console.log('🔍 Starting comprehensive bug analysis...')

    const results = {
      timestamp: new Date().toISOString(),
      projectPath: projectRoot,
      findings: {
        syntaxErrors: [],
        runtimeErrors: [],
        logicErrors: [],
        performanceIssues: [],
        securityVulnerabilities: [],
        codeSmells: [],
        predictions: []
      },
      statistics: {
        totalFiles: 0,
        filesWithIssues: 0,
        totalIssues: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0
      },
      recommendations: []
    }

    try {
      // Get all JavaScript/TypeScript files
      const files = await this.getAllFiles(projectRoot, ['.js', '.jsx', '.ts', '.tsx'])
      results.statistics.totalFiles = files.length

      // Analyze each file
      for (const file of files) {
        const analysis = await this.analyzeFile(file)
        if (analysis.issues.length > 0) {
          results.statistics.filesWithIssues++
          this.categorizeIssues(analysis.issues, results.findings)
        }
      }

      // Calculate statistics
      this.calculateStatistics(results)

      // Generate recommendations
      results.recommendations = this.generateSmartRecommendations(results)

      // Create detailed report
      await this.createDetailedReport(results)

      return results
    } catch (error) {
      console.error('Analysis failed:', error)
      throw error
    }
  }

  async getAllFiles(dir, extensions) {
    const files = []

    async function walk(currentDir) {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath)
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    }

    await walk(dir)
    return files
  }

  async analyzeFile(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf8')
    const issues = []

    // Basic syntax and pattern detection
    const basicIssues = this.detector.scanFile(content, filePath)
    issues.push(...basicIssues)

    // Security vulnerability detection
    const securityIssues = this.scanner.detectSecurityVulnerabilities(content)
    issues.push(...securityIssues.map(issue => ({
      ...issue,
      location: filePath
    })))

    // Performance issue detection
    const performanceIssues = this.scanner.detectPerformanceIssues(content)
    issues.push(...performanceIssues.map(issue => ({
      ...issue,
      location: filePath
    })))

    // Memory leak detection
    const memoryLeaks = this.scanner.detectMemoryLeaks(content)
    issues.push(...memoryLeaks.map(issue => ({
      ...issue,
      location: filePath
    })))

    // Complexity analysis
    const complexityIssue = this.scanner.analyzeComplexity(content)
    if (complexityIssue) {
      issues.push({
        ...complexityIssue,
        location: filePath
      })
    }

    // ML-based predictions
    const predictions = this.predictor.predict(content)
    predictions.forEach(prediction => {
      issues.push({
        ...prediction,
        location: filePath,
        type: 'prediction'
      })
    })

    return {
      file: filePath,
      issues
    }
  }

  categorizeIssues(issues, findings) {
    issues.forEach(issue => {
      switch (issue.type) {
        case 'syntax-error':
          findings.syntaxErrors.push(issue)
          break
        case 'runtime-error':
        case 'promise-rejection':
          findings.runtimeErrors.push(issue)
          break
        case 'sql-injection':
        case 'xss':
        case 'exposed-secret':
          findings.securityVulnerabilities.push(issue)
          break
        case 'render-performance':
        case 'nested-loops':
        case 'high-complexity':
          findings.performanceIssues.push(issue)
          break
        case 'prediction':
          findings.predictions.push(issue)
          break
        default:
          findings.codeSmells.push(issue)
      }
    })
  }

  calculateStatistics(results) {
    const allIssues = [
      ...results.findings.syntaxErrors,
      ...results.findings.runtimeErrors,
      ...results.findings.logicErrors,
      ...results.findings.performanceIssues,
      ...results.findings.securityVulnerabilities,
      ...results.findings.codeSmells
    ]

    results.statistics.totalIssues = allIssues.length
    results.statistics.criticalCount = allIssues.filter(i => i.severity === 'critical').length
    results.statistics.highCount = allIssues.filter(i => i.severity === 'high').length
    results.statistics.mediumCount = allIssues.filter(i => i.severity === 'medium').length
    results.statistics.lowCount = allIssues.filter(i => i.severity === 'low').length
  }

  generateSmartRecommendations(results) {
    const recommendations = []
    const { statistics, findings } = results

    // Critical security issues
    if (findings.securityVulnerabilities.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Security',
        title: 'Security Vulnerabilities Detected',
        description: `Found ${findings.securityVulnerabilities.length} security vulnerabilities that need immediate attention`,
        actions: [
          'Review and fix all SQL injection risks',
          'Sanitize user inputs to prevent XSS',
          'Remove hardcoded secrets and use environment variables',
          'Implement proper authentication and authorization'
        ]
      })
    }

    // Performance optimization
    if (findings.performanceIssues.length > 5) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Performance',
        title: 'Performance Optimization Needed',
        description: `${findings.performanceIssues.length} performance issues detected that could impact user experience`,
        actions: [
          'Optimize render methods and use React.memo where appropriate',
          'Refactor nested loops to reduce complexity',
          'Implement lazy loading for heavy components',
          'Use virtualization for long lists'
        ]
      })
    }

    // Code quality
    if (statistics.totalIssues > 20) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Code Quality',
        title: 'Code Quality Improvements',
        description: 'Multiple code quality issues detected across the codebase',
        actions: [
          'Set up ESLint with strict rules',
          'Implement pre-commit hooks',
          'Add comprehensive error handling',
          'Refactor complex functions into smaller units'
        ]
      })
    }

    // Testing
    if (findings.predictions.filter(p => p.confidence > 70).length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Testing',
        title: 'Increase Test Coverage',
        description: 'ML predictions suggest potential bugs in untested code paths',
        actions: [
          'Add unit tests for critical functions',
          'Implement integration tests for API calls',
          'Add error boundary tests',
          'Set up automated testing in CI/CD pipeline'
        ]
      })
    }

    return recommendations
  }

  async createDetailedReport(results) {
    const report = `
# Bug Analysis Report
Generated: ${results.timestamp}
Project: ${results.projectPath}

## Executive Summary
- **Total Files Scanned**: ${results.statistics.totalFiles}
- **Files with Issues**: ${results.statistics.filesWithIssues}
- **Total Issues Found**: ${results.statistics.totalIssues}

### Issue Severity Breakdown
- 🔴 Critical: ${results.statistics.criticalCount}
- 🟠 High: ${results.statistics.highCount}
- 🟡 Medium: ${results.statistics.mediumCount}
- 🟢 Low: ${results.statistics.lowCount}

## Security Vulnerabilities (${results.findings.securityVulnerabilities.length})
${this.formatIssues(results.findings.securityVulnerabilities)}

## Performance Issues (${results.findings.performanceIssues.length})
${this.formatIssues(results.findings.performanceIssues)}

## Runtime Errors (${results.findings.runtimeErrors.length})
${this.formatIssues(results.findings.runtimeErrors)}

## Code Smells (${results.findings.codeSmells.length})
${this.formatIssues(results.findings.codeSmells)}

## ML Predictions (${results.findings.predictions.length})
${this.formatPredictions(results.findings.predictions)}

## Recommendations
${this.formatRecommendations(results.recommendations)}

## Next Steps
1. Address all critical security vulnerabilities immediately
2. Fix high-priority bugs that affect user experience
3. Schedule refactoring for performance improvements
4. Implement automated testing and monitoring
5. Set up continuous bug detection in CI/CD pipeline
`

    // Save report to file
    const reportPath = path.join(results.projectPath, 'bug-analysis-report.md')
    await fs.promises.writeFile(reportPath, report, 'utf8')
    console.log(`📊 Report saved to: ${reportPath}`)

    return report
  }

  formatIssues(issues) {
    if (issues.length === 0) return 'No issues found in this category.\n'

    return issues
      .slice(0, 10) // Show first 10 issues
      .map(issue => `
### ${issue.message || issue.type}
- **Location**: ${issue.location}
- **Severity**: ${issue.severity}
- **Fix**: ${issue.fix || 'Review and fix the issue'}
${issue.snippet ? `- **Code**: \`${issue.snippet}\`` : ''}
`)
      .join('\n')
  }

  formatPredictions(predictions) {
    if (predictions.length === 0) return 'No predictions generated.\n'

    return predictions
      .filter(p => p.confidence > 60)
      .sort((a, b) => b.confidence - a.confidence)
      .map(pred => `
### ${pred.message}
- **Confidence**: ${pred.confidence}%
- **Location**: ${pred.location}
- **Type**: ${pred.type}
`)
      .join('\n')
  }

  formatRecommendations(recommendations) {
    return recommendations
      .map(rec => `
### ${rec.priority}: ${rec.title}
**Category**: ${rec.category}
**Description**: ${rec.description}

**Actions**:
${rec.actions.map(action => `- ${action}`).join('\n')}
`)
      .join('\n')
  }
}

// CLI Interface for running analysis
export const runBugAnalysis = async () => {
  const analyzer = new BugAnalyzer()
  const projectPath = process.cwd()

  console.log('🚀 Starting Bug Detection Model...')
  console.log(`📂 Analyzing project: ${projectPath}`)

  try {
    const results = await analyzer.analyzeProject(projectPath)

    console.log('\n✅ Analysis Complete!')
    console.log(`📊 Total Issues Found: ${results.statistics.totalIssues}`)
    console.log(`🔴 Critical: ${results.statistics.criticalCount}`)
    console.log(`🟠 High: ${results.statistics.highCount}`)
    console.log(`🟡 Medium: ${results.statistics.mediumCount}`)
    console.log(`🟢 Low: ${results.statistics.lowCount}`)

    if (results.recommendations.length > 0) {
      console.log('\n📌 Top Recommendations:')
      results.recommendations.slice(0, 3).forEach(rec => {
        console.log(`  - ${rec.priority}: ${rec.title}`)
      })
    }

    return results
  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
    throw error
  }
}

export default BugAnalyzer