var EMPTY_BLOCK_COLOR = "#999999";
var BLOCK_COLORS = ["#bb0000", "#00bb00", "#bbbb00", "#bb00bb", "#00bbbb"];

var FLOAT_PERIOD = 0.1; // In seconds, how long the block will remain unmoving when swapped into midair.
var CHAIN_FLOAT_PERIOD = 0.25 // how long the block will remain when something under it is cleared.
var CLEAR_PERIOD = 1.1; // How long blocks will remain after being cleared.
var DROP_SPEED = 20; // Blocks per second.

var CURSOR_WIDTH = 0.1; // In blocks
var BOARD_HEIGHT = 12; // In blocks
var BOARD_LENGTH = 6;  // In blocks

var BOARD_SPACING = 1.5; // In blocks

var CANVAS_BACKGROUND_COLOR = "#334D66"; // A pretty shade of blue!
var TEXT_COLOR = "#E6DDAC"

var LENIENCY = 0.25 // from 0 to 1, how close to a grid position a falling block must be to be swapped!

var DANK_MEMES_ENABLED = false; // oh baby!

var Game = function(players) {

	Screen.apply(this, []);

	this.board_array = [];
	this.player_to_board = [];

	for (var i = 0; i < players; i++) {
		this.add_player();
	}

	this.activePlayers = 1;
	this.ais = new Array();
}

// Inherit from Screen 
Game.prototype = Object.create(Screen.prototype);
Game.prototype.constructor = Game;

Game.prototype.add_board = function() {

	var board = new Board(this.board_array.length);
	this.board_array.push(board);
	return board;
}

Game.prototype.add_player = function() {

	var board = this.add_board();
	this.player_to_board.push(board);
}

Game.prototype.add_ai = function(aps) {

	var board = this.add_board();

	var ai = new Ai(board, aps);
	this.ais.push(ai);
	return ai;
}

/**
 * TODO: Please, PLEASE make this look prettier.
 * Draws the entire game.
 */
Game.prototype.draw = function(accumulator) {

	// start with a screen clear
	ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
	ctx.fillRect( 0 , 0 , window.innerWidth , window.innerHeight );
	
	// For each board
	for (var player = 0; player < this.board_array.length; player++){

		var current_board = this.board_array[player];

		// Draw the board background.
		b_c = this.get_board_coordinates(player);

		ctx.fillStyle = EMPTY_BLOCK_COLOR;
		ctx.fillRect(b_c.left, b_c.top, b_c.length, b_c.height);

		bot = b_c.top + b_c.height;

		block_height = b_c.height / BOARD_HEIGHT;
		block_length = b_c.length / BOARD_LENGTH;

		// Get the board raise offset
		var fractional_raise = current_board.fractional_raise;
		//fractional_raise = 0;

		// LOL remove me
		if (current_board.has_lost) {
			ctx.fillStyle = TEXT_COLOR;
			ctx.font = b_c.height/12 + "px sans-serif";
			ctx.textAlign = "center";
			ctx.fillText("YOU LOST", b_c.left + b_c.length/2, b_c.top + b_c.height/2);
		}

		// Draw the blocks.
		for (var row = 0; row < BOARD_HEIGHT; row++) {
			for (var col = 0; col < BOARD_LENGTH; col++) {
				
				if (!current_board.block[row][col].empty()) {
					
					var block = current_board.block[row][col].color;
					
					// If the block is in clearing, we light it up!
					if (current_board.block[row][col].get_state() == Block.StateEnum.CLEAR) {
						block = block.replace("b", "f");
					}
					
					// Shift the block depending on how far it is into a fall.
					// Then, shift the block based on the autoraise of the board.
					var relative_position = current_board.block[row][col].relative_position();
					relative_position += fractional_raise;

					ctx.fillStyle = block;
					ctx.fillRect(
						b_c.left + col * block_length,
						bot - (row + 1 + relative_position) * block_height,
						block_length, block_height);
				}
				
			}
		}

		// Draw to be inserted blocks
		for (var col = 0; col < BOARD_LENGTH; col++) {
			var block = current_board.raising_blocks[col].color;
			block = block.replace("b", "8");

			var relative_position = fractional_raise;

			ctx.fillStyle = block;
			ctx.fillRect(
				b_c.left + col * block_length,
				bot - (relative_position) * block_height,
				block_length, block_height);
		}

		// Redraw Top and Bottom :/
		ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
		ctx.fillRect(
			b_c.left,
			b_c.top - block_height,
			block_length * BOARD_LENGTH,
			block_height);
		ctx.fillRect(
			b_c.left,
			bot,
			block_length * BOARD_LENGTH,
			block_height);

		// Draw cursor
		var cursor_width =  CURSOR_WIDTH * b_c.length / BOARD_LENGTH;
		ctx.lineWidth = cursor_width;
		ctx.fillStyle = "#000000";
		ctx.strokeRect(
					b_c.left + current_board.cursor.x * block_length - cursor_width / 2,
					bot - (current_board.cursor.y + fractional_raise + 1) * block_height - cursor_width / 2,
					block_length * 2 + cursor_width, block_height + cursor_width);

		// Board IDer
		ctx.textAlign = "start";
		ctx.fillStyle = TEXT_COLOR;
		ctx.font = b_c.height/30 + "px sans-serif";
		ctx.fillText("Player " + (player + 1), b_c.left, b_c.top + b_c.height + b_c.height/30);

		// Stop! HAMMERTIME
		ctx.fillText(Math.floor(current_board.clear_lag * 100)/100 + "", b_c.left + b_c.length/30, b_c.top + b_c.height/30);

		// Fun facts!
		ctx.font = b_c.height/60 + "px sans-serif";
		ctx.textAlign = "end";

		var efficiency = current_board.total_blocks / current_board.total_moves;
		ctx.fillText("Efficiency!", b_c.left + b_c.length, b_c.top + b_c.height + b_c.height/60);

		// TODO: Do some stuff with color to make players feel bad
		// ctx.fillStyle = "#E6DDAC";
		ctx.fillText(Math.round(efficiency*1000)/1000 + " blocks / move", b_c.left + b_c.length, b_c.top + b_c.height + b_c.height/30);
	}	
}

