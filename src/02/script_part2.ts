import { readFile } from 'fs/promises';

type Hand = keyof typeof handScores;
const handScores = {
    rock: 1,
    paper: 2,
    scissors: 3
}

interface GameInput {
    readonly opponent: Hand;
    readonly outcome: GameResult;
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

const inputToGameResult: Record<string, GameResult> = {
    'X': 'loss',
    'Y': 'tie',
    'Z': 'win'
}

const gameConstellations: Record<Hand, Record<GameResult, Hand>> = {
    rock: {
        loss: 'scissors',
        tie: 'rock',
        win: 'paper'
    },
    paper: {
        loss: 'rock',
        tie: 'paper',
        win: 'scissors'
    },
    scissors: {
        loss: 'paper',
        tie: 'scissors',
        win: 'rock'
    }
}


const result = (await readFile('input.txt'))
    .toString()
    .split('\r\n')
    .map<GameInput>(input => ({ opponent: inputToHand[input.charAt(0)], outcome: inputToGameResult[input.charAt(2)] }))
    .map(({ outcome, opponent }) => gameScores[outcome] + handScores[gameConstellations[opponent][outcome]])
    .reduce((sum, next) => sum + next, 0);

console.log(result);