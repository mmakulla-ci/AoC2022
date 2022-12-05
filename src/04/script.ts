import { readFile } from 'fs/promises';

type Range = [number, number];
type RangePair = [Range, Range];

const regInt = (reg: RegExpExecArray, index: number) => parseInt(reg.at(index)!);
const fullyContained = (outer: Range, inner: Range) => outer[0] <= inner[0] && outer[1] >= inner[1];

const filterRanges = async (predicate: (pair: RangePair) => boolean) => (await readFile('input.txt'))
    .toString()
    .split('\r\n')
    .map(rawString => /(\d+)\-(\d+),(\d+)\-(\d+)/.exec(rawString)!)
    .map<RangePair>(reg => [[regInt(reg, 1), regInt(reg, 2)], [regInt(reg, 3), regInt(reg, 4)]])
    .filter(predicate)
    .length;

const part1 = await filterRanges(ranges => fullyContained(ranges[0], ranges[1]) || fullyContained(ranges[1], ranges[0]));
const part2 = await filterRanges(ranges => Math.max(ranges[0][0], ranges[1][0]) <= Math.min(ranges[0][1], ranges[1][1]));

console.log('Part 1:', part1);
console.log('Part 2:', part2);