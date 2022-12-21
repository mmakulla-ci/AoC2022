import { readFile } from 'fs/promises';
import { EOL } from 'os';

import 'nerdamer/Algebra.js';
import 'nerdamer/Solve.js';
import nerdamer from 'nerdamer';

class NumberMonkey {
    constructor(public readonly name: string, public value: number) {}

    public getExpression(mode: 'solve' | 'withHuman'): string {
        return mode === 'withHuman' && this.name === 'humn' ? `humn` : this.value.toString();
    }
}

class OperatorMonkey {
    private readonly leftMonkeyName: string;
    private readonly rightMonkeyName: string;

    constructor(public readonly name: string, public readonly operation: string) {
        const [leftMonkeyName, rightMonkeyName] = this.operation
            .split(/[+|\-|*|/]/g)
            .map(s => s.trim());

        this.leftMonkeyName = leftMonkeyName;
        this.rightMonkeyName = rightMonkeyName;
    }

    public getExpression(mode: 'solve' | 'withHuman'): string {

        const leftMonkey = allMonkeys.get(this.leftMonkeyName)!;
        const rightMonkey = allMonkeys.get(this.rightMonkeyName)!;

        if(mode === 'withHuman' && this.name === 'root') {
            return `${leftMonkey.getExpression(mode)} = ${rightMonkey.getExpression(mode)}`;
        }

        const expression = this.operation
            .replace(this.leftMonkeyName, leftMonkey.getExpression(mode))
            .replace(this.rightMonkeyName, rightMonkey.getExpression(mode));

        return `(${expression})`;
    }
}

type Monkey = NumberMonkey | OperatorMonkey;

const allMonkeys = new Map((await readFile('input.txt'))
    .toString()
    .split(EOL)
    .map(line => line.split(': '))
    .map<[string, string, number]>(([name, task]) => [name, task, parseInt(task)])
    .map<Monkey>(([name, task, maybeNumber]) => isNaN(maybeNumber) ? new OperatorMonkey(name, task) : new NumberMonkey(name, maybeNumber))
    .map(monkey => [monkey.name, monkey]));

const rootMonkey = allMonkeys.get('root')!;
console.log('Part 1:', Function(`return ${rootMonkey.getExpression('solve')}`).call(null));

const expression = nerdamer(rootMonkey.getExpression('withHuman'));
console.log('Part 2:', parseInt(expression.solveFor('humn').toString()));