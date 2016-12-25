/**
 * An artificial intelligence player to play against.
 */
var Ai = function(board, aps) {

	this.board = board;

	this.backlog_time = 0;

	this.inputs_p_second = aps;

	// Queues are really bad in Javascript
	// Shift/Push beause inputs are added in bulk and removed each frame
	// Pop/Unshift would cause lag spikes on frames when inputs are queued
	this.input_queue = [];
}

Ai.prototype.update = function(dt) {

	this.backlog_time += dt;

	for (2; this.backlog_time >= 1/this.inputs_p_second; this.backlog_time -= 1/this.inputs_p_second) {
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
			this.board.upInput();
			break;
		case "left":
			this.board.leftInput();
			break;
		case "down":
			this.board.downInput();
			break;
		case "right":
			this.board.rightInput();
			break;
		case "switch":
			this.board.switchInput();
			break;
		case "raise":
			this.board.raiseInput();
			break;
	}
}

Ai.prototype.get_instructions = function() {

	// For every row
	for (var row = 0; row <= BOARD_HEIGHT* 2/3; row++) {
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
