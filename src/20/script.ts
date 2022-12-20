import { readFile } from 'fs/promises';
import { EOL } from 'os';

class Node {
    constructor(public readonly value: number, public previous: Node, public next: Node) {}

    removeFromChain() {
        this.previous.next = this.next;
        this.next.previous = this.previous;

        this.previous = this;
        this.next = this;
    }

    insertBetween(first: Node, second: Node) {
        first.next = this;
        this.previous = first;

        second.previous = this;
        this.next = second;
    }

    sumValues(...steps: number[]): number {
        let sum = 0;
        let node: Node = this;

        for(let step = 0; step <= Math.max(...steps); step++) {
            if(steps.indexOf(step) >= 0) {
                sum += node.value;
            }
            node = node.next;
        }

        return sum;
    }
}

async function run(iterations = 1, factor = 1) {
    const cyclicList = (await readFile('input.txt'))
        .toString()
        .split(EOL)
        .map(str => parseInt(str))
        .map<Node>(value => new Node(value * factor, null!, null!));

    cyclicList.forEach((node, index) => node.previous = cyclicList.at(index - 1)!);
    cyclicList.forEach((node, index) => node.next = cyclicList.at((index + 1) % cyclicList.length)!);

    while(iterations-- > 0) {
        cyclicList.forEach(node => {
            let { value } = node;
        
            // skip full circles
            value %= cyclicList.length - 1;
        
            while(value !== 0) {
                const { previous, next } = node;

                node.removeFromChain();
        
                if(value < 0) {
                    node.insertBetween(previous.previous, previous);
                    value++;
                } else {
                    node.insertBetween(next, next.next);
                    value--;
                }
            }
        });
    }

    const nodeZero = cyclicList.filter(node => node.value === 0)[0];
    return nodeZero.sumValues(1000, 2000, 3000);
}

console.log('Part 1', await run());
console.log('Part 2', await run(10, 811589153));