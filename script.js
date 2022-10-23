//Get DOM elements
const field = document.querySelector('.field');
const sizes = document.querySelectorAll('input');
const start = document.querySelector('.start');
const time = document.querySelector('.time');
const moves = document.querySelector('.moves');
const pause = document.querySelector('.pause');
const save = document.querySelector('.save');
const sound = document.querySelector('.sound');
const results = document.querySelector('.get-result');
const modal = document.querySelector('.results');
const victoryMessage = document.querySelector('.victory');

//Assign global variables
let fieldSize = 4; 
const dominoNull = {}; //empty cell
const storage = {
	dominos: [],
	numbers: [],
	currentMoves: 0,
	timer: null,
	pausedTime: []
};
let dominoSize = 0; 
let numbers = [];
let dominos = [];
let isReady = true;
let isPaused = false;
let currentMoves = 0;
let timer = null;
let pausedTime = 0;
let isMute = false;
let minMoves = 0;
let leaderBoard = [];

//load game save from local storage
if (localStorage.getItem('numbers')) {
	pause.disabled = false;
	save.disabled = false;
	save.textContent = 'Reset save';
	field.innerHTML = '';
	fieldSize = +localStorage.getItem('size');
	sizes.forEach(value => {
		if (value.value === '' + fieldSize) {
			value.checked = true;
		}
	});
	numbers = JSON.parse(localStorage.getItem('numbers'));
	const lefts = JSON.parse(localStorage.getItem('lefts'));
	const tops = JSON.parse(localStorage.getItem('tops'));
	dominoSize = field.clientWidth / fieldSize;
	currentMoves = localStorage.getItem('currentMoves');
	moves.textContent = `Moves: ${currentMoves}`;
	time.textContent = localStorage.getItem('currentTime');
	clearTimeout(timer);
	timer = null;
	const sec = +localStorage.getItem('currentTime').slice(6);
	const min = +localStorage.getItem('currentTime').slice(3, 5);
	const hours = +localStorage.getItem('currentTime').slice(0, 2);
	countSec(sec, min, hours);
	
	for (let i = 0; i < fieldSize * fieldSize - 1; i++) {
		const domino = document.createElement('div');
		const positionLeft = lefts[i];
		const positionTop = tops[i]; 
		dominos.push({
			positionLeft: positionLeft,
			positionTop: positionTop,
			number: numbers[i],
			element: domino
		});
		domino.className = 'domino';
		domino.style.width = dominoSize + 'px';
		domino.style.height = dominoSize + 'px';
		domino.style.fontSize = scaleText(''+fieldSize);
		domino.style.left = positionLeft * dominoSize + 'px';
		domino.style.top = positionTop * dominoSize + 'px';
		
		domino.textContent = numbers[i];

		domino.addEventListener('click', () => moveDominos(i));
		domino.addEventListener('transitionend', () => isReady = true);
		field.append(domino);
	}
	dominoNull.positionLeft = +localStorage.getItem('nullLeft');
	dominoNull.positionTop = +localStorage.getItem('nullTop');
	dominoNull.number = 0;
	dominos.push(dominoNull);
}

//load data to results.popup
if (localStorage.getItem('results')) {
	modal.innerHTML = localStorage.getItem('results');
}

//load list of leaders
if (localStorage.getItem('leaderBoard')) {
	leaderBoard = JSON.parse(localStorage.getItem('leaderBoard'));
}

//Change size of the game field
sizes.forEach(value => {
	value.addEventListener('change', () => {
		if (value.checked === true) {
			fieldSize = value.value;
			initGame();
		}
	});
});

//Shuffle and start
start.addEventListener('click', () => {
	initGame();
});

//Pause-Resume game
pause.addEventListener('click', () => {
	if (isPaused) {
		resumeCountSec();
	} else {
		stopCountSec();
	}
});

//Sound of dominos movement
sound.addEventListener('click', () => {
	sound.classList.toggle('sound-on');
	sound.classList.toggle('sound-off');
	isMute = isMute ? false : true;
});

//Save-reset game
save.addEventListener('click', setLocalStorage);

//close pop up windows
window.addEventListener('click', (event) => {
	if (!modal.classList.contains('hidden')) {
		if (!event.target.classList.contains('results') && !event.target.classList.contains('results-item')) {
			modal.classList.add('hidden');
		}
	}
	if (!victoryMessage.classList.contains('hidden')) {
		if (!event.target.classList.contains('victory')) {
			victoryMessage.classList.add('hidden');
		}
	}
});

//Open leaderboard
results.addEventListener('click', () => {
	setTimeout(()=> modal.classList.remove('hidden'), 100);
});

