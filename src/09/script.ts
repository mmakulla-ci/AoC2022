import { readFile } from 'fs/promises';
import { EOL } from 'os';

type StepDirection = 'U' | 'D' | 'L' | 'R';
type Point = [number, number];

function distance([ p1, p2 ]: Point, [ q1, q2 ]: Point): number {
    return Math.sqrt(((q1 - p1) ** 2) + ((q2 - p2) ** 2));
}

const headMovements = (await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(row => /(?<direction>[U|D|L|R]) (?<steps>\d+)/g.exec(row)!.groups!)
        .map(({ direction, steps }) => ({ direction: direction as StepDirection, steps: parseInt(steps) }))
        .flatMap(movement => Array<StepDirection>(movement.steps).fill(movement.direction));

const movementVectors: Record<StepDirection, (p: Point) => Point> = {
    'D': ([x, y]) => [x     , y - 1],
    'U': ([x, y]) => [x     , y + 1],
    'L': ([x, y]) => [x - 1 , y    ],
    'R': ([x, y]) => [x + 1 , y    ]
}

let headPosition: Point = [0, 0];
let tailPosition: Point = [0, 0];

const visitedByTail = new Set<String>();
function recordTailPosition() {
    visitedByTail.add(JSON.stringify(tailPosition));
}

recordTailPosition();

headMovements.forEach(movement => {
    headPosition = movementVectors[movement](headPosition);
    const tailDistance = distance(tailPosition, headPosition);
    
    // must move tail
    if(tailDistance >= 2) {

        // always mimic the movement of the head
        // works for cardinal and diagonal movements
        tailPosition = movementVectors[movement](tailPosition);

        // diagonal movement
        if(!Number.isInteger(tailDistance)) {
            if(movement === 'D' || movement === 'U') {
                tailPosition = [ headPosition[0], tailPosition[1] ];
            } else {
                tailPosition = [ tailPosition[0], headPosition[1] ];
            }
        }
    }

    recordTailPosition();
});

// --- Part 1 ---

console.log('Part 1:', visitedByTail.size);