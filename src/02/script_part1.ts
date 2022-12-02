import { readFile } from 'fs/promises';

type Hand = keyof typeof handScores;
const handScores = {
    rock: 1,
    paper: 2,
    scissors: 3
}

interface GameHands {
    readonly me: Hand;
    readonly opponent: Hand;
}

const inputToHand: Record<string, Hand> = {
    'X': 'rock',
    'A': 'rock',

    'Y': 'paper',
    'B': 'paper',

    'Z': 'scissors',
    'C': 'scissors'
}

type GameResult = keyof typeof gameScores;
const gameScores = {
    loss: 0,
    tie: 3,
    win: 6
}

const gameConstellations: Record<Hand, Record<Hand, GameResult>> = {
    rock: {
        rock: 'tie',
        scissors: 'win',
        paper: 'loss',
    },
    paper: {
        paper: 'tie',
        rock: 'win',
        scissors: 'loss'
    },
    scissors: {
        scissors: 'tie',
        paper: 'win',
        rock: 'loss'
    }
}


const result = (await readFile('input.txt'))
    .toString()
    .split('\r\n')
    .map<GameHands>(input => ({ opponent: inputToHand[input.charAt(0)], me: inputToHand[input.charAt(2)] }))
    .map(({ me, opponent }) => handScores[me] + gameScores[gameConstellations[me][opponent]])
    .reduce((sum, next) => sum + next, 0);

console.log(result);