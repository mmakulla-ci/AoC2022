import { readFile } from 'fs/promises';
import { EOL } from 'os';

class NumberMonkey {
    constructor(public readonly name: string, public readonly value: number) {}

    public getExpression(): string {
        return `(${this.value})`;
    }
}

class OperatorMonkey {
    constructor(public readonly name: string, public readonly operation: string) {}

    public getExpression(): string {
        const [leftMonkeyName, rightMonkeyName] = this.operation
            .split(/[+|\-|*|/]/g)
            .map(s => s.trim());

        const expression = this.operation
            .replace(leftMonkeyName, allMonkeys.get(leftMonkeyName)!.getExpression())
            .replace(rightMonkeyName, allMonkeys.get(rightMonkeyName)!.getExpression());

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

const part1 = Function(`return ${rootMonkey.getExpression()}`).call(null);

console.log('Part 1:', part1);