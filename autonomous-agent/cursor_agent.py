#!/usr/bin/env python3
"""
ScoutPulse Autonomous Agent - Cursor Edition
=============================================

This version uses AppleScript to control Cursor IDE directly,
without requiring the Claude Code SDK.

Usage:
    python cursor_agent.py
    python cursor_agent.py --max-iterations 5
"""

import argparse
import json
import os
import subprocess
import time
from pathlib import Path
from datetime import datetime

from progress import count_improvements, get_next_improvement, print_progress_summary


# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
AGENT_DIR = PROJECT_ROOT / "autonomous-agent"
DELAY_BETWEEN_SESSIONS = 10  # seconds


def send_to_cursor(prompt: str) -> bool:
    """
    Send a prompt to Cursor using AppleScript.
    
    Args:
        prompt: The prompt to send
        
    Returns:
        True if successful, False otherwise
    """
    # Escape special characters for AppleScript
    escaped_prompt = prompt.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    
    apple_script = f'''
    tell application "Cursor"
        activate
        delay 1
    end tell
    
    tell application "System Events"
        tell process "Cursor"
            -- Open chat (Cmd+L)
            keystroke "l" using {{command down}}
            delay 0.5
            
            -- Clear any existing text
            keystroke "a" using {{command down}}
            delay 0.2
            
            -- Type the prompt
            keystroke "{escaped_prompt}"
            delay 0.5
            
            -- Send (Enter)
            keystroke return
        end tell
    end tell
    '''
    
    try:
        subprocess.run(
            ["osascript", "-e", apple_script],
            check=True,
            capture_output=True,
            text=True
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"AppleScript error: {e.stderr}")
        return False


def build_improvement_prompt(improvement: dict) -> str:
    """Build a prompt for a specific improvement."""
    prompt = f"""## IMPROVEMENT TASK #{improvement.get('id', '?')}

**Category:** {improvement.get('category', 'unknown')}
**Priority:** {improvement.get('priority', 'medium')}
**Title:** {improvement.get('title', 'Unknown')}

### Description
{improvement.get('description', 'No description')}

### Files to Modify
{chr(10).join(f"- {f}" for f in improvement.get('files', ['Unknown']))}

### Acceptance Criteria
{chr(10).join(f"- {c}" for c in improvement.get('acceptance_criteria', ['Complete the task']))}

---

## INSTRUCTIONS

1. Read the relevant files first
2. Implement the improvement following ScoutPulse patterns
3. Check for TypeScript errors: `npm run type-check`
4. Test the changes in browser
5. When complete, update `autonomous-agent/improvement_list.json`:
   - Find improvement #{improvement.get('id', '?')}
   - Change `"completed": false` to `"completed": true`
6. Commit changes: `git add . && git commit -m "Improve: {improvement.get('title', 'Unknown')}"`

Start by reading the files listed above.
"""
    return prompt


def build_initializer_prompt() -> str:
    """Build the initialization prompt."""
    return """## INITIALIZE SCOUTPULSE IMPROVEMENT AGENT

Your task is to analyze the ScoutPulse codebase and create an improvement list.

### Step 1: Explore the Codebase

```bash
# Project structure
ls -la
ls -la app/
ls -la components/
ls -la lib/

# Current pages
find app -name "page.tsx" | head -30

# Recent git history  
git log --oneline -10
```

### Step 2: Read the Game Plan

```bash
cat autonomous-agent/prompts/gameplan.md
```

### Step 3: Create improvement_list.json

Create `autonomous-agent/improvement_list.json` with 100 improvements following this format:

```json
[
  {
    "id": 1,
    "category": "ui",
    "priority": "high",
    "title": "Brief title",
    "description": "Detailed description",
    "files": ["path/to/file.tsx"],
    "acceptance_criteria": ["Criterion 1", "Criterion 2"],
    "completed": false
  }
]
```

**Categories:** bug, ui, feature, integration, performance, refactor
**Priorities:** critical, high, medium, low

Focus on:
1. Priority 1 items from game plan (Player experience)
2. Bug fixes and polish
3. Integration completeness
4. Performance improvements

### Step 4: Save Progress

Create `autonomous-agent/progress.txt` with your analysis summary.

Start by exploring the codebase structure.
"""


def run_session(is_first_run: bool) -> str:
    """
    Run a single improvement session.
    
    Args:
        is_first_run: Whether this is the first session
        
    Returns:
        Status: "continue", "complete", or "error"
    """
    if is_first_run:
        prompt = build_initializer_prompt()
        print("Sending initialization prompt to Cursor...")
    else:
        # Get next improvement
        improvement = get_next_improvement(AGENT_DIR)
        
        if improvement is None:
            return "complete"
        
        print(f"\nWorking on: [{improvement.get('priority', 'medium').upper()}] {improvement.get('title', 'Unknown')}")
        prompt = build_improvement_prompt(improvement)
        print("Sending improvement prompt to Cursor...")
    
    success = send_to_cursor(prompt)
    
    if success:
        return "continue"
    else:
        return "error"


def wait_for_completion():
    """Wait for user to indicate completion or timeout."""
    print("\n" + "-" * 50)
    print("Agent is working in Cursor...")
    print("Press Enter when the agent has completed this task")
    print("Or type 'skip' to move to the next improvement")
    print("Or type 'quit' to stop the agent")
    print("-" * 50)
    
    try:
        user_input = input("> ").strip().lower()
        return user_input
    except EOFError:
        return "quit"


def main():
    parser = argparse.ArgumentParser(description="ScoutPulse Autonomous Agent (Cursor Edition)")
    parser.add_argument("--max-iterations", type=int, default=None, help="Max iterations")
    parser.add_argument("--auto", action="store_true", help="Auto-continue without prompts")
    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("  SCOUTPULSE AUTONOMOUS AGENT (Cursor Edition)")
    print("=" * 60)
    print(f"\nProject: {PROJECT_ROOT}")
    print(f"Max iterations: {args.max_iterations or 'Unlimited'}")
    print()

    # Check if improvement_list.json exists
    improvements_file = AGENT_DIR / "improvement_list.json"
    is_first_run = not improvements_file.exists()

    if is_first_run:
        print("First run - will initialize improvement list")
    else:
        print_progress_summary(AGENT_DIR)

    # Main loop
    iteration = 0

    while True:
        iteration += 1

        if args.max_iterations and iteration > args.max_iterations:
            print(f"\nReached max iterations ({args.max_iterations})")
            break

        print(f"\n{'=' * 60}")
        print(f"  SESSION {iteration}")
        print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'=' * 60}")

        status = run_session(is_first_run)
        is_first_run = False

        if status == "complete":
            print("\n✅ ALL IMPROVEMENTS COMPLETE!")
            break

        if status == "error":
            print("\n❌ Error occurred. Retrying...")
            time.sleep(5)
            continue

        # Wait for completion
        if args.auto:
            print(f"\nAuto-continuing in {DELAY_BETWEEN_SESSIONS} seconds...")
            time.sleep(DELAY_BETWEEN_SESSIONS)
        else:
            user_input = wait_for_completion()
            
            if user_input == "quit":
                print("\nStopping agent...")
                break
            elif user_input == "skip":
                print("\nSkipping to next improvement...")
                continue

        # Show progress
        print_progress_summary(AGENT_DIR)

    # Final summary
    print("\n" + "=" * 60)
    print("  SESSION COMPLETE")
    print("=" * 60)
    print_progress_summary(AGENT_DIR)
    print("\nTo continue: python cursor_agent.py")


if __name__ == "__main__":
    main()

