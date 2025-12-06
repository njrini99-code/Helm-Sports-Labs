"""
Prompt Loading Utilities
========================

Functions for loading and preparing prompts for the agent.
"""

from pathlib import Path


def get_prompt_dir() -> Path:
    """Get the prompts directory path."""
    return Path(__file__).parent / "prompts"


def load_prompt(filename: str) -> str:
    """Load a prompt from the prompts directory."""
    prompt_path = get_prompt_dir() / filename
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
    
    with open(prompt_path, "r") as f:
        return f.read()


def get_initializer_prompt() -> str:
    """Get the initializer agent prompt."""
    return load_prompt("initializer_prompt.md")


def get_improvement_prompt() -> str:
    """Get the improvement agent prompt."""
    return load_prompt("improvement_prompt.md")


def get_gameplan() -> str:
    """Get the game plan document."""
    return load_prompt("gameplan.md")

