# herdr-status

Reports Command Code's agent state to [Herdr](https://herdr.dev) desktop via OSC 7501, so Herdr shows **working / needs you / done** and plays its attention sounds.

## Why

Herdr desktop learns agent state from OSC 7501 terminal reports. Command Code's built-in Herdr integration targets the Herdr TUI socket API (`HERDR_ENV` + `pane.report_agent`), which Herdr desktop does not provide. This mod bridges the gap by emitting the OSC 7501 reports Herdr desktop expects.

## Install

```bash
cmd mods add firhanram/herdr-status -g
```

Or copy `herdr-status.ts` into `~/.commandcode/mods/`.

Restart Command Code, or run `/reload` in an existing session.

## Behavior

| Command Code event | Herdr state |
| --- | --- |
| session start | `idle` |
| `run_start` | `working` |
| permission or question prompt | `blocked` |
| prompt resolved | back to `working` |
| `run_end` | `done` |

Herdr shows the state in its sidebar and plays the matching sound. Herdr only plays the **done** sound when you are not focused on that pane; **blocked** plays regardless.

The mod writes only when stdout is a TTY, so headless and piped runs are unaffected. OSC 7501 is ignored by terminals that do not understand it.

## Development

```bash
cmd mods list
cmd mods inspect ./herdr-status.ts
```

Mods load once per process. Use `/reload` while iterating.

## License

MIT
