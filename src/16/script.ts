import { readFile } from 'fs/promises';
import { EOL } from 'os';
import { solveDijkstra } from '../util/dijkstra.js';

interface RawValve {
    readonly name: string;
    readonly flow: number;
    readonly leadsTo: readonly string[];
}

interface Valve {
    readonly name: string;
    readonly flow: number;
    readonly distances: Map<Valve, number>;
}

const startNodeName = 'AA';
const rawValves = new Map<string, RawValve>((await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(input => [.../Valve (\S\S) has flow rate=(\d+); tunnels? leads? to valves? ((?:\S\S(?:, )?)+)/g.exec(input)!])
        .map(([_, name, flow, leadsTo]) => ({ name, flow: parseInt(flow), leadsTo: leadsTo.split(', ') }))
        .map(valve => [valve.name, valve]));

const reducedGraph = new Map<string, Valve>([...rawValves.values()]
    .filter(valve => valve.flow > 0 || valve.name === startNodeName)
    .map(({ name, flow }) => [ name, { name, flow, distances: new Map() }]));

reducedGraph.forEach(valve => {
    const { distances } = solveDijkstra([...rawValves.values()], rawValves.get(valve.name)!, valve => valve.leadsTo.map(v => rawValves.get(v)!));

    [...reducedGraph.values()].filter(v => v !== valve)
        .forEach(neighbor => valve.distances.set(neighbor, distances.get(rawValves.get(neighbor.name)!)!));
});



function search(valve: Valve, visited: Set<Valve>, minutesLeft: number, flowPerMinute: number): number {

    visited = new Set(visited);
    visited.add(valve);

    return Math.max(...[...valve.distances]
        .filter(([nextValve]) => !visited.has(nextValve))
        .map(([nextValve, distance]) => {
            minutesLeft -= distance + 1;
            flowPerMinute += nextValve.flow;
            return search(nextValve, visited, minutesLeft, flowPerMinute);
        }));
}

search(reducedGraph.get(startNodeName)!, new Set(), 30, 0);