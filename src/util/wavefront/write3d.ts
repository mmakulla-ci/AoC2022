import { readFile, writeFile } from 'fs/promises';
import handlebars from 'handlebars';

type Cube = [number, number, number];

export async function writeCubes(fileName: string, cubes: IterableIterator<Cube>) {
    const template = handlebars.compile((await readFile('cube.handlebars')).toString());
    let objStr = '';
    [...cubes].forEach(([x, y, z], idx) => {
        objStr += template({
            name: `Cube${idx}`,
            x0: x - 0.5,
            x1: x + 0.5,
            y0: y - 0.5,
            y1: y + 0.5,
            z0: z - 0.5,
            z1: z + 0.5
        })
    })
    await writeFile(fileName, objStr);
}