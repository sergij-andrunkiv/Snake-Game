// Canvas setting
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
// Get the width and height of the canvas element
let width = canvas.width;
let height = canvas.height;
// Calculate the width and height of the cells
let blockSize = 10;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;
// Set the score to 0
let score = 0;


// Draw a frame
let drawBorder = function() {
	ctx.fillStyle = "Gray";
	ctx.fillRect(0, 0, width, blockSize); // Upper part
	ctx.fillRect(0, height - blockSize, width, blockSize); // Lower part
	ctx.fillRect(0, 0, blockSize, height); // Left part
	ctx.fillRect(width - blockSize, 0, blockSize, height); // Right part
};

// Display the game score in the upper left corner
let drawScore = function () {
	ctx.font = "20px Courier";
	ctx.fillStyle = "Black";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + score, blockSize, blockSize);
};

// Cancel the action of setInterval and print the message "Game Over"
let gameOver = function() {
	playing = false;
	ctx.font = "60px Courier";
	ctx.fillStyle = "Black";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Game Over", width / 2, height / 2);
};

// Draw circle
let circle = function (x, y, radius, fillCircle) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);
	if (fillCircle) {
		ctx.fill();
	}
	else {
		ctx.stroke();
	}
};


// Set the Block constructor
let Block = function(col, row) {
	this.col = col;
	this.row = row;
};

// Draw a square in the cell position
Block.prototype.drawSquare = function(color) {
	let x = this.col * blockSize;
	let y = this.row * blockSize;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, blockSize, blockSize);
};

// Draw a circle in the cell position
Block.prototype.drawCircle = function(color) {
	let centerX = this.col * blockSize + blockSize / 2;
	let centerY = this.row * blockSize + blockSize / 2;
	ctx.fillStyle = color;
	circle(centerX, centerY, blockSize / 2, true);
};

// Check that this cell is in the same position as the otherBlock cell
Block.prototype.equal = function(otherBlock) {
	return this.col === otherBlock.col && this.row === otherBlock.row;
};


// Set the Snake constructor
let Snake = function() {
	this.segments = [
		new Block(7, 5),
		new Block(6, 5),
		new Block(5, 5)
	];
	this.direction = "right";
	this.nextDirection = "right";
};

// Draw a square for each segment of the snake's body
Snake.prototype.draw = function() {
	this.segments[0].drawSquare("Green");
	let isEvenSegment = false;

	for(let i = 1; i < this.segments.length; i++) {
		if (isEvenSegment) {
			this.segments[i].drawSquare("Blue");
		}
		else {
			this.segments[i].drawSquare("Yellow");
		}
		isEvenSegment = !isEvenSegment;
	}
};

// Create a new head and add it to the beginning of the snake to move the snake in the current direction
Snake.prototype.move = function() {
	let head = this.segments[0];
	let newHead;

	this.direction = this.nextDirection;

	if (this.direction === "right") {
		newHead = new Block(head.col + 1, head.row);
	}
	else if (this.direction === "down") {
		newHead = new Block(head.col, head.row + 1);
	}
	else if (this.direction === "left") {
		newHead = new Block(head.col - 1, head.row);
	}
	else if (this.direction === "up") {
		newHead = new Block(head.col, head.row - 1);
	}

	if (this.checkCollision(newHead)) {
		gameOver();
		return;
	}

	this.segments.unshift(newHead);

	if (newHead.equal(apple.position)) {
		score++;
		animationTime -= 5;
		apple.move(this.segments);
	}
	else {
		this.segments.pop();
	}
};

// Check if the snake has collided with the wall or with its body
Snake.prototype.checkCollision = function(head) {
	let leftCollision = (head.col === 0);
	let topCollision = (head.row === 0);
	let rightCollision = (head.col === widthInBlocks - 1);
	let bottomCollision = (head.row === heightInBlocks - 1);

	let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

	let selfCollision = false;

	for(let i = 0; i < this.segments.length; i++){
		if (head.equal(this.segments[i])) {
			selfCollision = true;
		}
	}

	return wallCollision || selfCollision;
};

// Set the next direction of movement of the snake based on the pressed key
Snake.prototype.setDirection = function(newDirection) {
	if (this.direction === "up" && newDirection === "down") {
		return;
	}
	else if (this.direction === "right" && newDirection === "left") {
		return;
	}
	else if (this.direction === "down" && newDirection === "up") {
		return;
	}
	else if (this.direction === "left" && newDirection === "right") {
		return;
	}

	this.nextDirection = newDirection;
};


// Set the Apple constructor
let Apple = function() {
	this.position = new Block(10, 10);
};

// Draw a circle in the position of the apple
Apple.prototype.draw = function() {
	this.position.drawCircle("LimeGreen");
};

// Move the apple to a random position
Apple.prototype.move = function(occupiedBlocks) {
	let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
	let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
	this.position = new Block(randomCol, randomRow);

	for(let i = 0; i < occupiedBlocks.length; i++) {
		if (this.position.equal(occupiedBlocks[i])) {
			this.move(occupiedBlocks);
			return;
		}
	}
};


// Create a snake object and an apple object
let snake = new Snake();
let apple = new Apple();

let playing = true;
let animationTime = 100;

let gameLoop = function() {
	ctx.clearRect(0, 0, width, height);
	drawScore();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();

	if (playing) {
		setTimeout(gameLoop, animationTime);
	}
};
gameLoop();


// Convert key codes in directions
let directions = {
	37: "left",
	38: "up",
	39: "right",
	40: "down",
};

// Set the keydown event handler (arrow keys)
$("body").keydown(function(event) {
	let newDirection = directions[event.keyCode];
	if (newDirection !== undefined) {
		snake.setDirection(newDirection);
	}
});