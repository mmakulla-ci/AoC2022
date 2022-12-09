import { readFile } from 'fs/promises';
import { EOL } from 'os';

type InputStepDirection = 'U' | 'D' | 'L' | 'R';
type DirectionArrow = keyof typeof directions;
type Point = [number, number];

const inputToArrow: Record<InputStepDirection, DirectionArrow> = { 
    'L': '🡸', 
    'R': '🡺', 
    'U': '🡹', 
    'D': '🡻' 
};

const directions = {
    '🡼': [-1,  1] as Point,
    '🡸': [-1,  0] as Point,
    '🡿': [-1, -1] as Point,
    '🡹': [ 0,  1] as Point,
    '  ': [ 0,  0] as Point,
    '🡻': [ 0, -1] as Point,
    '🡽': [ 1,  1] as Point,
    '🡺': [ 1,  0] as Point,
    '🡾': [ 1, -1] as Point
};

const headMovementsVectors = (await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(row => /(?<direction>[U|D|L|R]) (?<steps>\d+)/g.exec(row)!.groups!)
        .map(({ direction, steps }) => ({ direction: direction as InputStepDirection, steps: parseInt(steps) }))
        .flatMap(movement => Array<InputStepDirection>(movement.steps).fill(movement.direction))
        .map(movement => inputToArrow[movement])
        .map(arrow => directions[arrow]);

let stencil: DirectionArrow[][] = [
    [ '🡼', '🡼', '🡹', '🡽', '🡽' ],
    [ '🡼', '  ', '  ', '  ', '🡽' ],
    [ '🡸', '  ', '  ', '  ', '🡺' ],
    [ '🡿', '  ', '  ', '  ', '🡾' ],
    [ '🡿', '🡿', '🡻', '🡾', '🡾' ]
];

stencil = stencil.reverse();

function processRopeLink([ prevX, prevY ]: Point, [ x, y ]: Point): Point {
    const dx = (prevX - x);
    const dy = (prevY - y);
    
    const [ shiftX, shiftY ] = directions[stencil[dy + 2][dx + 2]];

    return [x + shiftX, y + shiftY];
}

function simulateRope(length: number) {
    const rope = Array<Point>(length).fill([0, 0]);

    const visitedByTail = new Set<String>();
    function recordTailPosition() {
        visitedByTail.add(JSON.stringify(rope[rope.length - 1]));
    }

    recordTailPosition();

    headMovementsVectors.forEach(([dx, dy]) => {

        // move head
        const [ headX, headY ] = rope[0];
        rope[0] = [ headX + dx, headY + dy ];

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