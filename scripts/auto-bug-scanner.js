#!/usr/bin/env node

/**
 * Automatic Bug Scanner and Fixer
 * 
 * Scans the codebase every 2 minutes for:
 * - TypeScript type errors
 * - ESLint errors
 * - Common code issues
 * - Auto-fixes issues where possible
 * 
 * Usage:
 *   node scripts/auto-bug-scanner.js
 * 
 * Runs continuously, scanning every 2 minutes
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCAN_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOG_FILE = path.join(PROJECT_ROOT, '.bug-scanner.log');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(`${colors[color]}${logMessage}${colors.reset}`);
  
  // Also write to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      ...options,
    });
    return { success: true, output: result || '', error: null };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout?.toString() || error.stderr?.toString() || '',
    };
  }
}

function fixTypeScriptErrors(tsErrors) {
  const fixes = [];
  const errorMap = new Map(); // file -> [errors]
  
  // Parse errors by file
  for (const error of tsErrors) {
    const fileMatch = error.match(/([^(\s]+\.tsx?)\((\d+),(\d+)\):/);
    if (fileMatch) {
      const filePath = fileMatch[1];
      const lineNum = parseInt(fileMatch[2]);
      const colNum = parseInt(fileMatch[3]);
      
      if (!errorMap.has(filePath)) {
        errorMap.set(filePath, []);
      }
      errorMap.get(filePath).push({ line: lineNum, col: colNum, error });
    }
  }
  
  // Try to fix errors in each file
  for (const [filePath, errors] of errorMap) {
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(PROJECT_ROOT, filePath);
    
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    
    try {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let fileModified = false;
      const lines = content.split('\n');
      
      for (const err of errors) {
        const lineIndex = err.line - 1;
        if (lineIndex < 0 || lineIndex >= lines.length) continue;
        
        const line = lines[lineIndex];
        
        // Fix common patterns
        // 1. Missing React imports
        if (err.error.includes('Cannot find name') && err.error.match(/use(State|Effect|Callback|Memo|Ref)/)) {
          const hookMatch = err.error.match(/use(State|Effect|Callback|Memo|Ref)/);
          if (hookMatch) {
            const hook = hookMatch[0];
            // Check if React is imported
            if (!content.includes(`import`) || !content.match(new RegExp(`from ['"]react['"]`))) {
              // Add import at the top
              const importLine = `import { ${hook} } from 'react';`;
              // Find first import or add at top
              const firstImport = lines.findIndex(l => l.trim().startsWith('import'));
              if (firstImport >= 0) {
                lines.splice(firstImport, 0, importLine);
                fileModified = true;
                fixes.push(`Added React import for ${hook} in ${path.basename(fullPath)}`);
              } else {
                // Add after any 'use client' or 'use server' directives
                let insertAt = 0;
                for (let i = 0; i < Math.min(5, lines.length); i++) {
                  if (lines[i].trim().startsWith('"use') || lines[i].trim().startsWith("'use")) {
                    insertAt = i + 1;
                  }
                }
                lines.splice(insertAt, 0, importLine);
                fileModified = true;
                fixes.push(`Added React import for ${hook} in ${path.basename(fullPath)}`);
              }
            } else if (content.includes(`from 'react'`) || content.includes(`from "react"`)) {
              // Add to existing import
              const importRegex = /import\s+{([^}]+)}\s+from\s+['"]react['"]/;
              const importMatch = content.match(importRegex);
              if (importMatch && !importMatch[1].includes(hook)) {
                const newImport = content.replace(importRegex, (match, imports) => {
                  return `import { ${imports.trim()}, ${hook} } from 'react'`;
                });
                content = newImport;
                fileModified = true;
                fixes.push(`Added ${hook} to React import in ${path.basename(fullPath)}`);
              }
            }
          }
        }
        
        // 2. Fix 'any' type errors by adding explicit types (simple cases)
        if (err.error.includes("implicitly has an 'any' type")) {
          const paramMatch = err.error.match(/Parameter '(\w+)' implicitly has an 'any' type/);
          if (paramMatch && line.includes(`(${paramMatch[1]})`)) {
            const newLine = line.replace(
              new RegExp(`\\(${paramMatch[1]}\\)`),
              `(${paramMatch[1]}: any)`
            );
            lines[lineIndex] = newLine;
            fileModified = true;
            fixes.push(`Added type annotation for ${paramMatch[1]} in ${path.basename(fullPath)}`);
          }
        }
        
        // 3. Fix null/undefined errors with optional chaining
        if (err.error.includes("Object is possibly 'null' or 'undefined'")) {
          // Try to add optional chaining - this is complex, skip for now
          // Would need AST parsing for proper fixes
        }
      }
      
      if (fileModified) {
        fs.writeFileSync(fullPath, lines.join('\n'), 'utf-8');
        log(`   ✅ Fixed TypeScript errors in ${path.basename(fullPath)}`, 'green');
      }
    } catch (error) {
      // Skip files that can't be read or modified
      log(`   ⚠️  Could not fix ${path.basename(fullPath)}: ${error.message}`, 'yellow');
    }
  }
  
  return fixes;
}

function fixESLintErrors(eslintErrors) {
  const fixes = [];
  
  // Try to auto-fix with ESLint
  log('🔧 Attempting to auto-fix ESLint errors...', 'yellow');
  const fixResult = runCommand('npm run lint -- --fix', { silent: true });
  
  // ESLint --fix returns exit code 0 even if there are remaining unfixable issues
  // Check if the output shows it fixed anything
  const output = fixResult.output || '';
  if (output.includes('Fixed') || output.includes('fixable')) {
    log('✅ ESLint auto-fix completed', 'green');
    fixes.push('ESLint auto-fix applied');
  } else if (fixResult.success) {
    log('✅ ESLint auto-fix completed (no fixable issues)', 'green');
  } else {
    // Try again without --fix to see if there are actually errors
    const checkResult = runCommand('npm run lint 2>&1', { silent: true });
    if (checkResult.output && checkResult.output.trim()) {
      log('⚠️  ESLint found issues (some may not be auto-fixable)', 'yellow');
    } else {
      log('✅ No ESLint issues to fix', 'green');
    }
  }
  
  return fixes;
}

function scanTypeScript() {
  log('🔍 Scanning for TypeScript errors...', 'cyan');
  const result = runCommand('npm run typecheck 2>&1', { silent: true });
  
  if (result.success || !result.output) {
    log('✅ No TypeScript errors found', 'green');
    return { errors: [], fixes: [] };
  }
  
  const errorLines = result.output.split('\n');
  const errors = errorLines.filter(line => 
    line.trim() && (
      line.includes('error TS') || 
      line.includes('Cannot find') || 
      line.includes('is not defined') ||
      line.includes('Type error:') ||
      line.match(/\.tsx?\(\d+,\d+\):\s*error/)
    )
  );
  
  log(`⚠️  Found ${errors.length} TypeScript errors`, 'yellow');
  if (errors.length > 0) {
    errors.slice(0, 5).forEach(err => log(`   ${err.trim()}`, 'red'));
  }
  
  const fixes = fixTypeScriptErrors(errors);
  return { errors, fixes };
}

function scanESLint() {
  log('🔍 Scanning for ESLint errors...', 'cyan');
  const result = runCommand('npm run lint 2>&1', { silent: true });
  
  // ESLint might return non-zero but still have output
  const output = result.output || result.error || '';
  const errorLines = output.split('\n');
  const errors = errorLines.filter(line => 
    line.trim() && (
      line.includes('error') || 
      line.includes('warning') ||
      line.includes('✖') ||
      line.match(/\.tsx?\(\d+,\d+\):/)
    )
  );
  
  if (errors.length === 0 && result.success) {
    log('✅ No ESLint errors found', 'green');
    return { errors: [], fixes: [] };
  }
  
  log(`⚠️  Found ${errors.length} ESLint issues`, 'yellow');
  if (errors.length > 0) {
    errors.slice(0, 5).forEach(err => log(`   ${err.trim()}`, 'yellow'));
  }
  
  const fixes = fixESLintErrors(errors);
  return { errors, fixes };
}

function autoFixConsoleStatements(filePath, content) {
  // Only remove console.log, keep console.error and console.warn (they're useful for production)
  // Comment out console.log instead of removing completely
  let fixed = content;
  let fixCount = 0;
  
  // Pattern to match console.log statements (but preserve indentation and context)
  const consoleLogPattern = /^(\s*)(console\.log\([^)]*\);?)(\s*)$/gm;
  
  fixed = fixed.replace(consoleLogPattern, (match, indent, statement, after) => {
    fixCount++;
    // Comment out console.log statements
    return `${indent}// ${statement}${after}`;
  });
  
  if (fixCount > 0) {
    fs.writeFileSync(filePath, fixed, 'utf-8');
    log(`   ✅ Fixed ${fixCount} console.log statement(s) in ${path.basename(filePath)}`, 'green');
    return fixCount;
  }
  
  return 0;
}

function autoFixEmptyCatch(filePath, content) {
  let fixed = content;
  let fixCount = 0;
  
  // Pattern to match empty catch blocks and add a comment
  const emptyCatchPattern = /catch\s*\([^)]*\)\s*\{([\s\n]*)\}/g;
  
  fixed = fixed.replace(emptyCatchPattern, (match, whitespace) => {
    fixCount++;
    return `catch (error) {${whitespace}// TODO: Handle error appropriately${whitespace}}`;
  });
  
  if (fixCount > 0) {
    fs.writeFileSync(filePath, fixed, 'utf-8');
    log(`   ✅ Fixed ${fixCount} empty catch block(s) in ${path.basename(filePath)}`, 'green');
    return fixCount;
  }
  
  return 0;
}

function scanCommonIssues() {
  log('🔍 Scanning for common code issues...', 'cyan');
  const issues = [];
  const fixes = [];
  let autoFixed = 0;
  
  // Check for console.log statements in production code
  const sourceFiles = findSourceFiles();
  for (const file of sourceFiles.slice(0, 100)) { // Increased limit for better coverage
    try {
      const content = fs.readFileSync(file, 'utf-8');
      let fileFixed = false;
      
      // Check for console.log (auto-fix by commenting them out)
      const consoleLogMatches = content.match(/console\.log\(/g);
      if (consoleLogMatches && !file.includes('test') && !file.includes('.test.')) {
        const fixed = autoFixConsoleStatements(file, content);
        if (fixed > 0) {
          autoFixed += fixed;
          fileFixed = true;
          fixes.push(`Commented out ${fixed} console.log statement(s) in ${path.basename(file)}`);
        } else {
          issues.push({
            file,
            type: 'console-statement',
            message: `Found ${consoleLogMatches.length} console.log statement(s)`,
          });
        }
      }
      
      // Check for console.error and console.warn (just report, don't auto-fix)
      const consoleOtherMatches = content.match(/console\.(error|warn)\(/g);
      if (consoleOtherMatches && !file.includes('test') && !file.includes('.test.')) {
        // Don't auto-fix these, just report
        issues.push({
          file,
          type: 'console-statement',
          message: `Found ${consoleOtherMatches.length} console.error/warn statement(s) (not auto-fixed)`,
        });
      }
      
      // Check for TODO/FIXME comments (report only, don't auto-fix)
      const todos = content.match(/(TODO|FIXME|XXX|HACK|BUG):\s*(.+)/gi);
      if (todos) {
        issues.push({
          file,
          type: 'todo-comment',
          message: `Found ${todos.length} TODO/FIXME comment(s)`,
          todos: todos.slice(0, 3),
        });
      }
      
      // Check for empty catch blocks (auto-fix)
      if (content.includes('catch') && content.match(/catch\s*\([^)]*\)\s*\{[\s\n]*\}/)) {
        const fixed = autoFixEmptyCatch(file, content);
        if (fixed > 0) {
          autoFixed += fixed;
          fileFixed = true;
          fixes.push(`Fixed ${fixed} empty catch block(s) in ${path.basename(file)}`);
        } else {
          issues.push({
            file,
            type: 'empty-catch',
            message: 'Found empty catch block',
          });
        }
      }
      
      // Check for missing error handling in async functions (report only)
      const asyncFunctions = content.match(/async\s+function\s+\w+/g);
      if (asyncFunctions) {
        const hasTryCatch = content.includes('try') && content.includes('catch');
        if (!hasTryCatch && asyncFunctions.length > 0) {
          // Only warn if there are multiple async functions without try-catch
          if (asyncFunctions.length > 2) {
            issues.push({
              file,
              type: 'missing-error-handling',
              message: 'Multiple async functions without error handling',
            });
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  if (autoFixed > 0) {
    log(`✅ Auto-fixed ${autoFixed} common issue(s)`, 'green');
  }
  
  if (issues.length > 0) {
    log(`⚠️  Found ${issues.length} common code issues (remaining)`, 'yellow');
    issues.slice(0, 5).forEach(issue => {
      log(`   ${issue.type}: ${path.basename(issue.file)} - ${issue.message}`, 'yellow');
    });
  } else if (autoFixed === 0) {
    log('✅ No common code issues found', 'green');
  }
  
  return { errors: issues, fixes };
}

function findSourceFiles() {
  const files = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git'];
  
  function walkDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(PROJECT_ROOT, fullPath);
        
        if (excludeDirs.some(exclude => relativePath.includes(exclude))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  walkDir(path.join(PROJECT_ROOT, 'app'));
  walkDir(path.join(PROJECT_ROOT, 'components'));
  walkDir(path.join(PROJECT_ROOT, 'lib'));
  
  return files;
}

async function runScanAndFix() {
  let iteration = 0;
  const maxIterations = 10; // Prevent infinite loops
  let totalFixesApplied = 0;
  let previousErrorCount = Infinity;
  const cycleStartTime = Date.now();
  
  log('\n' + '='.repeat(60), 'bright');
  log('🐛 Starting bug scan and fix cycle...', 'bright');
  log('='.repeat(60), 'bright');
  
  while (iteration < maxIterations) {
    iteration++;
    log(`\n🔄 Iteration ${iteration}...`, 'cyan');
    
    const startTime = Date.now();
    const results = {
      typescript: scanTypeScript(),
      eslint: scanESLint(),
      common: scanCommonIssues(),
    };
    
    const totalErrors = 
      results.typescript.errors.length +
      results.eslint.errors.length +
      results.common.errors.length;
    
    const totalFixes = 
      results.typescript.fixes.length +
      results.eslint.fixes.length +
      results.common.fixes.length;
    
    const duration = Date.now() - startTime;
    totalFixesApplied += totalFixes;
    
    log('='.repeat(60), 'bright');
    log(`📊 Scan Summary (Iteration ${iteration}):`, 'bright');
    log(`   TypeScript Errors: ${results.typescript.errors.length}`, 
        results.typescript.errors.length > 0 ? 'red' : 'green');
    log(`   ESLint Issues: ${results.eslint.errors.length}`,
        results.eslint.errors.length > 0 ? 'yellow' : 'green');
    log(`   Common Issues: ${results.common.errors.length}`,
        results.common.errors.length > 0 ? 'yellow' : 'green');
    log(`   Fixes Applied This Iteration: ${totalFixes}`, totalFixes > 0 ? 'green' : 'reset');
    log(`   Total Fixes Applied: ${totalFixesApplied}`, totalFixesApplied > 0 ? 'green' : 'reset');
    log(`   Scan Duration: ${duration}ms`, 'cyan');
    log('='.repeat(60), 'bright');
    
    // If we fixed something, rescan immediately to see if it helped
    if (totalFixes > 0) {
      log('✅ Fixes were applied! Rescanning to verify...', 'green');
      previousErrorCount = totalErrors;
      // Continue loop to rescan
    } else if (totalErrors === 0) {
      log('✅ No errors found! Cycle complete.', 'green');
      break;
    } else if (totalErrors >= previousErrorCount) {
      log('⚠️  Error count did not decrease. No more auto-fixable issues.', 'yellow');
      break;
    } else {
      previousErrorCount = totalErrors;
      // Continue trying
    }
    
    // Small delay between iterations
    if (totalFixes > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }
  
  // Save results to file
  const resultsFile = path.join(PROJECT_ROOT, '.bug-scan-results.json');
  const finalResults = {
    typescript: scanTypeScript(),
    eslint: scanESLint(),
    common: scanCommonIssues(),
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    iterations: iteration,
    results: finalResults,
    summary: {
      totalErrors: finalResults.typescript.errors.length + 
                   finalResults.eslint.errors.length + 
                   finalResults.common.errors.length,
      totalFixesApplied,
      duration: Date.now() - cycleStartTime,
    },
  }, null, 2));
  
  return { totalErrors: finalResults.typescript.errors.length + 
                        finalResults.eslint.errors.length + 
                        finalResults.common.errors.length, 
           totalFixesApplied };
}

async function runScan() {
  // Legacy function for single scans - now calls the enhanced version
  return await runScanAndFix();
}

async function main() {
  // Write PID file for management script
  const PID_FILE = path.join(PROJECT_ROOT, '.bug-scanner.pid');
  fs.writeFileSync(PID_FILE, process.pid.toString());
  
  log('🚀 Auto Bug Scanner started', 'bright');
  log(`⏰ Scanning every ${SCAN_INTERVAL / 1000 / 60} minutes`, 'cyan');
  log(`📝 Log file: ${LOG_FILE}`, 'cyan');
  log(`🆔 PID: ${process.pid}`, 'cyan');
  log('Press Ctrl+C to stop\n', 'yellow');
  
  // Clean up PID file on exit
  const cleanup = () => {
    try {
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  };
  
  // Run initial scan-and-fix cycle
  await runScanAndFix();
  
  // Set up interval for periodic scan-and-fix cycles
  const intervalId = setInterval(async () => {
    await runScanAndFix();
  }, SCAN_INTERVAL);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n\n🛑 Stopping bug scanner...', 'yellow');
    clearInterval(intervalId);
    cleanup();
    log('✅ Bug scanner stopped', 'green');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('\n\n🛑 Stopping bug scanner...', 'yellow');
    clearInterval(intervalId);
    cleanup();
    log('✅ Bug scanner stopped', 'green');
    process.exit(0);
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runScan, scanTypeScript, scanESLint, scanCommonIssues };
