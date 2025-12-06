"""
Claude SDK Client Configuration
===============================

Functions for creating and configuring the Claude Agent SDK client.
"""

import json
import os
from pathlib import Path

try:
    from claude_code_sdk import ClaudeCodeOptions, ClaudeSDKClient
    from claude_code_sdk.types import HookMatcher
    HAS_CLAUDE_SDK = True
except ImportError:
    HAS_CLAUDE_SDK = False

from security import bash_security_hook


# Browser automation tools
BROWSER_TOOLS = [
    "mcp__puppeteer__puppeteer_navigate",
    "mcp__puppeteer__puppeteer_screenshot",
    "mcp__puppeteer__puppeteer_click",
    "mcp__puppeteer__puppeteer_fill",
    "mcp__puppeteer__puppeteer_select",
    "mcp__puppeteer__puppeteer_hover",
    "mcp__puppeteer__puppeteer_evaluate",
]

# Built-in tools
BUILTIN_TOOLS = [
    "Read",
    "Write",
    "Edit",
    "Glob",
    "Grep",
    "Bash",
]


def create_client(project_dir: Path, model: str):
    """
    Create a Claude Agent SDK client configured for ScoutPulse.

    Args:
        project_dir: ScoutPulse project directory
        model: Claude model to use

    Returns:
        Configured ClaudeSDKClient

    Security layers:
    1. Sandbox - OS-level bash command isolation
    2. Permissions - File operations restricted to project directory
    3. Security hooks - Bash commands validated against allowlist
    """
    if not HAS_CLAUDE_SDK:
        raise RuntimeError(
            "claude_code_sdk not installed.\n"
            "Install with: pip install claude-code-sdk"
        )

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY environment variable not set.\n"
            "Get your API key from: https://console.anthropic.com/"
        )

    # Security settings
    security_settings = {
        "sandbox": {"enabled": True, "autoAllowBashIfSandboxed": True},
        "permissions": {
            "defaultMode": "acceptEdits",
            "allow": [
                # Allow file operations within project
                "Read(./**)",
                "Write(./**)",
                "Edit(./**)",
                "Glob(./**)",
                "Grep(./**)",
                # Bash with security hook validation
                "Bash(*)",
                # Browser automation
                *BROWSER_TOOLS,
            ],
        },
    }

    # Write settings file
    agent_dir = project_dir / "autonomous-agent"
    agent_dir.mkdir(parents=True, exist_ok=True)
    settings_file = agent_dir / ".claude_settings.json"
    
    with open(settings_file, "w") as f:
        json.dump(security_settings, f, indent=2)

    print(f"Security settings: {settings_file}")
    print("  - Sandbox enabled")
    print(f"  - Filesystem restricted to: {project_dir}")
    print("  - Bash commands validated")
    print()

    return ClaudeSDKClient(
        options=ClaudeCodeOptions(
            model=model,
            system_prompt="""You are an expert full-stack developer improving the ScoutPulse 
baseball recruiting platform. You have deep expertise in:
- Next.js 14 and React 18
- TypeScript and type safety
- Tailwind CSS and modern UI design
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Building premium, polished user experiences

Your goal is to systematically improve the application by working through 
the improvement list, one item at a time, with high quality and attention 
to detail. Always test your changes thoroughly before marking complete.""",
            allowed_tools=[
                *BUILTIN_TOOLS,
                *BROWSER_TOOLS,
            ],
            mcp_servers={
                "puppeteer": {"command": "npx", "args": ["puppeteer-mcp-server"]}
            },
            hooks={
                "PreToolUse": [
                    HookMatcher(matcher="Bash", hooks=[bash_security_hook]),
                ],
            },
            max_turns=1000,
            cwd=str(project_dir.resolve()),
            settings=str(settings_file.resolve()),
        )
    )

