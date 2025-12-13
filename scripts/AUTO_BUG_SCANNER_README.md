# Automatic Bug Scanner

An automatic bug scanner and fixer that runs continuously, scanning your codebase every 2 minutes for bugs and automatically fixing them where possible.

## Features

- 🔍 **TypeScript Error Detection**: Scans for TypeScript type errors
- 🔍 **ESLint Issue Detection**: Finds linting errors and warnings
- 🔍 **Common Code Issues**: Detects common patterns like:
  - Console statements in production code
  - TODO/FIXME comments
  - Empty catch blocks
  - Missing error handling in async functions
- 🔧 **Auto-fixing**: Automatically fixes ESLint issues where possible
- 📊 **Detailed Reports**: Generates scan reports and logs
- ⏰ **Continuous Monitoring**: Runs automatically every 2 minutes

## Usage

### Start Continuous Scanning

Run the bug scanner in the background (scans every 2 minutes):

```bash
npm run bug:scan
```

The scanner will:
- Run an initial scan immediately
- Continue scanning every 2 minutes
- Log all findings to `.bug-scanner.log`
- Save scan results to `.bug-scan-results.json`
- Display colored output in the terminal

### Run a Single Scan

Run just one scan (useful for testing):

```bash
npm run bug:scan:once
```

### Stop the Scanner

Press `Ctrl+C` to stop the continuous scanner gracefully.

## Output

The scanner provides:

1. **Real-time Terminal Output**: Colored output showing:
   - ✅ Successful checks (green)
   - ⚠️  Warnings and issues (yellow/red)
   - 📊 Summary statistics

2. **Log File** (`.bug-scanner.log`): Complete log of all scans with timestamps

3. **Results File** (`.bug-scan-results.json`): JSON file with detailed scan results including:
   - TypeScript errors
   - ESLint issues
   - Common code issues
   - Auto-fixes applied
   - Scan timestamps and duration

## What Gets Scanned

### TypeScript Errors
- Type mismatches
- Missing imports
- Undefined variables
- Type errors in `.ts` and `.tsx` files

### ESLint Issues
- Code style violations
- Best practice violations
- Potential bugs
- Auto-fixable issues (automatically fixed)

### Common Code Issues
- Console statements (`console.log`, `console.error`, etc.)
- TODO/FIXME comments
- Empty catch blocks
- Missing error handling

## Auto-fixing

The scanner automatically fixes:
- ✅ **ESLint issues**: Auto-fixes via `eslint --fix` (formatting, style, etc.)
- ✅ **Console.log statements**: Comments them out (preserves code for debugging)
- ✅ **Empty catch blocks**: Adds TODO comments to remind developers to add error handling

For other issues, the scanner will:
- Report them in the scan results
- Provide suggestions for manual fixes

### What Gets Auto-Fixed

1. **console.log statements**: Commented out (e.g., `// console.log(...)`)
   - console.error and console.warn are preserved (useful for production)
   - Test files are excluded from this check

2. **Empty catch blocks**: Adds error parameter and TODO comment
   - Changes: `catch () { }` → `catch (error) { // TODO: Handle error appropriately }`

3. **ESLint auto-fixable issues**: 
   - Code formatting
   - Import ordering
   - Unused variables (removal)
   - And other ESLint auto-fixable rules

## Integration

### With CI/CD

You can integrate the scanner into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run bug scanner
  run: npm run bug:scan:once
```

### As a Background Service

On Unix systems, you can run it as a background service:

```bash
# Run in background
nohup npm run bug:scan > /dev/null 2>&1 &

# Or use pm2
pm2 start "npm run bug:scan" --name bug-scanner
```

## Configuration

The scanner runs every **2 minutes** by default. To change the interval, edit `SCAN_INTERVAL` in `scripts/auto-bug-scanner.js`:

```javascript
const SCAN_INTERVAL = 2 * 60 * 1000; // Change to your desired interval
```

## Files

- `scripts/auto-bug-scanner.js` - Main scanner script
- `.bug-scanner.log` - Scan log file (gitignored)
- `.bug-scan-results.json` - Latest scan results (gitignored)

## Notes

- The scanner only scans files in `app/`, `components/`, and `lib/` directories
- Test files are excluded from console statement checks
- The scanner respects `.gitignore` patterns
- Large files may be skipped to maintain performance

## Troubleshooting

### Scanner not finding errors

Make sure you have:
- TypeScript installed: `npm install typescript --save-dev`
- ESLint configured: `npm install eslint eslint-config-next --save-dev`

### Scanner is too slow

The scanner limits itself to the first 50 files for common issue detection. You can adjust this limit in the `scanCommonIssues()` function.

### Want to scan different directories

Edit the `findSourceFiles()` function in `scripts/auto-bug-scanner.js` to include/exclude different directories.
