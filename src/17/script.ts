import { readFile } from 'fs/promises';

type Direction = '<' | '>';
type ShapeMarker = '#' | '.' | '|' | '-' | '+' | '@';
type Shape = readonly ShapeMarker[][];
interface ActiveShape { left: number, top: number, readonly shape: Shape };

const ROW: Shape = [
    ['#', '#', '#', '#']
];

const CROSS: Shape = [
    ['.', '#', '.'],
    ['#', '#', '#'],
    ['.', '#', '.']
]; 

const LSHAPE: Shape = [
    ['.', '.', '#'],
    ['.', '.', '#'],
    ['#', '#', '#']
]; 

const COLUMN: Shape = [
    ['#'],
    ['#'],
    ['#'],
    ['#']
]; 

const CUBE: Shape = [
    ['#', '#'],
    ['#', '#']
]; 

const shapOrder: readonly Shape[] = [ ROW, CROSS, LSHAPE, COLUMN, CUBE ];

const directions = (await readFile('input.txt'))
        .toString()
        .split('') as readonly Direction[];

const chamberWidth = 7;

function runSimulation(rockCount: number) {
    function setShapeMarkers({ shape, left, top }: ActiveShape, setTo: ShapeMarker) {
    
        shape.forEach((row, rowIndex) => row.forEach((marker, columnIndex) => {
            if(marker === '#') {
                chamber[rowIndex + top][columnIndex + left] = setTo;
            }
        }));
    }
    
    function buildChamberLine(fill: ShapeMarker, edges: ShapeMarker): ShapeMarker[] {
        return [ edges, ...Array<ShapeMarker>(chamberWidth).fill(fill), edges ];
    }
    
    function getChamberFillLevel() {
        return chamber.filter(row => row.join('') !== buildChamberLine('.', '|').join('')).length;
    }
    
    const chamber: ShapeMarker[][] = [buildChamberLine('-', '+')];
    
    let nextShapeIndex = 0;
    let nextDirectionIndex = 0;
    
    function spawnNextShape(): ActiveShape {
    
        const shape = shapOrder[nextShapeIndex];
        nextShapeIndex = ++nextShapeIndex % shapOrder.length;
    
        let top = (chamber.length - getChamberFillLevel()) - (3 + shape.length);
        const left = 3;
    
        const linesToAddToChamber = top < 0 ? -top : 0;
    
        // add empty lines to chamber
        chamber.unshift(...Array<null>(linesToAddToChamber).fill(null).map(() => buildChamberLine('.', '|')));
    
        top = Math.max(0, top);

        return { left, top, shape };
    }
    
    let fallingShape = spawnNextShape();
    setShapeMarkers(fallingShape, '@');
    
    let rocksLeft = rockCount;
    while(true) {
    
        const nextDirection = directions[nextDirectionIndex];
        nextDirectionIndex = ++nextDirectionIndex % directions.length;
    
        const getShapeMove = (dx: number, dy: number) => {
            return fallingShape.shape.some((row, rowIndex) => row.some((shapeMarker, columnIndex) =>
                shapeMarker !== '.' && chamber[fallingShape.top + rowIndex + dy][fallingShape.left + columnIndex + dx] !== '.')) ? 0 : 1;
        }
    
        setShapeMarkers(fallingShape, '.');
    
        if(nextDirection === '<') {
            fallingShape.left -= getShapeMove(-1, 0);
        }
        else {
            fallingShape.left += getShapeMove(1, 0);
        }
    
        if(getShapeMove(0, 1) > 0) {
            fallingShape.top++;
        } else {
            setShapeMarkers(fallingShape, '#');
    
            rocksLeft--;
            if(rocksLeft === 0) {
                break;
            }
    
            
            if(rocksLeft % 10000 === 0) {
                console.log(rocksLeft);
            }
    
            fallingShape = spawnNextShape();
        }
    
        setShapeMarkers(fallingShape, '@');
    }

    return getChamberFillLevel() - 1
}


console.log('Part 1:', runSimulation(2022));
//console.log('Part 2:', runSimulation(1000000000000));