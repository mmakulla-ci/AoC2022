import { readFile } from 'fs/promises';
import { EOL } from 'os';

const cubes = new Set<string>((await readFile('input.txt'))
        .toString()
        .split(EOL));

function hasNeightborAt(dx: number, dy: number, dz: number, cube: string) {
    const [x, y, z] = cube.split(',').map(str => parseInt(str));
    return cubes.has(`${x + dx},${y + dy},${z + dz}`);
}

const part1 = [...cubes.values()].map(cube => {
    return [
        [-1,  0,  0],
        [ 1,  0,  0],
        [ 0, -1,  0],
        [ 0,  1,  0],
        [ 0,  0, -1],
        [ 0,  0,  1]
    ]
    .map(([dx, dy, dz]) => hasNeightborAt(dx, dy, dz, cube))
    .reduce<number>((sum, hasNeighbor) => sum + (hasNeighbor ? 0 : 1), 0);
}).reduce((sum, value) => sum + value, 0);

console.log('Part 1:', part1);