/**
 * Gets canvas coordinates of where the top left of the board should be.
 */
Game.prototype.get_board_coordinates = function(player) {
	
	// First, find the exact center of the screen!
	center = {"x": window.innerWidth / 2, "y": window.innerHeight / 2}
	
	// Now, find the biggest box dimensions that can fit.        \/\/\/\/ This can probably be simplified
	if (window.innerHeight / window.innerWidth < BOARD_HEIGHT / (this.board_array.length * BOARD_LENGTH + (this.board_array.length - 1) * BOARD_SPACING)) // Limited by screen height.
	{
		box_height = window.innerHeight * 0.9;
		box_length = box_height / BOARD_HEIGHT * BOARD_LENGTH;
	} else {

		// TODO: Fingers weak, code's spaghetti
		box_length = window.innerWidth / (this.board_array.length + (this.board_array.length - 1) * BOARD_SPACING/BOARD_LENGTH) * 0.9;
		box_height = box_length / BOARD_LENGTH * BOARD_HEIGHT;
	}
	
	// Return JSON object containing proper canvas coordinates to draw board.
	return {
		"left": center.x - (this.board_array.length * box_length + (this.board_array.length - 1) * box_length * BOARD_SPACING / BOARD_LENGTH) / 2 // Goto very left
		      + player * (box_length + box_length * BOARD_SPACING / BOARD_LENGTH), // Offset for player
		"top" : center.y - box_height / 2,
		"length" : box_length,
		"height" : box_height
	};
}

/**
 * Ugly way to match key presses to functions.
 * TODO: Make less ugly!
 */
Game.prototype.keydown_handler = function(key, meaning) {
	
	// Figure out a way to tie this back into removing spam
	// if (this.pressed_keys.indexOf(key) != -1) {
	// 	console.log("You are pressing a key that is held down!");
	// 	return null;
	// }

	// Calls function bound to key
	// TODO: Rising and switching are spammable again, sorry.

	split = meaning.split(".");

	if (split[0] === "player")
	{
		splitAgain = split[1].split("_");

		var num = 1 * splitAgain[0];
		if (num > this.player_to_board.length) {return;}

		board = this.player_to_board[num];

		if (splitAgain[1] === "up") {board.upInput();}
		else if (splitAgain[1] === "down") {board.downInput();}
		else if (splitAgain[1] === "left") {board.leftInput();}
		else if (splitAgain[1] === "right") {board.rightInput();}
		else if (splitAgain[1] === "a") {board.switchInput();}
		else if (splitAgain[1] === "b") {board.switchInput();}
		else if (splitAgain[1] === "c") {board.raiseInput();}
	}
}

Game.prototype.keyup_handler = function(key, meaning) {
	// this is computationally slow. TODO: make faster?
	// var idx = this.pressed_keys.indexOf(key);
	// if (idx != -1) {
	// 	this.pressed_keys.splice(idx, 1);
	// }
}

/**
 * Advance the game timer forward a tick! Not much to see here ... yet!
 */
Game.prototype.update = function(dt) {

	for (var i = 0; i < this.board_array.length; i++) {
		this.board_array[i].update(dt);
	}

	for (var i = 0; i < this.ais.length; i++) {
		this.ais[i].update(dt);
	}
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
	// Given an array, pulls a element selected at random. Uniform probability.
	return my_array[Math.floor(Math.random() * my_array.length)];
}