import { readFile } from 'fs/promises';
import { EOL } from 'os';

type RockOrSand = 'rock' | 'sand';

async function runSimulation(includeFloor: boolean) {
    const rockPaths = (await readFile('input.txt'))
            .toString()
            .split(EOL)
            .map(rockPath => rockPath.split(' -> '))
            .map(pathStepsString => pathStepsString.map(xy => xy.split(',')))
            .map(pathXYString => pathXYString.map<[number, number]>(([x, y]) => [ parseInt(x), parseInt(y) ]));

    const gridStatus = new Map<string, RockOrSand>(rockPaths.flatMap(path => path.slice(0, -1).flatMap(([x0, y0], index) => {
        const [x1, y1] = path[index + 1];
        const minX = Math.min(x0, x1);
        const minY = Math.min(y0, y1);
        return x0 === x1 
            ? [ ...Array(Math.abs(y1 - y0) + 1).keys() ].map<[string, RockOrSand]>(i => [ `${x0}-${minY + i}`, 'rock' as RockOrSand ])
            : [ ...Array(Math.abs(x1 - x0) + 1).keys() ].map<[string, RockOrSand]>(i => [ `${minX + i}-${y0}`, 'rock' as RockOrSand]);
    })));

    const floor = Math.max(...rockPaths.flatMap(path => path.map(segments => segments[1]))) + 2;

    function isCellBlocked(x: number, y: number) {
        const cellStatus = gridStatus.get(`${x}-${y}`);
        return (includeFloor && y === floor) || cellStatus === 'rock' || cellStatus === 'sand';
    }

    let spawnNextSand = true;
    let sandCount = 0;
    while(spawnNextSand) {

        let [sandX, sandY] = [500, 0];
        let sandIsFalling = true;

        while(sandIsFalling) {
            if(sandY > floor) {
                spawnNextSand = false;
                sandIsFalling = false;
            }
            else if(!isCellBlocked(sandX, sandY + 1)) {
                sandY += 1;
            } else if(!isCellBlocked(sandX - 1, sandY + 1)) {
                sandY += 1;
                sandX -= 1;
            } else if(!isCellBlocked(sandX + 1, sandY + 1)) {
                sandY += 1;
                sandX += 1;
            }
            else if(sandX === 500 && sandY === 0) {
                sandIsFalling = false;
                spawnNextSand = false;
                sandCount++;
            }
            else {
                gridStatus.set(`${sandX}-${sandY}`, 'sand');
                sandIsFalling = false;
                sandCount++;
            }
        }
    }

    return sandCount;
};

console.log('Part 1:', await runSimulation(false));
console.log('Part 2:', await runSimulation(true));