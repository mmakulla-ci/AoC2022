import { readFile, writeFile } from 'fs/promises';
import { EOL } from 'os';
import { writeCubes } from '../util/wavefront/write3d.js';


type Point3D = [number, number, number];

const cubes = new Map<string, Point3D>((await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(asString => [asString, asString.split(',').map(str => parseInt(str)) as Point3D]));

const hashPoint = ([x, y, z]: Point3D) => `${x},${y},${z}`;
const getExtent = (fn: (...input: number[]) => number) => [0, 1, 2].map(dimension => fn(...[...cubes.values()].map(cube => cube[dimension])));
const [minX, minY, minZ] = getExtent(Math.min);
const [maxX, maxY, maxZ] = getExtent(Math.max);

const pockets = new Map<string, Point3D>();

function isPocketDimension(start: number, end: number, checkCube: (idx: number) => boolean) {
    for(let idx = start; idx <= end; idx++) {
        if(checkCube(idx)) {
            return true;
        }
    }

    return false;
}

for(let x = minX; x <= maxX; x++) {
    for(let y = minY; y <= maxY; y++) {
        for(let z = minZ; z <= maxZ; z++) {
            const isCube = isCubeAt([x, y, z]);

            if(!isCube) {
                const isPocket = [
                    isPocketDimension(minX, x, cx => isCubeAt([cx,  y,  z])),
                    isPocketDimension(x, maxX, cx => isCubeAt([cx,  y,  z])),
                    isPocketDimension(minY, y, cy => isCubeAt([ x, cy,  z])),
                    isPocketDimension(y, maxY, cy => isCubeAt([ x, cy,  z])),
                    isPocketDimension(minZ, z, cz => isCubeAt([ x,  y, cz])),
                    isPocketDimension(z, maxZ, cz => isCubeAt([ x,  y, cz]))
                ].every(isPocket => isPocket);

                if(isPocket) {
                    pockets.set(hashPoint([x, y, z]), [x, y, z]);
                }
            }
        }
    }
}

function isCubeAt(p: Point3D) {
    return cubes.has(hashPoint(p));
}

function hasNeighborAt([dx, dy, dz]: Point3D, [x, y, z]: Point3D) {
    return cubes.has(hashPoint([x + dx, y + dy, z + dz]));
}

function surface(input: Map<string, Point3D>, invert = false) {
    return [...input.values()].map(
            cube => Array<Point3D>(
                [-1,  0,  0],
                [ 1,  0,  0],
                [ 0, -1,  0],
                [ 0,  1,  0],
                [ 0,  0, -1],
                [ 0,  0,  1]
            )
            .filter(delta => invert ? hasNeighborAt(delta, cube) : !hasNeighborAt(delta, cube))
            .length
        ).reduce((sum, value) => sum + value, 0);
}

await writeCubes('out/cubes.obj', cubes.values());
await writeCubes('out/pockets.obj', pockets.values());

console.log('Part 1:', surface(cubes));
console.log('Part 2:', surface(cubes) - surface(pockets, true));