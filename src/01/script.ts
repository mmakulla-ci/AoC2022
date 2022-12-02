import { readFile } from 'fs/promises';

const sortedAggregated = (await readFile('input.txt'))
    .toString()
    .split('\r\n')
    .map(calories => parseInt(calories))
    .reduce<number[]>((all, next) => isNaN(next) ? [...all, 0] : [...all.slice(0, -1), all[all.length - 1] + next], [0])
    .sort((a, b) => b - a);

console.log(sortedAggregated[0]);
console.log(sortedAggregated.slice(0, 3).reduce((sum, next) => sum + next, 0));