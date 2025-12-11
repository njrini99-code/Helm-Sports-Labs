#!/bin/bash

# Bug Scanner Management Script
# Easy commands to start, stop, and check status of the bug scanner

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.bug-scanner.pid"
LOG_FILE="$PROJECT_ROOT/.bug-scanner.log"

case "$1" in
  start)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Bug scanner is already running (PID: $PID)"
        exit 0
      else
        rm "$PID_FILE"
      fi
    fi
    
    echo "🚀 Starting bug scanner..."
    cd "$PROJECT_ROOT"
    nohup npm run bug:scan > /dev/null 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    echo "✅ Bug scanner started (PID: $PID)"
    echo "📝 Log file: $LOG_FILE"
    ;;
    
  stop)
    if [ ! -f "$PID_FILE" ]; then
      echo "⚠️  Bug scanner is not running (no PID file found)"
      exit 1
    fi
    
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
      echo "🛑 Stopping bug scanner (PID: $PID)..."
      kill "$PID"
      rm "$PID_FILE"
      echo "✅ Bug scanner stopped"
    else
      echo "⚠️  Bug scanner process not found (cleaning up PID file)"
      rm "$PID_FILE"
    fi
    ;;
    
  status)
    if [ ! -f "$PID_FILE" ]; then
      echo "❌ Bug scanner is not running"
      exit 1
    fi
    
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
      echo "✅ Bug scanner is running (PID: $PID)"
      echo "📝 Log file: $LOG_FILE"
      if [ -f "$LOG_FILE" ]; then
        echo ""
        echo "📊 Last 10 log entries:"
        tail -10 "$LOG_FILE"
      fi
      
      # Check for latest results
      RESULTS_FILE="$PROJECT_ROOT/.bug-scan-results.json"
      if [ -f "$RESULTS_FILE" ]; then
        echo ""
        echo "📊 Latest scan results:"
        cat "$RESULTS_FILE" | grep -A 5 '"summary"' | head -6
      fi
    else
      echo "❌ Bug scanner is not running (stale PID file)"
      rm "$PID_FILE"
      exit 1
    fi
    ;;
    
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
    
  logs)
    if [ -f "$LOG_FILE" ]; then
      tail -f "$LOG_FILE"
    else
      echo "⚠️  Log file not found: $LOG_FILE"
      exit 1
    fi
    ;;
    
  *)
    echo "Usage: $0 {start|stop|status|restart|logs}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the bug scanner"
    echo "  stop    - Stop the bug scanner"
    echo "  status  - Check if the bug scanner is running"
    echo "  restart - Restart the bug scanner"
    echo "  logs    - Follow the log file in real-time"
    exit 1
    ;;
esac
