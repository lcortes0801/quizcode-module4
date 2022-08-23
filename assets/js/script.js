//game settings
var optionsSize = 4;
var nextQuestionTimeout = 2000;
var score = 0;
var gameTime = 160;
var penalty = 5;
var actualTime;
var refreshRate = 1;
var maxSavedScores = 12;
var questions;

//elements
var mainArea;
var menuDiv;
var startBtn;
var hsBtn;
var triviaDiv;
var questionP;
var timer;
var liArray = Array(optionsSize);
var timeHandlerId;
var gameOverView;
var highScoresView;
var scoreP;
var highScoresTable;


function createMenu(){
    menuDiv = document.createElement('div');
    menuDiv.className = 'main-menu';

    startBtn = document.createElement('button');
    startBtn.textContent = "Start Quiz!";
    startBtn.className = 'start-btn'
    startBtn.onclick = playGame;
    
    hsBtn = document.createElement('button');
    hsBtn.textContent = "High Scores";
    hsBtn.className = 'highscore-btn';
    hsBtn.onclick = showHighScores;
    
    menuDiv.append(startBtn);
    menuDiv.append(hsBtn);
}

function createTrivia(size){
    triviaDiv = document.createElement('div');
    h1 = document.createElement('h1');
    h1.className = 'trivia-header';
    h1.textContent = 'Question';

    timer = document.createElement('p');
    timer.className = 'timer';
    timer.textContent = actualTime;

    questionP = document.createElement('p');
    questionP.className = 'question';

    var answers = document.createElement('div');
    answers.className ='answers';

    var ol = document.createElement('ol');
    for(let i = 0; i < size; ++i){
        liArray[i] = document.createElement('li');
        liArray[i].textContent = i;
        ol.append(liArray[i]);
    }
    answers.append(ol);
    triviaDiv.append(h1);
    triviaDiv.append(timer);
    triviaDiv.append(questionP);
    triviaDiv.append(answers);
}

function createGameOverView(){
    gameOverView = document.createElement('div');
    gameOverView.className = 'game-over';
    
    let h1 = document.createElement('h1');
    h1.textContent = 'Game Over!';

    let h2 = document.createElement('h2');
    h2.textContent = 'Enter your name to save your score';

    let form = document.createElement('form');
    
    let nameDiv = document.createElement('div');
    nameDiv.className = 'name';

    let name = document.createElement('input');
    name.setAttribute('type', 'text');
    name.setAttribute('placeholder', 'Your name here');
    name.id = 'name-input';

    scoreP = document.createElement('p');

    let submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Save');

    form.onsubmit = saveScore;

    nameDiv.append(name);
    nameDiv.append(scoreP);

    form.append(nameDiv);
    form.append(submit);

    gameOverView.append(h1);
    gameOverView.append(h2);
    gameOverView.append(form);
}

function createHighScoresView(){
    highScoresView = document.createElement('div');
    highScoresView.className = 'high-scores';

    let h1 = document.createElement('h1');
    h1.textContent = 'High Scores';

    highScoresTable = document.createElement('table');
    highScoresTable.id = 'hstable';

    let th = document.createElement('tr');
    let tdUser = document.createElement('th');
    tdUser.textContent = 'User';
    let tdScore = document.createElement('th');
    tdScore.textContent = 'Score';
    th.append(tdUser)
    th.append(tdScore)
    highScoresTable.append(th);


    let menuBtn = document.createElement('button');
    menuBtn.textContent = 'Main Menu';
    menuBtn.onclick = mainMenu;

    highScoresView.append(h1);
    highScoresView.append(highScoresTable);
    highScoresView.append(menuBtn);
}

function mainMenu(){
    displayView(menuDiv);
}

