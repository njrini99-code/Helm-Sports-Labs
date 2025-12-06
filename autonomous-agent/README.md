# ScoutPulse Autonomous Improvement Agent

An autonomous agent that continuously improves the ScoutPulse application by working through a prioritized feature/improvement list.

## Overview

This agent follows a **continuous improvement loop** pattern:
1. **Analyze** current state of the application
2. **Pick** highest priority improvement from `improvement_list.json`
3. **Implement** the improvement
4. **Test** through browser automation
5. **Commit** changes with descriptive messages
6. **Report** progress and move to next improvement

## Quick Start

```bash
# 1. Set your API key
export ANTHROPIC_API_KEY='your-api-key-here'

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the agent
python run_agent.py

# 4. Or run with limited iterations for testing
python run_agent.py --max-iterations 3
```

## How It Works

### Two-Agent Pattern

1. **Initializer Agent (First Run)**: 
   - Analyzes the existing ScoutPulse codebase
   - Creates `improvement_list.json` with prioritized improvements
   - Sets up progress tracking

2. **Improvement Agent (Subsequent Runs)**:
   - Picks up where previous session left off
   - Works on one improvement at a time
   - Tests thoroughly before marking complete
   - Commits progress to git

### Improvement Categories

- `bug`: Bug fixes and error corrections
- `ui`: UI/UX improvements and polish
- `feature`: New feature implementations
- `performance`: Performance optimizations
- `integration`: Database/API integrations
- `test`: Test coverage improvements

### Progress Tracking

- `improvement_list.json` - Source of truth for all improvements
- `progress.txt` - Session summaries and notes
- Git commits - Incremental progress saved

## Configuration

### Coach's Game Plan Integration

The agent reads from `gameplan.md` which contains:
- Priority areas from the coach
- Feature requirements
- UI/UX standards
- Database schema requirements
- Integration needs

### Security

- Sandbox mode enabled (OS-level isolation)
- Filesystem restricted to project directory
- Command allowlist for bash operations
- Browser automation for testing

## Files

```
autonomous-agent/
├── run_agent.py              # Main entry point
├── agent.py                  # Core agent logic
├── client.py                 # Claude SDK configuration
├── security.py               # Command allowlist
├── progress.py               # Progress tracking
├── prompts/
│   ├── gameplan.md           # Coach's game plan (input)
│   ├── initializer_prompt.md # First session prompt
│   └── improvement_prompt.md # Continuation prompt
├── improvement_list.json     # Generated improvement list
└── progress.txt              # Session progress notes
```

## Customization

### Adjusting the Game Plan

Edit `prompts/gameplan.md` to change:
- Priority features
- UI standards
- Database requirements
- Integration needs

### Modifying Improvement Count

Edit `prompts/initializer_prompt.md` to change the number of improvements generated.

### Adding Allowed Commands

Edit `security.py` to add commands to `ALLOWED_COMMANDS`.

## Troubleshooting

**"Agent appears to hang"**
This is normal during initialization. The agent is analyzing the codebase and generating improvements.

**"Command blocked"**
The security system blocked a command. Add it to `ALLOWED_COMMANDS` in `security.py` if needed.

**"API key not set"**
Ensure `ANTHROPIC_API_KEY` is exported in your shell.

## Integration with ScoutPulse

This agent is designed to work with the existing ScoutPulse codebase:
- Preserves existing authentication logic
- Maintains database schema
- Follows established UI patterns
- Integrates with Supabase

## License

Internal use for ScoutPulse development.

