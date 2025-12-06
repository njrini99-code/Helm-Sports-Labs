"""
Progress Tracking Utilities
===========================

Functions for tracking and displaying improvement progress.
"""

import json
from pathlib import Path
from datetime import datetime


def count_improvements(agent_dir: Path) -> tuple[int, int, dict]:
    """
    Count completed and total improvements.

    Args:
        agent_dir: Directory containing improvement_list.json

    Returns:
        (completed_count, total_count, by_category)
    """
    improvements_file = agent_dir / "improvement_list.json"

    if not improvements_file.exists():
        return 0, 0, {}

    try:
        with open(improvements_file, "r") as f:
            improvements = json.load(f)

        total = len(improvements)
        completed = sum(1 for i in improvements if i.get("completed", False))

        # Count by category
        by_category = {}
        for imp in improvements:
            cat = imp.get("category", "unknown")
            if cat not in by_category:
                by_category[cat] = {"total": 0, "completed": 0}
            by_category[cat]["total"] += 1
            if imp.get("completed", False):
                by_category[cat]["completed"] += 1

        return completed, total, by_category
    except (json.JSONDecodeError, IOError):
        return 0, 0, {}


def get_next_improvement(agent_dir: Path) -> dict | None:
    """
    Get the next improvement to work on.

    Args:
        agent_dir: Directory containing improvement_list.json

    Returns:
        Next incomplete improvement or None
    """
    improvements_file = agent_dir / "improvement_list.json"

    if not improvements_file.exists():
        return None

    try:
        with open(improvements_file, "r") as f:
            improvements = json.load(f)

        # Priority order
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}

        # Find first incomplete, prioritized
        incomplete = [i for i in improvements if not i.get("completed", False)]
        if not incomplete:
            return None

        # Sort by priority, then by quick win status
        incomplete.sort(
            key=lambda x: (
                priority_order.get(x.get("priority", "low"), 4),
                0 if x.get("quickWin", False) else 1,
                x.get("id", 999)
            )
        )

        return incomplete[0]
    except (json.JSONDecodeError, IOError):
        return None


def print_session_header(session_num: int, is_initializer: bool) -> None:
    """Print a formatted header for the session."""
    session_type = "INITIALIZER" if is_initializer else "IMPROVEMENT"

    print("\n" + "=" * 60)
    print(f"  SESSION {session_num}: {session_type}")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()


def print_progress_summary(agent_dir: Path) -> None:
    """Print a summary of current progress."""
    completed, total, by_category = count_improvements(agent_dir)

    if total > 0:
        percentage = (completed / total) * 100
        print(f"\n┌{'─' * 58}┐")
        print(f"│  PROGRESS: {completed}/{total} improvements ({percentage:.1f}%)")
        print(f"├{'─' * 58}┤")
        
        # Show by category
        for cat, counts in sorted(by_category.items()):
            cat_pct = (counts["completed"] / counts["total"]) * 100 if counts["total"] > 0 else 0
            bar_width = 20
            filled = int(bar_width * counts["completed"] / counts["total"]) if counts["total"] > 0 else 0
            bar = "█" * filled + "░" * (bar_width - filled)
            print(f"│  {cat:<12} [{bar}] {counts['completed']}/{counts['total']}")
        
        print(f"└{'─' * 58}┘")

        # Show next improvement
        next_imp = get_next_improvement(agent_dir)
        if next_imp:
            print(f"\nNext: [{next_imp.get('priority', 'medium').upper()}] {next_imp.get('title', 'Unknown')}")
    else:
        print("\nProgress: improvement_list.json not yet created")


def update_progress_file(agent_dir: Path, session_summary: str) -> None:
    """
    Append to progress.txt file.

    Args:
        agent_dir: Directory containing progress.txt
        session_summary: Summary of this session
    """
    progress_file = agent_dir / "progress.txt"
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"\n{'=' * 60}\nSESSION: {timestamp}\n{'=' * 60}\n{session_summary}\n"

    with open(progress_file, "a") as f:
        f.write(entry)

