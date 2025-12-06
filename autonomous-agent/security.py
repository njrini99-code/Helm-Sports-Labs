"""
Security Hooks for ScoutPulse Autonomous Agent
==============================================

Pre-tool-use hooks that validate bash commands for security.
Uses an allowlist approach - only explicitly permitted commands can run.
"""

import os
import re
import shlex


# Allowed commands for ScoutPulse development
ALLOWED_COMMANDS = {
    # File inspection
    "ls",
    "cat",
    "head",
    "tail",
    "wc",
    "grep",
    "find",
    # File operations
    "cp",
    "mkdir",
    "chmod",
    "touch",
    "rm",  # Validated separately
    # Directory
    "pwd",
    "cd",
    # Node.js development
    "npm",
    "npx",
    "node",
    # Version control
    "git",
    # Process management
    "ps",
    "lsof",
    "sleep",
    "pkill",
    # Next.js specific
    "next",
}

# Commands requiring extra validation
COMMANDS_NEEDING_EXTRA_VALIDATION = {"pkill", "chmod", "rm"}


def split_command_segments(command_string: str) -> list[str]:
    """Split a compound command into individual segments."""
    segments = re.split(r"\s*(?:&&|\|\|)\s*", command_string)
    result = []
    for segment in segments:
        sub_segments = re.split(r'(?<!["\'])\s*;\s*(?!["\'])', segment)
        for sub in sub_segments:
            sub = sub.strip()
            if sub:
                result.append(sub)
    return result


def extract_commands(command_string: str) -> list[str]:
    """Extract command names from a shell command string."""
    commands = []
    segments = re.split(r'(?<!["\'])\s*;\s*(?!["\'])', command_string)

    for segment in segments:
        segment = segment.strip()
        if not segment:
            continue

        try:
            tokens = shlex.split(segment)
        except ValueError:
            return []

        if not tokens:
            continue

        expect_command = True

        for token in tokens:
            if token in ("|", "||", "&&", "&"):
                expect_command = True
                continue

            if token in (
                "if", "then", "else", "elif", "fi", "for", "while",
                "until", "do", "done", "case", "esac", "in", "!", "{", "}"
            ):
                continue

            if token.startswith("-"):
                continue

            if "=" in token and not token.startswith("="):
                continue

            if expect_command:
                cmd = os.path.basename(token)
                commands.append(cmd)
                expect_command = False

    return commands


def validate_pkill_command(command_string: str) -> tuple[bool, str]:
    """Validate pkill - only allow killing dev processes."""
    allowed_processes = {"node", "npm", "npx", "next"}

    try:
        tokens = shlex.split(command_string)
    except ValueError:
        return False, "Could not parse pkill command"

    if not tokens:
        return False, "Empty pkill command"

    args = [t for t in tokens[1:] if not t.startswith("-")]

    if not args:
        return False, "pkill requires a process name"

    target = args[-1]
    if " " in target:
        target = target.split()[0]

    if target in allowed_processes:
        return True, ""
    return False, f"pkill only allowed for: {allowed_processes}"


def validate_rm_command(command_string: str) -> tuple[bool, str]:
    """Validate rm - only allow removing specific file types."""
    try:
        tokens = shlex.split(command_string)
    except ValueError:
        return False, "Could not parse rm command"

    if not tokens:
        return False, "Empty rm command"

    # Check for dangerous flags
    dangerous_flags = {"-rf", "-fr", "--recursive", "-r"}
    for token in tokens:
        if token in dangerous_flags:
            return False, f"Dangerous flag not allowed: {token}"

    # Allow removing only certain files
    allowed_patterns = [
        r"\.next/",  # Next.js build cache
        r"node_modules/",  # Dependencies (if reinstalling)
        r"\.turbo/",  # Turbo cache
        r"dist/",  # Build output
        r"\.tmp",  # Temp files
    ]

    files = [t for t in tokens[1:] if not t.startswith("-")]
    for f in files:
        if not any(re.search(pattern, f) for pattern in allowed_patterns):
            return False, f"rm not allowed for: {f}"

    return True, ""


def validate_chmod_command(command_string: str) -> tuple[bool, str]:
    """Validate chmod - only allow +x."""
    try:
        tokens = shlex.split(command_string)
    except ValueError:
        return False, "Could not parse chmod command"

    if not tokens or tokens[0] != "chmod":
        return False, "Not a chmod command"

    mode = None
    for token in tokens[1:]:
        if token.startswith("-"):
            return False, "chmod flags not allowed"
        elif mode is None:
            mode = token

    if mode is None:
        return False, "chmod requires a mode"

    if not re.match(r"^[ugoa]*\+x$", mode):
        return False, f"chmod only allowed with +x, got: {mode}"

    return True, ""


def get_command_for_validation(cmd: str, segments: list[str]) -> str:
    """Find the segment containing a specific command."""
    for segment in segments:
        if cmd in extract_commands(segment):
            return segment
    return ""


async def bash_security_hook(input_data, tool_use_id=None, context=None):
    """
    Pre-tool-use hook that validates bash commands.

    Args:
        input_data: Dict with tool_name and tool_input
        tool_use_id: Optional tool use ID
        context: Optional context

    Returns:
        Empty dict to allow, or {"decision": "block", "reason": "..."} to block
    """
    if input_data.get("tool_name") != "Bash":
        return {}

    command = input_data.get("tool_input", {}).get("command", "")
    if not command:
        return {}

    commands = extract_commands(command)

    if not commands:
        return {
            "decision": "block",
            "reason": f"Could not parse command: {command}",
        }

    segments = split_command_segments(command)

    for cmd in commands:
        if cmd not in ALLOWED_COMMANDS:
            return {
                "decision": "block",
                "reason": f"Command '{cmd}' not in allowed list",
            }

        if cmd in COMMANDS_NEEDING_EXTRA_VALIDATION:
            cmd_segment = get_command_for_validation(cmd, segments) or command

            if cmd == "pkill":
                allowed, reason = validate_pkill_command(cmd_segment)
                if not allowed:
                    return {"decision": "block", "reason": reason}
            elif cmd == "chmod":
                allowed, reason = validate_chmod_command(cmd_segment)
                if not allowed:
                    return {"decision": "block", "reason": reason}
            elif cmd == "rm":
                allowed, reason = validate_rm_command(cmd_segment)
                if not allowed:
                    return {"decision": "block", "reason": reason}

    return {}

