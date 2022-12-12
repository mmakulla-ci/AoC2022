import { readFile } from 'fs/promises';
import { EOL } from 'os';
import * as Jimp from 'jimp';

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
    .filter((cell): cell is HeightMapCell => cell !== undefined && cell.height >= height - 1)
}

// solve with dijkstra's algorithm
const distances = new Map<HeightMapCell, number>(allCells.map(cell => [ cell, Infinity ]));
const predecessors = new Map<HeightMapCell, HeightMapCell | null>(allCells.map(cell => [ cell, null ]));
const remainingCells = new Set(allCells);

const endCell = allCells.filter(cell => cell.heightChar === END_CHAR)[0];
distances.set(endCell, 0);

while(remainingCells.size > 0) {
    const currentCell = [...remainingCells].sort((a, b) => distances.get(a)! - distances.get(b)!).at(0)!;
    remainingCells.delete(currentCell);

    getClimbeableNeighbors(currentCell)
        .filter(neighbor => remainingCells.has(neighbor))
        .forEach(neighbor => {
            const alternativeDistance = distances.get(currentCell)! + 1;
            if(alternativeDistance < distances.get(neighbor)!) {
                distances.set(neighbor, alternativeDistance);
                predecessors.set(neighbor, currentCell);
            }
            
        });
}

function shortestPathLength(forCells: readonly HeightMapCell[]): number {
    return Math.min(...forCells.map(cell => distances.get(cell)!));
}

// --- Part 1 ---
const startCellPart1 = allCells.filter(cell => cell.heightChar === START_CHAR).at(0)!;
console.log('Part 1:', shortestPathLength([startCellPart1]));

// --- Part 2 ---
console.log('Part 2:', shortestPathLength(allCells.filter(cell => cell.heightChar === 'a')));



// --- Render ---
const path = new Set<HeightMapCell>;
let currentCell: HeightMapCell | null = startCellPart1;
if(predecessors.has(currentCell) || currentCell === endCell) {
    while(currentCell !== null) {
        path.add(currentCell);
        currentCell = predecessors.get(currentCell) ?? null;
    }
}

const gradient = await Jimp.default.read('geo-gradient.png');
const getColorForHeightLevel = (level: number) => gradient.getPixelColor(gradient.getWidth() / 25 * level, 0);

const cellPixelSize = 3;
const imgWidth = heightMap[0].length * cellPixelSize;
const imageHeight = heightMap.length * cellPixelSize;

const image = new Jimp.default(imgWidth, imageHeight);

for(let cellY = 0; cellY < heightMap.length; cellY++) {
    for(let cellX = 0; cellX < heightMap[0].length; cellX++) {
        const cell = heightMap[cellY][cellX];
        const cellColor = path.has(cell) ? 0xFF0000FF : getColorForHeightLevel(cell.height);

        for(let cellImageY = cellY * cellPixelSize; cellImageY < (cellY + 1) * cellPixelSize; cellImageY++) {
            for(let cellImageX = cellX * cellPixelSize; cellImageX < (cellX + 1) * cellPixelSize; cellImageX++) {
                image.setPixelColor(cellColor, cellImageX, cellImageY);
            }                    
        }

    }   
}

await image.writeAsync('day12.png');