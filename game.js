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

var LENIENCY = 0.25 // from 0 to 1, how close to a grid position a falling block must be to be swapped!

var DANK_MEMES_ENABLED = false; // oh baby!

var Game = function(players) {

	this.board_array = [];
	for (var i = 0; i < players; i++) {
		this.board_array.push(new Board(i));
	}

	this.pressed_keys = new Array();
	this.input = new Input();

	this.inputhash = [];
	this.namehash = [];

	this.player_register("player1", "WASDJK", this.board_array[0]);

}

Game.prototype.player_register = function(name, controls, board) {

	// oh my god this is so bad

	controls = controls.toUpperCase();
	controls = controls.split("");

	for (var i = 0; i < 6; i++) {
		if (this.inputhash[controls[i]] != undefined) {
			console.log("Conflict with " + controls[i] + "");
			console.log(this.namehash[controls[i]] + " owns that key");
			return null;
		}
	}

	this.input.deregister_board(board);
	this.input.register(name, board);

	// Bind keys to hooks

	this.inputhash[controls[0]] = this.input.up.bind(this.input);
	this.inputhash[controls[1]] = this.input.left.bind(this.input);
	this.inputhash[controls[2]] = this.input.down.bind(this.input);
	this.inputhash[controls[3]] = this.input.right.bind(this.input);
	this.inputhash[controls[4]] = this.input.switch.bind(this.input);
	this.inputhash[controls[5]] = this.input.raise.bind(this.input);

	this.namehash[controls[0]] = name;
	this.namehash[controls[1]] = name;
	this.namehash[controls[2]] = name;
	this.namehash[controls[3]] = name;
	this.namehash[controls[4]] = name;
	this.namehash[controls[5]] = name;
}

Game.prototype.add_board = function()
{
	this.board_array.push(new Board());
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

		// Draw the board background.
		b_c = this.get_board_coordinates(player);
		ctx.fillStyle = EMPTY_BLOCK_COLOR;
		ctx.fillRect(b_c.left, b_c.top, b_c.length, b_c.height);

		bot = b_c.top + b_c.height;

		block_height = b_c.height / BOARD_HEIGHT;
		block_length = b_c.length / BOARD_LENGTH;

		// Draw the blocks.
		for (var row = 0; row < BOARD_HEIGHT; row++) {
			for (var col = 0; col < BOARD_LENGTH; col++) {
				
				if (!this.board_array[player].block[row][col].empty()) {
					
					var block = this.board_array[player].block[row][col].color;
					
					// If the block is in clearing, we light it up!
					if (this.board_array[player].block[row][col].get_state() == Block.StateEnum.CLEAR) {
						block = block.replace("b", "f");
					}
					
					// Shift the block depending on how far it is into a fall.
					var relative_position = this.board_array[player].block[row][col].relative_position();
					
					ctx.fillStyle = block;
					ctx.fillRect(
						b_c.left + col * block_length,
						bot - (row + 1 + relative_position) * block_height,
						block_length, block_height);
				}
				
			}
		}

		// Draw cursor
		var cursor_width =  CURSOR_WIDTH * b_c.length / BOARD_LENGTH;
		ctx.lineWidth = cursor_width;
		ctx.fillStyle = "#000000";
		ctx.strokeRect(
					b_c.left + this.board_array[player].cursor.x * block_length - cursor_width / 2,
					bot - (this.board_array[player].cursor.y + 1) * block_height - cursor_width / 2,
					block_length * 2 + cursor_width, block_height + cursor_width);
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
Game.prototype.keydown_handler = function(key) {
	
	if (this.pressed_keys.indexOf(key) != -1) {
		console.log("You are pressing a key that is held down!");
		return null;
	}

	// Calls function bound to key
	// TODO: Rising and switching are spammable again, sorry.

	if (key in this.inputhash)
	{
		this.inputhash[key](this.namehash[key]);
	}
}

Game.prototype.keyup_handler = function(key) {
	// this is computationally slow. TODO: make faster?
	var idx = this.pressed_keys.indexOf(key);
	if (idx != -1) {
		this.pressed_keys.splice(idx, 1);
	}
}

/**
 * Advance the game timer forward a tick! Not much to see here ... yet!
 */
Game.prototype.update = function(dt) {

	for (var i = 0; i < this.board_array.length; i++) {
		this.board_array[i].update(dt);
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
