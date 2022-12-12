import { readFile } from 'fs/promises';
import { EOL } from 'os';

const START_CHAR = 'S';
const END_CHAR = 'E';
const charToHeight = new Map<string, number>([
    ...'abcdefghijklmnopqrstuvwxyz'.split('').map<[string, number]>((char, height) => [char, height]),
    [START_CHAR, 0],
    [END_CHAR, 25]
]);

interface HeightMapCell {
    readonly x: number;
    readonly y: number;
    readonly height: number;
    readonly heightChar: string;
}

const heightMap = (await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(row => row.split(''))
        .map<HeightMapCell[]>((chars, y) => chars.map((heightChar, x) => 
            ({ x, y, heightChar, height: charToHeight.get(heightChar)! })));

const allCells = heightMap.flatMap(row => row);

function getClimbeableNeighbors({ x, y, height }: HeightMapCell): readonly HeightMapCell[]  {
    const neighborAt: (dX: number, dy: number) => HeightMapCell | undefined = (dx, dy) => heightMap[y + dy]?.[x + dx];

    return [ 
        [-1,  0],
        [ 1,  0],
        [ 0, -1],
        [ 0,  1]
    ]
    .map(([nx, ny]) => neighborAt(nx, ny))
    .filter((cell): cell is HeightMapCell => cell !== undefined && cell.height <= height + 1)
}


const shortestPathLength = (startCells: readonly HeightMapCell[]) => {

    return Math.min(...startCells.map(startCell => {
        
        const distances = new Map<HeightMapCell, number>(allCells.map(cell => [ cell, Infinity ]));
        const remainingCells = new Set(allCells);

        const endCell = allCells.filter(cell => cell.heightChar === END_CHAR)[0];
        distances.set(startCell, 0);

        while(remainingCells.size > 0) {
            const currentCell = [...remainingCells].sort((a, b) => distances.get(a)! - distances.get(b)!).at(0)!;
            remainingCells.delete(currentCell);

            if(currentCell === endCell) {
                break;
            }

            getClimbeableNeighbors(currentCell)
                .filter(neighbor => remainingCells.has(neighbor))
                .forEach(neighbor => distances.set(neighbor, Math.min(distances.get(neighbor)!, distances.get(currentCell)! + 1)));
        }

        return distances.get(endCell)!;
    }));
}

// --- Part 1 ---
console.log('Part 1:', shortestPathLength(allCells.filter(cell => cell.heightChar === START_CHAR)));

// --- Part 2 ---
console.log('Part 2:', shortestPathLength(allCells.filter(cell => cell.heightChar === 'a')));