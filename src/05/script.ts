import { readFile } from 'fs/promises';
import { EOL } from 'os';

const getStacksAndInstructions = async () => {
    const stacks: string[][] = [];
    const processStackLine = (line: string) => {
        const stencilSize = 3;
        for(let charIndex = 0, stackIndex = 0; charIndex < line.length; charIndex += 4, stackIndex++) {
            const stackItem = line.substring(charIndex, charIndex + stencilSize).trim();
            if(stackItem.length > 0) {
                stacks[stackIndex] = [ stackItem.substring(1, 2), ...(stacks[stackIndex] ?? []) ];
            }
        }
    }
    
    const stacksAndInstructions = (await readFile('input.txt'))
        .toString()
        .split(`${EOL}${EOL}`);
    
    stacksAndInstructions[0]
        .split(EOL)
        .slice(0, -1)
        .forEach(processStackLine);
    
    const instructions = stacksAndInstructions[1]
        .split(EOL)
        .map(line => (/move (\d+) from (\d+) to (\d+)/g.exec(line)?.map(c => c) ?? []).map(str => parseInt(str)))
        .map(([_, moveCount, from, to]) => Array.from(Array(moveCount).keys()).map(() => ({ from, to })));
    
    return { stacks, instructions };
}

const part1 = async () => {
    const { stacks, instructions } = (await getStacksAndInstructions());

    instructions
        .flatMap(partialStack => partialStack)
        .forEach(({ from, to }) => stacks[to - 1].push(stacks[from - 1].pop()!));
    
    return stacks.map(stack => stack[stack.length - 1]).join('');
}
 
const part2 = async () => {
    const { stacks, instructions } = (await getStacksAndInstructions());

    instructions
        .forEach(partialStack => {
            const fromStackIndex = partialStack[0].from - 1;
            const fromStack = stacks[fromStackIndex];
            const toStackIndex = partialStack[0].to - 1;
            const toStack = stacks[toStackIndex];

            stacks[toStackIndex] = [ ...toStack, ...fromStack.slice(-(partialStack.length), fromStack.length) ];
            stacks[fromStackIndex] = fromStack.slice(0, -partialStack.length);
        });
    
    return stacks.map(stack => stack[stack.length - 1]).join('');
}

console.log(await part1());
console.log(await part2());