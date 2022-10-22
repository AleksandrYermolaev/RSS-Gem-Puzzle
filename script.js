const field = document.querySelector('.field');
const sizes = document.querySelectorAll('input');
const start = document.querySelector('.start');
const time = document.querySelector('.time');
const moves = document.querySelector('.moves');
const pause = document.querySelector('.pause');
const save = document.querySelector('.save');
let fieldSize = 4;
const dominoNull = {};
let dominoSize = 0;
let numbers = [];
let dominos = [];
let isReady = true;
let isPaused = false;
let currentMoves = 0;
let timer = null;
let pausedTime = 0;


window.addEventListener('resize', () => {
	initGame();
});

sizes.forEach(value => {
	value.addEventListener('change', () => {
		if (value.checked === true) {
			fieldSize = value.value;
			initGame();
		}
	});
});

start.addEventListener('click', () => {
	initGame();
});

pause.addEventListener('click', () => {
	if (isPaused) {
		resumeCountSec();
	} else {
		stopCountSec();
	}
});


function sortNumbers(arr) {
	return arr.sort(() => Math.random() - 0.5);
}

function initGame() {
	pause.disabled = false;
	save.disabled = false;
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
			if (isWictory()) {
				setTimeout(() => alert(`You win game in ${time.textContent} and ${currentMoves} moves!`), 500);
			};
			
		}
	}
}

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

function stopCountSec() {
	clearTimeout(timer);
	let hours = +time.textContent.slice(0, 2);
	let minutes = +time.textContent.slice(3, 5);
	let seconds = +time.textContent.slice(6);
	pausedTime = [seconds, minutes, hours];
	isPaused = true;
	pause.textContent = 'Resume game';
	return pausedTime;
}
function resumeCountSec() {
	countSec(...pausedTime);
	pause.textContent = 'Pause game';
	isPaused = false;
}

