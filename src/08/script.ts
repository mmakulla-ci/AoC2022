import { readFile } from 'fs/promises';
import { EOL } from 'os';

interface Tree {
    readonly height: number;
    alreadyCounted: boolean;
    score: number;
}

const treeRows = (await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(row => row.split('').map<Tree>(cell => ({ height: parseInt(cell), alreadyCounted: false, score: 0 })));

const treeColumns = treeRows[0]
    .map((_, columnIndex) => treeRows.map(row => row[columnIndex]));

const rowCount = treeRows.length;
const columnCount = treeRows[0].length;

// --- Part 1 ---

const countVisibleTreesPart1 = (trees: readonly Tree[]) => {
    let maxHeight = -1;
    let count = 0;

    trees.forEach(tree => {
        if(tree.height > maxHeight) {
            maxHeight = tree.height;

            if(!tree.alreadyCounted) {
                tree.alreadyCounted = true;
                count++;
            }
        }
    });

    return count;
};

const part1 = [ 
    treeRows.map(countVisibleTreesPart1),
    treeRows.map(row => countVisibleTreesPart1(row.slice().reverse())),
    treeColumns.map(countVisibleTreesPart1),
    treeColumns.map(column => countVisibleTreesPart1(column.slice().reverse()))
].flatMap(arr => arr).reduce((sum, count) => sum + count, 0);

console.log('Part 1:', part1);


// --- Part 2 ---

const countVisibleTreesPart2 = (referenceTree: Tree, trees: readonly Tree[]) => { 
    let index = 0
    for(; index < trees.length && trees[index].height < referenceTree.height; index++) {}
    return Math.min(index + 1, trees.length);
};

let maxScoreTree: Tree = treeRows[0][0];

treeRows.forEach((treeRow, rowIndex) => treeRow.forEach((tree, columnIndex) => {
    const up = countVisibleTreesPart2(tree, treeColumns[columnIndex].slice(0, rowIndex).reverse());
    const down = countVisibleTreesPart2(tree, treeColumns[columnIndex].slice(rowIndex + 1, rowCount));
    const left = countVisibleTreesPart2(tree, treeRows[rowIndex].slice(0, columnIndex).reverse());
    const right = countVisibleTreesPart2(tree, treeRows[rowIndex].slice(columnIndex + 1, columnCount));

    tree.score = up * down * left * right;
    if(tree.score > maxScoreTree.score) {
        maxScoreTree = tree;
    }
}));

console.log('Part 2:', maxScoreTree.score);