const field = document.querySelector('.field');
let fieldSize = 3;

const dominoNull = {
	positionLeft: fieldSize - 1,
	positionTop: fieldSize - 1,
	number: 0
};
let dominoSize = field.clientWidth / fieldSize;
const numbers = [];
const dominos = [];
let isReady = true;
for (let i = 1; i < fieldSize * fieldSize; i++) {
 	numbers.push(i);
}
sortNumbers(numbers);
initGame();

dominos.push(dominoNull);
window.addEventListener('resize', () => {
	field.innerHTML='';
	dominoSize = field.clientWidth / fieldSize;
	initGame();
});

function sortNumbers(arr) {
	return arr.sort(() => Math.random() - 0.5);
}

function initGame() {
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
	
		domino.style.left = positionLeft * dominoSize + 'px';
		domino.style.top = positionTop * dominoSize + 'px';
		switch (fieldSize) {
			case 3:
				domino.style.fontSize = '48px';
				break;
			case 4:
				domino.style.fontSize = '35px';
				break;
			case 5:
				domino.style.fontSize = '30px';
				break;	
			case 6:
				domino.style.fontSize = '25px';
				break;	
			case 7:
				domino.style.fontSize = '22px';
				break;
			case 8:
				domino.style.fontSize = '20px';
				break;	
		}
		domino.textContent = numbers[i];

		domino.addEventListener('click', () => moveDominos(i));
		domino.addEventListener('transitionend', () => isReady = true);
		field.append(domino);
	}
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
			if (isWictory()) {
				setTimeout(() => alert('WIN!!1'), 500);
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
		console.log(result[i + 1].number - result[i].number);
		console.log(result);
	}
	return isWictory;
}
