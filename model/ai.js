/**
 * An artificial intelligence player to play against.
 */
var Ai = function(name, input) {

	this.name = name;
	this.input = input;

	this.backlog_time = 0;

	this.inputs_p_second = Math.random() * 19 + 1;

	this.board = null;

	// Queues are really bad in Javascript
	// Shift/Push beause inputs are added in bulk and removed each frame
	// Pop/Unshift would cause lag spikes on frames when inputs are queued
	this.input_queue = [];
}

Ai.prototype.update = function(dt) {

	// Get the board for faster access?
	// IDK its javascript
	if (this.board == null) {
		this.board = this.input.get_board(this.name);
		if (this.board == null)
		{
			return null;
		}
	}

	// In a lag spike, real people should be able predict the future well enough to still make inputs
	// This lets the AI make moves in the lag spike without it being "cheaty"

	this.backlog_time += dt;

	// Find a reasonable non-magic formula
	// REASONING:
	// Math.pow(dt [operation] foo, bar) | As time between render gets larger, it becomes harder to predict the future
	// + foo | The value of the magic number is the maximum moves made outside of a lag spike
	var useful_moves = Math.pow(dt, 1/3) + 2;

	for (var moves = Math.min(useful_moves, this.backlog_time * this.inputs_p_second); moves >= 0; moves--) {
		this.backlog_time -= 1/this.inputs_p_second;
		this.move();
	}
}

Ai.prototype.move = function() {

	if (this.input_queue.length == 0) {

		this.get_instructions();
	}

	var instruction = this.input_queue.shift();
	switch (instruction) {
		case "up":
			this.input.up(this.name);
			break;
		case "left":
			this.input.left(this.name);
			break;
		case "down":
			this.input.down(this.name);
			break;
		case "right":
			this.input.right(this.name);
			break;
		case "switch":
			this.input.switch(this.name);
			break;
		case "raise":
			this.input.raise(this.name);
			break;
	}
}

Ai.prototype.get_instructions = function() {

	// For every row
	for (var row = BOARD_HEIGHT-1 - 1; row >= 0; row--) {
		// Check if row is completely empty
		for (var column = 0; column < BOARD_LENGTH; column++) {
			if (!this.board.block[row][column].empty())
			{
				break;
			}
		}
		// Completion of previous loop ==> row is empty
		if (column >= BOARD_LENGTH) {
			this.input_queue.push("raise");
		}
		else {
			break;
		}
	}

	var target_x = Math.random() * (BOARD_LENGTH-2);
	var target_y = Math.random() * (BOARD_HEIGHT-1);

	for (var x = this.board.cursor.x; x < target_x; x++) {
		this.input_queue.push("right");
	}
	for (var x = this.board.cursor.x; x > target_x; x--) {
		this.input_queue.push("left");
	}
	for (var y = this.board.cursor.y; y < target_y; y++) {
		this.input_queue.push("up");
	}
	for (var y = this.board.cursor.y; y > target_y; y--) {
		this.input_queue.push("down");
	}

	// Shuffle inputs (looks neat, but is a bad idea for what Im trying to implement)

	for (var i = this.input_queue.length - 1; i >= 0; i--) {

		var j = Math.floor(Math.random() * (i+1));

		var k = this.input_queue[i];
		this.input_queue[i] = this.input_queue[j];
		this.input_queue[j] = k;
	}

	this.input_queue.push("switch");
}