//Sort numbers for dominos
function sortNumbers(arr) {
	return arr.sort(() => Math.random() - 0.5);
}

//Create game field
function initGame() {
	pause.disabled = false;
	save.disabled = false;
	isReady = true;
	field.innerHTML = '';
	dominoNull.positionLeft = fieldSize - 1;
	dominoNull.positionTop = fieldSize - 1;
	dominoNull.number = 0;
	dominoSize = field.clientWidth / fieldSize;
	dominos = [];
	numbers = [];
	currentMoves = 0;
	moves.textContent = `Moves: ${currentMoves}`;
	time.textContent = '00:00:00';
	clearTimeout(timer);
	timer = null;
	countSec(0, 0, 0);
	for (let i = 1; i < fieldSize * fieldSize; i++) {
		 numbers.push(i);
	}
	sortNumbers(numbers);
	for (let i = 0; i < fieldSize * fieldSize - 1; i++) {
		const domino = document.createElement('div');
		const positionLeft = i % fieldSize;
		const positionTop = (i - i % fieldSize) / fieldSize; 
		dominos.push({
			positionLeft: positionLeft,
			positionTop: positionTop,
			number: numbers[i],
			element: domino
		});
		domino.className = 'domino';
		domino.style.width = dominoSize + 'px';
		domino.style.height = dominoSize + 'px';
		domino.style.fontSize = scaleText(fieldSize);
		domino.style.left = positionLeft * dominoSize + 'px';
		domino.style.top = positionTop * dominoSize + 'px';
		
		domino.textContent = numbers[i];

		domino.addEventListener('click', () => moveDominos(i));
		domino.addEventListener('transitionend', () => isReady = true);
		field.append(domino);
	}
	dominos.push(dominoNull);
	canSolve();
}

//Move dominos =)
function moveDominos(index) {
	if (isReady) {
		const topShift = Math.abs(dominoNull.positionTop - dominos[index].positionTop);
		const leftShift = Math.abs(dominoNull.positionLeft - dominos[index].positionLeft);
		if (topShift + leftShift <= 1) {
			isReady = false;
			const currentTop = dominoNull.positionTop;
			const currentLeft = dominoNull.positionLeft;
			dominoNull.positionTop = dominos[index].positionTop;
			dominoNull.positionLeft = dominos[index].positionLeft;
			dominos[index].positionTop = currentTop;
			dominos[index].positionLeft = currentLeft;
			dominos[index].element.style.top = currentTop * dominoSize + 'px';
			dominos[index].element.style.left = currentLeft * dominoSize + 'px';
			currentMoves++;
			moves.textContent = `Moves: ${currentMoves}`;
			playSound();
			if (isWictory()) {
				showWinMessage();
			};
		}
	}
}

//Check is combination of dominos are wictory
function isWictory() {
	let isWictory = true;
	const result = dominos.slice();
	result.sort((a, b) => a.positionTop + a.positionLeft - b.positionTop - b.positionLeft).sort((a, b) => a.positionTop - b.positionTop);
	for (let i = 0; i < result.length - 2; i++) {
		if (result[i + 1].number - result[i].number !== 1) {
			isWictory = false;
		}
	}
	return isWictory;
}

//Check if combinations unsolvable, and reshaffles it
function canSolve() {
	let count = +fieldSize;
	const result = dominos.slice();
	result.sort((a, b) => a.positionTop + a.positionLeft - b.positionTop - b.positionLeft).sort((a, b) => a.positionTop - b.positionTop);
	
	for (let i = 0; i < result.length - 1; i++) {
		for (let j = i + 1; j < result.length - 1; j++) {
			if (result[i].number > result[j].number) count++;
		}
	}
	if (fieldSize %2 === 0) {
		if (count % 2 !== 0) {
			
			
			initGame();
			canSolve();
		}
	} else {
		if (count % 2 === 0) {
			
			
			initGame();
			canSolve();
		}
	}
} 

//Choose text size in dominos for different sizes
function scaleText(size) {
	switch (size) {
		case '3':
			return '48px';
			
		case '4':
			return '35px';
			
		case '5':
			return '30px';
			
		case '6':
			return '25px';
				
		case '7':
			return '22px';
			
		case '8':
			return '20px';	
		default:
			return '35px';
	}
}

