#!/usr/bin/env python3
"""
ScoutPulse Autonomous Improvement Agent
========================================

A continuous improvement agent that works through a prioritized list of
improvements for the ScoutPulse application.

Example Usage:
    python run_agent.py
    python run_agent.py --max-iterations 5
"""

import argparse
import asyncio
import os
from pathlib import Path

from agent import run_improvement_agent


# Configuration
DEFAULT_MODEL = "claude-sonnet-4-5-20250929"
PROJECT_ROOT = Path(__file__).parent.parent  # ScoutPulse root


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="ScoutPulse Autonomous Improvement Agent",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Start/continue improvements
  python run_agent.py

  # Limit iterations for testing
  python run_agent.py --max-iterations 3

  # Use a specific model
  python run_agent.py --model claude-opus-4-5-20251101

Environment Variables:
  ANTHROPIC_API_KEY    Your Anthropic API key (required)
        """,
    )

    parser.add_argument(
        "--max-iterations",
        type=int,
        default=None,
        help="Maximum number of agent iterations (default: unlimited)",
    )

    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"Claude model to use (default: {DEFAULT_MODEL})",
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output",
    )

    return parser.parse_args()


def main() -> None:
    """Main entry point."""
    args = parse_args()

    # Check for API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("=" * 60)
        print("  ERROR: ANTHROPIC_API_KEY not set")
        print("=" * 60)
        print("\nGet your API key from: https://console.anthropic.com/")
        print("\nThen set it:")
        print("  export ANTHROPIC_API_KEY='your-api-key-here'")
        return

    print("\n" + "=" * 60)
    print("  SCOUTPULSE AUTONOMOUS IMPROVEMENT AGENT")
    print("=" * 60)
    print(f"\nProject: {PROJECT_ROOT}")
    print(f"Model: {args.model}")
    if args.max_iterations:
        print(f"Max iterations: {args.max_iterations}")
    else:
        print("Max iterations: Unlimited")
    print()

    # Run the agent
    try:
        asyncio.run(
            run_improvement_agent(
                project_dir=PROJECT_ROOT,
                model=args.model,
                max_iterations=args.max_iterations,
                verbose=args.verbose,
            )
        )
    except KeyboardInterrupt:
        print("\n\n" + "-" * 60)
        print("  INTERRUPTED BY USER")
        print("-" * 60)
        print("\nTo resume, run the same command again.")
        print("Progress has been saved.")
    except Exception as e:
        print(f"\nFatal error: {e}")
        raise


if __name__ == "__main__":
    main()

