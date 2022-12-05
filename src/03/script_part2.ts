import { readFile } from 'fs/promises';

const alphabetLowercase = 'abcdefghijklmnopqrstuvwxyz';
const badgeIndex = alphabetLowercase + alphabetLowercase.toUpperCase();

const arraySum = (items: readonly number[]) => items.reduce((sum, next) => sum + next, 0);

const badges = (await readFile('input.txt'))
    .toString()
    .split('\r\n')
    .reduce((joined, nextLine, lineIndex) => `${joined}${lineIndex % 3 === 0 ? '#' : '$'}${nextLine}`, '')
    .split('#')
    .filter(line => line.length > 0) // first line is always empty
    .map<string[]>(allItems => allItems.split('$'))
    .map<[readonly string[], ReadonlySet<string>, ReadonlySet<string>]>(split => [ split[0].split(''), new Set(split[1].split('')), new Set(split[2].split('')) ])
    .map<ReadonlySet<string>>(backpacks => new Set(backpacks[0].filter(item => backpacks[1].has(item) && backpacks[2].has(item))))
    .map<number>(duplicates => Array.from(duplicates.values()).map(item => badgeIndex.indexOf(item) + 1)[0]);

console.log(arraySum(badges))