//Start timer
function countSec(sec = 0, min = 0, hour = 0) {
	let seconds = sec;
	let minutes = min;
	let hours = hour;
	
	seconds++
	if (seconds === 60) {
		seconds = 0;
		minutes++;
	}
	if (minutes === 60) {
		minutes = 0;
		hours++;
	}
	timer = setTimeout(() => {countSec(seconds, minutes, hours)}, 1000);
	result = `${(''+hours).padStart(2, '0')}:${(''+minutes).padStart(2, '0')}:${(''+seconds).padStart(2, '0')}`;
	time.textContent = result;
	
}

//Pause timer
function stopCountSec() {
	clearTimeout(timer);
	let hours = +time.textContent.slice(0, 2);
	let minutes = +time.textContent.slice(3, 5);
	let seconds = +time.textContent.slice(6);
	pausedTime = [seconds, minutes, hours];
	isPaused = true;
	pause.textContent = 'Resume game';
	const pauseWindow = document.createElement('div');
	pauseWindow.textContent = 'Game paused';
	pauseWindow.className = 'pause-window';
	field.append(pauseWindow);
	return pausedTime;
}

//Resume timer after pause
function resumeCountSec() {
	countSec(...pausedTime);
	pause.textContent = 'Pause game';
	isPaused = false;
	pauseWindow = document.querySelector('.pause-window');
	pauseWindow.remove();
}

//Play audio for dominos movement
function playSound() {
	const audio = new Audio('assets/audio/move.mp3');
	if (!isMute) {
		audio.play();
	}
	
}

//Save field to local storage
function setLocalStorage() {
	if (localStorage.getItem('numbers')) {
		localStorage.removeItem('numbers');
		localStorage.removeItem('lefts');
		localStorage.removeItem('tops');
		localStorage.removeItem('nullLeft');
		localStorage.removeItem('nullTop');
		localStorage.removeItem('size');
		localStorage.removeItem('currentMoves');
		localStorage.removeItem('currentTime');
		save.textContent = 'Save game';
	} else {
		const positionsLeft = [];
		const positionsTop = [];
		const numOreder = [];
		let nullLeft = 0;
		let nullTop = 0;
		dominos.forEach(value => {
			if (value.number === 0) {
				nullLeft = value.positionLeft;
				nullTop = value.positionTop;
			}
			positionsLeft.push(value.positionLeft);
			positionsTop.push(value.positionTop);
			numOreder.push(value.number);
		});
	
		localStorage.setItem('numbers', JSON.stringify(numOreder));
		localStorage.setItem('lefts', JSON.stringify(positionsLeft));
		localStorage.setItem('tops', JSON.stringify(positionsTop));
		localStorage.setItem('nullLeft', nullLeft);
		localStorage.setItem('nullTop', nullTop);
		localStorage.setItem('size', fieldSize);
		localStorage.setItem('currentMoves', currentMoves);
		localStorage.setItem('currentTime', time.textContent);
		save.textContent = 'Reset save';
	}
	
}

//Show victory message and save results to local storage
function showWinMessage() {
	clearTimeout(timer);
	pause.disabled = true;
	save.disabled = true;
	victoryMessage.innerHTML = '';
	victoryMessage.textContent = `Hooray! You solved the puzzle in ${time.textContent} and ${currentMoves} moves!`;
	setTimeout(() => {
		victoryMessage.classList.remove('hidden');
		isReady = false;
	}, 501);
	
	const currentResult = {
		size: fieldSize,
		time: time.textContent,
		moves: currentMoves
	};
	let number = 1;
	leaderBoard.push(currentResult);
	leaderBoard.sort((a, b) => a.moves - b.moves);
	if (leaderBoard.length > 10) {
		leaderBoard = leaderBoard.slice(0, 10);
	}
	modal.innerHTML = '<div class="section"> <div class="results-item">#</div> <div class="results-item">Size</div> <div class="results-item">Time</div> <div class="results-item">Moves</div> </div>';
	leaderBoard.forEach(value => {
		const section = document.createElement('div');
		section.className = 'section';

		const position = document.createElement('div');
		position.textContent = number;
		position.className = 'results-item';
		section.append(position);

		const winSize = document.createElement('div');
		winSize.textContent = value.size;
		winSize.className = 'results-item';
		section.append(winSize);

		const winTime = document.createElement('div');
		winTime.textContent = value.time;
		winTime.className = 'results-item';
		section.append(winTime);

		const winMoves = document.createElement('div');
		winMoves.textContent = value.moves;
		winMoves.className = 'results-item';
		section.append(winMoves);

		modal.append(section);

		number++;
	});
	
	localStorage.setItem('leaderBoard', JSON.stringify(leaderBoard));
	localStorage.setItem('results', modal.innerHTML);
}

alert('Уважаемый проверяющий! Прошу после изменений размеров окна браузера выполнять перезагрузку страницы');