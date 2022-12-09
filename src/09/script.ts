import { readFile } from 'fs/promises';
import { EOL } from 'os';

type StepDirection = 'U' | 'D' | 'L' | 'R';
type Point = [number, number];

const headMovements = (await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(row => /(?<direction>[U|D|L|R]) (?<steps>\d+)/g.exec(row)!.groups!)
        .map(({ direction, steps }) => ({ direction: direction as StepDirection, steps: parseInt(steps) }))
        .flatMap(movement => Array<StepDirection>(movement.steps).fill(movement.direction));

const directions: {[dir: string]: Point} = {
    '🡼': [-1,  1],
    '🡸': [-1,  0],
    '🡿': [-1, -1],
    '🡹': [ 0,  1],
    '  ': [ 0,  0],
    '🡻': [ 0, -1],
    '🡽': [ 1,  1],
    '🡺': [ 1,  0],
    '🡾': [ 1, -1]
};

const stencil: (keyof typeof directions)[][] = [
    [ '🡼', '🡼', '🡹', '🡽', '🡽' ],
    [ '🡼', '  ', '  ', '  ', '🡽' ],
    [ '🡸', '  ', '  ', '  ', '🡺' ],
    [ '🡿', '  ', '  ', '  ', '🡾' ],
    [ '🡿', '🡿', '🡻', '🡾', '🡾' ]
].reverse();

function processRopeLink([ prevX, prevY ]: Point, [ x, y ]: Point): Point {
    const dx = (prevX - x);
    const dy = (prevY - y);
    
    const [ shiftX, shiftY ] = directions[stencil[dy + 2][dx + 2]];

    return [x + shiftX, y + shiftY];
}

function simulateRope(length: number) {
    const rope = Array<Point>(length).fill([0, 0]);

    const headMovementVectors: Record<StepDirection, (p: Point) => Point> = {
        'D': ([x, y]) => [x     , y - 1],
        'U': ([x, y]) => [x     , y + 1],
        'L': ([x, y]) => [x - 1 , y    ],
        'R': ([x, y]) => [x + 1 , y    ]
    }

    const visitedByTail = new Set<String>();

    function recordTailPosition() {
        visitedByTail.add(JSON.stringify(rope[rope.length - 1]));
    }

    recordTailPosition();

    headMovements.forEach(headMovement => {

        // move head
        rope[0] = headMovementVectors[headMovement](rope[0]);

        for(let linkIndex = 0; linkIndex < rope.length - 1; linkIndex++) {
            rope[linkIndex + 1] = processRopeLink(rope[linkIndex], rope[linkIndex + 1]);
        }

        recordTailPosition();
    });

    return visitedByTail.size;
}

// --- Part 1 ---
console.log('Part 1:', simulateRope(2));

// --- Part 2 ---
console.log('Part 2:', simulateRope(10));