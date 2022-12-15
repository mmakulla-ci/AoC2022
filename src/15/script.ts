import { readFile } from 'fs/promises';
import { EOL } from 'os';

function manhattan(x0: number, y0: number, x1: number, y1: number) {
    return Math.abs(x0 - x1) + Math.abs(y0 - y1);
}

const sensorData = (await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(input => [.../Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/g.exec(input)!])
        .map(coordinates => coordinates.map(coordinate => parseInt(coordinate)))
        .map(([_, sx, sy, bx, by]) => ({ sx, sy, bx, by, coverage: manhattan(sx, sy, bx, by) }));


function getSensorsInRange(x: number, y: number) {
    return sensorData.filter(({ sx, sy, coverage }) => manhattan(sx, sy, x, y) <= coverage);
}

function part1(y: number): number {

    const minX = Math.min(...sensorData.map(({ sx, coverage }) => sx - coverage));
    const maxX = Math.max(...sensorData.map(({ sx, coverage }) => sx + coverage));

    let result = 0;
    for(let x = minX; x <= maxX; x++) {
        const sensorsInRange = getSensorsInRange(x, y);
        const beaconsAtPosition = sensorData.filter(({ bx, by }) => bx === x && by === y);

        if(sensorsInRange.length > 0 && beaconsAtPosition.length === 0) {
            result++;
        }
    }

    return result;
}

console.log('Part 1:', part1(2000000));

function part2(edgeLength: number): number | null {
    let x = 0;
    let y = 0;

    let coveredBySensor = getSensorsInRange(x, y).at(-1);

    while(coveredBySensor !== undefined) {

        x = coveredBySensor.sx + coveredBySensor.coverage - Math.abs(y - coveredBySensor.sy) + 1;

        if(x > edgeLength) {
            y++;
            x = 0;
        }

        coveredBySensor = getSensorsInRange(x, y).at(-1);
    }

    return x * 4000000 + y;
}


console.log('Part 2:', part2(4000000));