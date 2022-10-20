const field = document.querySelector('.field');
let fieldSize = 4;
const dominoNull = {
	positionLeft: fieldSize - 1,
	positionTop: fieldSize - 1,
	number: 0
};
let dominoSize = field.clientWidth / fieldSize;
const numbers = [];
const dominos = [];
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
		number: numbers[i]
	});
	domino.className = 'domino';
	domino.style.width = dominoSize + 'px';
	domino.style.height = dominoSize + 'px';

	domino.style.left = positionLeft * dominoSize + 'px';
	domino.style.top = positionTop * dominoSize + 'px';
	domino.textContent = numbers[i];
	field.append(domino);
}
dominos.push(dominoNull);
window.addEventListener('resize', () => {
	field.innerHTML='';
	dominoSize = field.clientWidth / fieldSize;
	for (let i = 0; i < fieldSize * fieldSize - 1; i++) {
		const domino = document.createElement('div');
		const positionLeft = i % fieldSize;
		const positionTop = (i - i % fieldSize) / fieldSize; 
		
		domino.className = 'domino';
		domino.style.width = dominoSize + 'px';
		domino.style.height = dominoSize + 'px';
	
		domino.style.left = positionLeft * dominoSize + 'px';
		domino.style.top = positionTop * dominoSize + 'px';
		domino.textContent = numbers[i];
		field.append(domino);
	}
});

function sortNumbers(arr) {
	return arr.sort(() => Math.random() - 0.5);
}

console.log(dominos);