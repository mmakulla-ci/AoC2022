import { readFile } from 'fs/promises';

const input = (await readFile('input.txt')).toString();

const getMarkerIndex = (size: number) => {
    let idx = size;
    for(; idx < input.length; idx++) {
        const chars = new Set(input.substring(idx - size, idx).split(''));
        if(chars.size === size) {
            break;
        }
    }
    return idx;
}

console.log('Part 1:', getMarkerIndex(4));
console.log('Part 2:', getMarkerIndex(14));