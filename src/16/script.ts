import { readFile } from 'fs/promises';
import { EOL } from 'os';

interface Valve {
    readonly name: string;
    readonly flow: number;
    readonly leadsTo: readonly string[];
    readonly isOpen: boolean;
}

const valves = new Map<string, Valve>((await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(input => [.../Valve (\S\S) has flow rate=(\d+); tunnels? leads? to valves? ((?:\S\S(?:, )?)+)/g.exec(input)!])
        .map(([_, name, flow, leadsTo]) => ({ name, flow: parseInt(flow), leadsTo: leadsTo.split(', '), isOpen: false }))
        .map(valve => [valve.name, valve]));

console.log(valves)