import { readFile } from 'fs/promises';
import { EOL } from 'os';

class NumberMonkey {
    constructor(public readonly name: string, public readonly value: number) {}

    public getResult(): number {
        return this.value;
    }
}

class OperatorMonkey {
    constructor(public readonly name: string, public readonly operation: string) {}

    public getResult(): number {
        const [leftMonkeyName, rightMonkeyName] = this.operation
            .split(/[+|\-|*|/]/g)
            .map(s => s.trim())

        const [leftMonkeyValue, rightMonkeyValue] = [leftMonkeyName, rightMonkeyName]
            .map(name => allMonkeys.get(name)!.getResult());

        return Function(leftMonkeyName, rightMonkeyName, `return ${this.operation}`).call(this, leftMonkeyValue, rightMonkeyValue);
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

console.log('Part 1:', rootMonkey.getResult());