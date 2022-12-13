import { readFile } from 'fs/promises';
import { EOL } from 'os';

function areInRightOrder(left: any, right: any): boolean | null {
    if(Array.isArray(left) && Array.isArray(right)) {
        const leftFirstValue = left.at(0);
        const rightFirstValue = right.at(0);

        if(leftFirstValue === undefined && rightFirstValue === undefined) {
            return null; // both arrays empty
        }

        if(leftFirstValue === undefined) {
            return true; // only left array empty
        }

        if(rightFirstValue === undefined) {
            return false; // only right array empty
        }

        return areInRightOrder(leftFirstValue, rightFirstValue) ?? areInRightOrder(left.slice(1), right.slice(1));
    }

    if(Array.isArray(left) && !Array.isArray(right)) {
        return areInRightOrder(left, [right]);
    }

    if(!Array.isArray(left) && Array.isArray(right)) {
        return areInRightOrder([left], right);
    }

    return left < right ? true : left > right ? false : null;
}

// --- Part 1 ---
const part1 = (await readFile('input.txt'))
        .toString()
        .split(EOL + EOL)
        .map(packagePair => packagePair.split(EOL))
        .map(([left, right]) => [ JSON.parse(left), JSON.parse(right) ])
        .reduce((sum, [left, right], index) => areInRightOrder(left, right) ? index + 1 + sum : sum, 0);

console.log('Part 1:', part1);

// --- Part 2 ---
const divider1 = [[2]];
const divider2 = [[6]];

const part2 = (await readFile('input.txt'))
        .toString()
        .split(EOL)
        .filter(row => !!row)
        .map(row => JSON.parse(row))
        .concat([divider1, divider2])
        .sort((left, right) => areInRightOrder(left, right) ? -1 : 1);

console.log('Part 2:', (part2.indexOf(divider1) + 1) * (part2.indexOf(divider2) + 1));