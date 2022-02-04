import { possible_words } from './words_list.js';
import readline from 'readline';

const HELPER = `
    X -> letter not in the word
    + -> letter in the word
    0 -> letter in the right place
`

const knew = {wrong: new Set(), used_word: "", in_word: new Set(), word: "-----"}

function replaceAt(str, index, ch) {
    return str.replace(/./g, (c, i) => i == index ? ch : c);
}

function getRandomWord(possible_words){
    var word = possible_words[Math.floor(Math.random()*possible_words.length)]
    console.log(`Try "${word}"`);
    return word
}

var std = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function calculatePossibleAnswers(possible_words, used_word="", response="", knew_letters=knew) {
    function excludeWrongLatter(wrong) {
        var wrong = Array.from(wrong)
        return function(element) {
            return !wrong.some(letter => element.includes(letter));
        }
    }
    function includeContainersLatter(in_word) {
        var in_word = Array.from(in_word)
        return function(element) {
            return in_word.every(letter => element.includes(letter));
        }
    }
    function includeRightLatter(word) {
        var word = Array.from(word)
        return function(element) {
            return word.every((letter, index) => letter === '-' ? true: element[index] === letter)
        }
    }
      
    console.log(`Calculating possible answers...`)
    if (response === ""){
        console.log(`We have ${possible_words.length} possible answers`)
        return possible_words
    }
    for (var i = 0; i < response.length; i++) {
        switch (response[i]) {
            case 'X':
                knew_letters.wrong.add(used_word[i])
                break;
            case '+':
                knew_letters.in_word.add(used_word[i])
                break;
            case '0':
                knew_letters.in_word.add(used_word[i])
                knew_letters.word = replaceAt(knew_letters.word, i, used_word[i])
                break;
        }
    }
    var new_possible_words = possible_words.filter(excludeWrongLatter(knew_letters.wrong))
    new_possible_words = new_possible_words.filter(includeContainersLatter(knew_letters.in_word))
    new_possible_words = new_possible_words.filter(includeRightLatter(knew_letters.word))
    console.log(`We have ${new_possible_words.length} possible answers`)
    return new_possible_words
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

async function main() {
    var new_possible_words = calculatePossibleAnswers(possible_words)
    var word = getRandomWord(new_possible_words)
    var response = await askQuestion("What was the wordle response?\n");
    while (new_possible_words.length > 1){
        new_possible_words = calculatePossibleAnswers(possible_words, word, response, knew)
        word = getRandomWord(new_possible_words)
        response = await askQuestion("What was the wordle response?\n");
    }
    console.log("NICE!")

}
await main()

