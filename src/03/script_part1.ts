import { readFile } from 'fs/promises';

const alphabetLowercase = 'abcdefghijklmnopqrstuvwxyz';
const priorityIndex = alphabetLowercase + alphabetLowercase.toUpperCase();

const arraySum = (items: readonly number[]) => items.reduce((sum, next) => sum + next, 0);

const priorities = (await readFile('input.txt'))
    .toString()
    .split('\r\n')
    .map<[string, string]>(allItems => [allItems.substring(0, allItems.length / 2.0), allItems.substring(allItems.length / 2.0, allItems.length)])
    .map<[readonly string[], ReadonlySet<string>]>(split => [ split[0].split(''), new Set(split[1].split('')) ])
    .map<ReadonlySet<string>>(compartments => new Set(compartments[0].filter(item => compartments[1].has(item))))
    .map<readonly number[]>(duplicates => Array.from(duplicates.values()).map(item => priorityIndex.indexOf(item) + 1))
    .map<number>(arraySum);

console.log(arraySum(priorities));