function saveScore(event){
    event.preventDefault();
    var nameElement = document.querySelector('#name-input');
    const name = nameElement.value;
    let hs = window.localStorage.getItem('highScores');
    hsPair = {'name':name, 'hs':score}
    if(hs == null || hs == undefined)
        hs = [hsPair];
    else{
        hs = JSON.parse(hs);
        let found = false;
        for (let i = 0; i < hs.length && !found; ++i)
            if (hs[i]['name'] == name){
                found = true;
                if (hs[i]['hs'] < score)
                    hs[i]['hs'] = score;
            }
        if (!found)
            hs.push(hsPair);
        console.log(hs);
        hs.sort((a,b) => {return b['hs'] - a['hs'];});
        console.log(hs);
        if (hs.length > maxSavedScores)
            hs.splice(12);
    }
    window.localStorage.setItem('highScores', JSON.stringify(hs));
    nameElement.value = '';
    showHighScores();
}

function initComponents(){

    createMenu();
    createTrivia(optionsSize);
    createGameOverView();
    createHighScoresView();

    mainArea = document.querySelector("main");

    mainMenu();
}

function displayView(view){
    while (mainArea.firstChild) {
        mainArea.removeChild(mainArea.firstChild);
    }
    mainArea.append(view);
}

function timerHandler(){
    if(--actualTime == 0){
        window.clearInterval(timeHandlerId);
        gameOver();
    }
    else{
        timer.textContent = actualTime;
        let w = Math.floor(100*actualTime/gameTime);
        timer.setAttribute('style', `width:${w}%`)
    }
}

function playGame(){
    actualTime = gameTime;
    timer.textContent = actualTime;
    score = 0;
    questions = questionsDB;
    displayView(triviaDiv);
    timeHandlerId = window.setInterval(timerHandler, 1000*refreshRate);
    showQuestion();
}

function showQuestion(){
    if (questions.length == 0){
        gameOver();
        return;
    }
    let nextQuestion = getAndRemoveRandomItem(questions);
    questionP.textContent = nextQuestion['question'];
    let s = getRandomInt(optionsSize);
    liArray[s].textContent = nextQuestion['answer'];
    liArray[s].className = 'unanswered';
    liArray[s].onclick = rightAnswer;
    let wrong = nextQuestion['wrong_answers'].slice();
    for(let i = 1; i < optionsSize; ++i){
        liArray[(s+i)%optionsSize].textContent = getAndRemoveRandomItem(wrong);
        liArray[(s+i)%optionsSize].className = 'unanswered';
        liArray[(s+i)%optionsSize].onclick = wrongAnswer;
    }
}

function removeOnClick(array){
    for(item of array)
        item.onclick = null;
}

function rightAnswer(event){
    removeOnClick(liArray);
    event.target.classList.remove('unanswered');
    event.target.classList.add('right-answer');
    score++;
    window.setTimeout(showQuestion, nextQuestionTimeout);
}

function wrongAnswer(event){
    removeOnClick(liArray);
    event.target.classList.remove('unanswered');
    event.target.classList.add('wrong-answer');
    actualTime -= penalty;
    window.setTimeout(showQuestion, nextQuestionTimeout);
}

function showHighScores(){
    //clear table
    while (highScoresTable.childNodes.length > 1) {
        highScoresTable.removeChild(highScoresTable.lastChild);
    }
    let hs = window.localStorage.getItem('highScores');
    if (hs != null || hs != undefined){
        hs = JSON.parse(hs);
        for (item of hs){
            let tr = document.createElement('tr');
            let tdLeft = document.createElement('td');
            tdLeft.textContent = item['name'];
            tr.append(tdLeft);
            let tdRight = document.createElement('td');
            tdRight.textContent = item['hs'];
            tr.append(tdRight);
            highScoresTable.append(tr);
        }
    }
    displayView(highScoresView);
}

function gameOver(){
    scoreP.textContent = `Score: ${score}`
    displayView(gameOverView);
}

window.onload = initComponents;


/*Helpers*/
function getRandomItem(array){
    return array[getRandomInt(array.length)];
}

