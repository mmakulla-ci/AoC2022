import { readFile } from 'fs/promises';
import { EOL } from 'os';

type Operator = '+' | '-' | '*' | '/';

class NumberMonkey {
    constructor(public readonly name: string, public value: number) {}

    public evaluate(): number {
        return this.value;
    }

    public containsHuman(): boolean {
        return this.name === 'humn';
    }

    public solveForHuman(): null {
        return null;
    }

    public solveForHumanFromHere(): number {
        return 0;
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

    private get subMonkeys(): [Monkey, Monkey] {
        return [allMonkeys.get(this.leftMonkeyName)!, allMonkeys.get(this.rightMonkeyName)!];
    }

    private get orderedMonkeys(): { readonly constantMonkey: Monkey, readonly monkeyWithHuman: Monkey } {
        const [leftMonkey, rightMonkey] = [allMonkeys.get(this.leftMonkeyName)!, allMonkeys.get(this.rightMonkeyName)!];
        return {
            constantMonkey: leftMonkey.containsHuman() ? rightMonkey : leftMonkey,
            monkeyWithHuman: leftMonkey.containsHuman() ? leftMonkey : rightMonkey
        }
    }

    public containsHuman(): boolean {
        return this.subMonkeys.some(m => m.containsHuman());
    }

    public solveForHuman(expressionResult: number): number {
        const [ firstMonkey ] = this.subMonkeys;
        const { constantMonkey, monkeyWithHuman } = this.orderedMonkeys;

        const constant = constantMonkey.evaluate();
        const coeff = firstMonkey.containsHuman() ? -1 : 1;
        const operator = this.operation.split(' ')[1] as Operator;

        switch(operator) {
            case '+': expressionResult -= constant; break;
            case '-': expressionResult = -coeff * expressionResult + constant; break;
            case '*': expressionResult /= constant; break;
            case '/': expressionResult /= constant ** coeff; break;
        }

        return monkeyWithHuman.solveForHuman(expressionResult) ?? expressionResult;
    }

    public solveForHumanFromHere(): number {
        const { constantMonkey, monkeyWithHuman } = this.orderedMonkeys;
        const constantSide = constantMonkey.evaluate();
        return monkeyWithHuman.solveForHuman(constantSide) ?? constantSide;
    }

    public evaluate(): number {
        const [leftMonkey, rightMonkey] = this.subMonkeys;

        const expression = this.operation
            .replace(this.leftMonkeyName, leftMonkey.evaluate().toString())
            .replace(this.rightMonkeyName, rightMonkey.evaluate().toString());

        return Function(`return ${expression}`).call(null);
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
console.log('Part 1:', rootMonkey.evaluate());
console.log('Part 2:', rootMonkey.solveForHumanFromHere());