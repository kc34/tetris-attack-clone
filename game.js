var TEMPORAL_ANTIALIASING = false; // Doesn't look so good. Don't use!

var EMPTY_BLOCK_COLOR = "#999999"
var BLOCK_COLORS = ["#bb0000", "#00bb00", "#bbbb00", "#bb00bb", "#00bbbb"];

var FLOAT_PERIOD = 0.4; // In seconds, how long the block will remain unmoving when swapped into midair.
var CLEAR_PERIOD = 1; // How long blocks will remain after being cleared.
var DROP_SPEED = 50; // Blocks per second.

var BOARD_HEIGHT = 12; // In blocks
var BOARD_LENGTH = 6;  // In blocks

var CANVAS_BACKGROUND_COLOR = "#334D66"; // A pretty shade of blue!

var DANK_MEMES_ENABLED = true;

var Game = function() {
	this.board = new Board();
}

/**
 * TODO: Please, PLEASE make this look prettier.
 * Draws the entire game.
 */
Game.prototype.draw = function(accumulator) {
	
	// start with a screen clear
	ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
	ctx.fillRect( 0 , 0 , window.innerWidth , window.innerHeight );
	
	// Draw the board background.
	b_c = Game.get_board_coordinates();
	ctx.fillStyle = EMPTY_BLOCK_COLOR;
	ctx.fillRect(b_c.left, b_c.top, b_c.length, b_c.height);
	
	bot = b_c.top + b_c.height;
	
	block_height = b_c.height / BOARD_HEIGHT;
	block_length = b_c.length / BOARD_LENGTH;
	// Draw the blocks.
	for (var row = 0; row < BOARD_HEIGHT; row++) {
		for (var col = 0; col < BOARD_LENGTH; col++) {
			if (!this.board.block[row][col].empty()) {
				var block = this.board.block[row][col].color;
				if (this.board.block[row][col].get_state() == Block.StateEnum.CLEAR) {
					block = block.replace("b", "f");
				}
				var percent_fall = 0;
				if (this.board.block[row][col].get_state() == Block.StateEnum.FALL) {
					if (!TEMPORAL_ANTIALIASING) {
						accumulator = 0;
					}
					percent_fall = 1 - ((this.board.block[row][col].state_timer - accumulator) / (1.0 / DROP_SPEED));
					if (percent_fall > 1) { percent_fall = 1;}
				}
				ctx.fillStyle = block;
				ctx.fillRect(
					b_c.left + col * block_length,
					bot - (row + 1 - percent_fall) * block_height,
					block_length, block_height);
			}
		}
	}
	
	// Draw cursor
	var cursor_width = 5;
	ctx.lineWidth = cursor_width;
	ctx.fillStyle = "#000000";
	ctx.strokeRect(
				b_c.left + this.board.cursor.x * block_length - cursor_width / 2,
				bot - (this.board.cursor.y + 1) * block_height - cursor_width / 2,
				block_length * 2 + cursor_width, block_height + cursor_width);
	
}

/**
 * Gets canvas coordinates of where the top left of the board should be.
 */
Game.get_board_coordinates = function() {
	
	// First, find the exact center of the screen!
	center = {"x": window.innerWidth / 2, "y": window.innerHeight / 2}
	
	// Now, find the biggest box dimensions that can fit.
	if (window.innerHeight / window.innerWidth < BOARD_HEIGHT / BOARD_LENGTH) // Limited by screen height.
	{
		box_height = window.innerHeight * 0.9;
		box_length = box_height / BOARD_HEIGHT * BOARD_LENGTH;
	} else {
		box_length = window.innerWidth * 0.9;
		box_height = box_length / BOARD_LENGTH * BOARD_HEIGHT;
	}
	
	// Return JSON object containing proper canvas coordinates to draw board.
	return {
		"left": center.x - box_length / 2,
		"top" : center.y - box_height / 2,
		"length" : box_length,
		"height" : box_height
	};
}

/**
 * Ugly way to match key presses to functions.
 * TODO: Make less ugly!
 */
Game.prototype.keydown_handler = function(key) {
	switch (key) {
		case "W":
		case "&":
			if (this.board.cursor.y < BOARD_HEIGHT - 1) {
				this.board.cursor.y += 1;
				SoundPlayer.play_move();
			}
			break;
		case "S":
		case "(":
			if (this.board.cursor.y > 0) {
				this.board.cursor.y -= 1;
				SoundPlayer.play_move();
			}
			break;
		case "A":
		case "%": 
			if (this.board.cursor.x > 0) {
				this.board.cursor.x -= 1;
				SoundPlayer.play_move();
			}
			break;
		case "D":
		case "'":
			if (this.board.cursor.x < BOARD_LENGTH - 2) {
				this.board.cursor.x += 1;
				SoundPlayer.play_move();
			}
			break;
		case " ":
			var swap = new Audio("sound/Swap.wav");
			swap.play();
			this.board.swap();
			break;
		default:
			this.board.raise();
			SoundPlayer.play_move();
			break;
	}
}

/**
 * Advance the game timer forward a tick! Not much to see here ... yet!
 */
Game.prototype.update = function(time_step) {
	this.board.update();
}

/**
 * Miscellaneous helper functions.
 */
var matrix_make = function(height, width, default_val) {
	// Constructs 2D array with given dimensions & default value.
	var my_matrix = new Array();
	for (var row = 0; row < height; row++) {
		var new_row = new Array();
		for (var col = 0; col < width; col++) {
			new_row.push(default_val);
		}
		my_matrix.push(new_row);	
	}
	return my_matrix
}

var random_from_array = function(my_array) {
	return my_array[Math.floor(Math.random() * my_array.length)];
}