function getAndRemoveRandomItem(array){
    let idx = getRandomInt(array.length);
    let item = array[idx];
    array.splice(idx,1);
    return item;
}

function getRandomInt(max){
    return Math.floor(Math.random()*max);
}

/*Data*/
var questionsDB = [
    {
        'question': 'What does HTML stand for?',
        'answer': 'Hyper Text Markup Language',
        'wrong_answers':[
            'Hyper Trainer Marking Language',
            'Hyper Text Markup Leveler',
            'Hyper Text Marketing Language']
    },
    {
        'question': 'What tag will be used to create a hyperlink? ',
        'answer': 'a',
        'wrong_answers':[
            'img ',
            'div',
            'link']
    },
    {
        'question': 'Which among the heading levels got the biggest size?',
        'answer': 'h1',
        'wrong_answers':[
            'h2',
            'h3',
            'h4',
            'h5',
            'h6']
    },
    {
        'question': 'Inside which HTML element do we put the JavaScript?',
        'answer': '<script>',
        'wrong_answers':[
            '<js>',
            '<javascript>',
            '<scripting>',
            '<code>']
    },
    {
        'question': 'Where is the correct place to insert a JavaScript?',
        'answer': 'Both <head> and <body>',
        'wrong_answers':[
            'The <head> section',
            'The <body> section',
            'Neither <head> or <body>']
    },
    {
        'question': 'What is the correct syntax for referring to an external script called "code.js"?',
        'answer': '<script src="code.js">',
        'wrong_answers':[
            '<script name="code.js">',
            '<script href="code.js">',
            '<script link="code.js">',
            '<script code="code.js">']
    },
    {
        'question': 'How can you add a comment in a JavaScript?',
        'answer': '//This is a coment',
        'wrong_answers':[
            '#This is a coment',
            '```This is a coment',
            '<!--This is a coment-->',
            '--This is a coment']
    },
    {
        'question': 'What is the correct way to write a JavaScript array?',
        'answer': 'var colors = ["red", "green", "blue"]',
        'wrong_answers':[
            'var colors = ("red", "green", "blue")',
            'var colors = {"red", "green", "blue"}',
            'var colors = "red", "green", "blue"',
            'var colors = 1="red", 2="green", 3="blue"]']
    },
    {
        'question': 'Which operator is used to assign a value to a variable?',
        'answer': '=',
        'wrong_answers':[
            '*',
            '+',
            '-',
            '/',
            'x']
    },
    {
        'question': 'What is the correct HTML element for inserting a line break?',
        'answer': '<br>',
        'wrong_answers':[
            '<lb>',
            '<break>',
            '<line>']
    },
    {
        'question': 'How can you open a link in a new tab/browser window?',
        'answer': '<a href="url" target="_blank">',
        'wrong_answers':[
            '<a href="url" target="new">',
            '<a href="url">',
            '<a href="url" new>',
            '<a href="url" _blank>',
            '<a href="url" window="_blank">',
            '<a href="url" window="new">']
    },
    {
        'question': 'Which is the correct CSS syntax?',
        'answer': 'body{color:black}',
        'wrong_answers':[
            '{body;color:black}',
            '{body:color=black}',
            'body:color=black']
    },
    {
        'question': 'How do you select an element with id "demo" in CSS?',
        'answer': '#demo',
        'wrong_answers':[
            '.demo',
            'demo',
            '*demo']
    },
    {
        'question': 'How do you select an element with class name "demo" in CSS?',
        'answer': '.demo',
        'wrong_answers':[
            '#demo',
            'demo',
            '*demo']
    },
    {
        'question': 'What is the default value of the position property?',
        'answer': 'static',
        'wrong_answers':[
            'relative',
            'fixed',
            'absolute']
    },
    {
        'question': 'Which sign does jQuery use as a shortcut for jQuery?',
        'answer': '$',
        'wrong_answers':[
            '#',
            '@',
            '!',
            '%',
            '^',
            '&',
            '*']
    }
];
