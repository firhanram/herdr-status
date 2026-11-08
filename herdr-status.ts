// Reports Command Code's agent state to Herdr desktop via OSC 7501.
import type {ModApi} from '@commandcode/harness';

const APP = 'command-code';

type State = 'idle' | 'working' | 'blocked' | 'done';

export default function (cmd: ModApi): void {
	if (!process.stdout.isTTY) return;

	let running = 0;
	let waiting = 0;
	let last: State | undefined;

	const report = (state: State): void => {
		if (state === last) return;
		last = state;
		try {
			process.stdout.write(`\u001b]7501;state=${state}:app=${APP}\u001b\\`);
		} catch {}
	};

	const settle = (): void => {
		if (waiting > 0) report('blocked');
		else if (running > 0) report('working');
		else report('idle');
	};

	cmd.on('run_start', () => {
		running += 1;
		report('working');
	});

	cmd.on('run_end', () => {
		running = Math.max(0, running - 1);
		if (running === 0 && waiting === 0) report('done');
		else settle();
	});

	// These two are emitted by the interactive host but are not in the public
	// AgentEvent union, so subscribe through an untyped view of the emitter.
	const on = cmd.on as (event: string, handler: () => void) => unknown;

	on('interaction_requested', () => {
		waiting += 1;
		report('blocked');
	});

	on('interaction_resolved', () => {
		waiting = Math.max(0, waiting - 1);
		settle();
	});

	cmd.hooks({
		onSessionStart: () => {
			running = 0;
			waiting = 0;
			last = undefined;
			report('idle');
		},
		onSessionEnd: () => {
			running = 0;
			waiting = 0;
			last = undefined;
			report('idle');
		},
	});
}
