import { readFile } from 'fs/promises';
import { EOL } from 'os';

interface Item {
    worryLevel: number;
}

class Monkey {
    private readonly operation: Function;
    private readonly trueMonkeyIndex;
    private readonly falseMonkeyIndex;
    
    private readonly _divisor: number;
    get divisor() { return this._divisor };

    private _totalInspections = 0;
    get totalInspections() { return this._totalInspections };

    private items: Item[] = [];

    constructor(input: string, private readonly worryLevelDivisor: number) {
        const [
            _,
            itemString, 
            operationString, 
            testString, 
            trueString, 
            falseString
        ] = input.split(EOL);

        this.items = [ ...itemString.matchAll(/(?<item>\d+)/g) ]
            .map(match => match.groups!.item)
            .map(item => parseInt(item))
            .map(worryLevel => ({ worryLevel }));

        this.operation = new Function('old', `return ${operationString.split('=')[1]}`);

        this._divisor = parseInt(testString.split(' ').at(-1)!);
        this.trueMonkeyIndex = parseInt(trueString.split(' ').at(-1)!);
        this.falseMonkeyIndex = parseInt(falseString.split(' ').at(-1)!);
    }

    catchItem(item: Item): void {
        this.items.push(item);
    }

    private inspectAndThrow(item: Item, allMonkeys: readonly Monkey[], globalDivisor: number): void {
        item.worryLevel = this.operation(item.worryLevel);
        item.worryLevel = Math.floor(item.worryLevel / this.worryLevelDivisor);
        const targetMonkey = item.worryLevel % this._divisor === 0 ? this.trueMonkeyIndex : this.falseMonkeyIndex;

        item.worryLevel = item.worryLevel % globalDivisor;

        allMonkeys[targetMonkey].catchItem(item);

        this._totalInspections++;
    }

    takeTurn(allMonkeys: readonly Monkey[], globalDivisor: number): void {
        this.items.forEach(item => this.inspectAndThrow(item, allMonkeys, globalDivisor));
        this.items = [];
    }
}

async function monkeyBusiness(rounds: number, worryLevelDivisor: number) {
    const monkeys = (await readFile('input.txt'))
        .toString()
        .split([EOL, EOL].join(''))
        .map(monkeyString => new Monkey(monkeyString, worryLevelDivisor));

    const globalDivisor = monkeys.reduce((prod, current) => prod * current.divisor, 1);

    Array.from(Array(rounds).keys()).forEach(() => monkeys.forEach(monkey => monkey.takeTurn(monkeys, globalDivisor)));

    const [ busy1, busy2 ] = monkeys.slice().sort((m1, m2) => m2.totalInspections - m1.totalInspections);
    return busy1.totalInspections * busy2.totalInspections;
}

console.log("Part 1:", await monkeyBusiness(20, 3));
console.log("Part 2:", await monkeyBusiness(10000, 1));