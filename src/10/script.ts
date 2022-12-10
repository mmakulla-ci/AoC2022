import { readFile } from 'fs/promises';
import { EOL } from 'os';

interface ProgramState {
    readonly xRegister: number;
    readonly cycleNumber: number;
    readonly signalStrength: number;
    readonly characters: readonly string[][];
}

type Cycle = (state: ProgramState) => ProgramState;

function doCycle(state: ProgramState): ProgramState {

    let { cycleNumber, signalStrength, xRegister, characters } = state

    if((cycleNumber - 20) % 40 === 0) {
        signalStrength += cycleNumber * xRegister;
    }

    const currentCrtRow = characters.at(-1)!;
    const crtRowCharacterIndex = currentCrtRow.length;
    const nextCrtCharacter = crtRowCharacterIndex >= xRegister - 1 && crtRowCharacterIndex <= xRegister + 1 ? '#' : '.';
    currentCrtRow.push(nextCrtCharacter);

    if(cycleNumber % 40 === 0) {
        // start a new row on the crt
        characters = [ ...characters, [] ];
    }

    cycleNumber++;

    return { ...state, cycleNumber, signalStrength, characters };
}

function increaseX(by: number, state: ProgramState): ProgramState {
    const xRegister = state.xRegister + by;
    return { ...state, xRegister };
}

function buildInstruction(input: string): readonly Cycle[] {

    const noopMatch = /noop/.test(input);
    if(noopMatch) {
        return [ doCycle ];
    }

    const addXValueStr = (/addx (?<value>-?\d+)/.exec(input))?.groups!.value;
    if(addXValueStr !== undefined) {
        const addXValue = parseInt(addXValueStr);
        return [ 
            doCycle, 
            doCycle, 
            state => increaseX(addXValue, state) 
        ]
    }
    
    return [];
}

const finalState = (await readFile('input.txt'))
    .toString()
    .split(EOL)
    .flatMap(buildInstruction)
    .reduce<ProgramState>((state, cycle) => cycle(state), { xRegister: 1, cycleNumber: 1, signalStrength: 0, characters: [ [] ] });

console.log('Part 1:', finalState.signalStrength);

console.log();
console.log(finalState.characters.map(c => c.join('')).join(EOL));