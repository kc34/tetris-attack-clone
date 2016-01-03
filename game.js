var EMPTY_BLOCK_COLOR = "#bbbbbb"
var BLOCK_COLORS = ["#bb0000", "#00bb00", "#bbbb00", "#bb00bb", "#00bbbb"];

var FLOAT_PERIOD = 0.00 // In seconds, how long the block will remain unmoving when swapped into midair.
var CLEAR_PERIOD = 1 // How long blocks will remain after being cleared.
var DROP_SPEED = 0.1 // After the float period, how long block will remain at each height before dropping one.

var BOARD_HEIGHT = 12 // In blocks
var BOARD_LENGTH = 6 // In blocks

var Game = function() {
	this.board = new Board();
}
Game.prototype.draw = function(accumulator) {
	
	// start with a screen clear
	ctx.fillStyle = "#334D66";
	ctx.fillRect( 0 , 0 , window.innerWidth , window.innerHeight );
	
	// Draw the board background.
	b_c = Game.get_board_coordinates();
	ctx.fillStyle = EMPTY_BLOCK_COLOR;
	ctx.fillRect(b_c.left, b_c.top, b_c.length, b_c.height);
	
	bot = b_c.top + b_c.height;
	
	
	block_height = b_c.height / BOARD_HEIGHT;
	block_length = b_c.length / BOARD_LENGTH;
	// Draw the blocks.
	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			if (!this.board.blocks[i][j].empty()) {
				var block = this.board.blocks[i][j].color;
				if (this.board.blocks[i][j].get_state() == "CLEAR") {
					block = block.replace("b", "f").replace("0", "2");
				}
				ctx.fillStyle = block;
				ctx.fillRect(
					b_c.left + j * block_length,
					bot - (i + 1) * block_height,
					block_length, block_height);
			}
		}
	}
	
	// Draw cursor
	ctx.lineWidth = 5;
	ctx.fillStyle = "#000000";
	ctx.strokeRect(
				b_c.left + this.board.cursor.x * block_length,
				bot - (this.board.cursor.y + 1) * block_height,
				block_length * 2, block_height);
	
}
Game.get_board_coordinates = function() {
	
	// First, find the exact center of the screen!
	center = {"x": window.innerWidth / 2, "y": window.innerHeight / 2}
	
	// Now, find the biggest box dimensions that can fit.
	if (window.innerHeight / window.innerWidth < BOARD_HEIGHT / BOARD_LENGTH) // Limited by screen height.
	{
		box_height = window.innerHeight * 0.9;
		box_length = box_height / 2;
	} else {
		box_length = window.innerWidth * 0.9;
		box_height = box_length * 2;
	}
	
	// Return JSON object containing proper canvas coordinates to draw board.
	return {
		"left": center.x - box_length / 2,
		"top" : center.y - box_height / 2,
		"length" : box_length,
		"height" : box_height
	};
}
Game.prototype.keydown_handler = function(key) {
	switch (key) {
		case "W":
		case "&":
			if (this.board.cursor.y < BOARD_HEIGHT - 1)
				this.board.cursor.y += 1;
			break;
		case "S":
		case "(":
			if (this.board.cursor.y > 0)
				this.board.cursor.y -= 1;
			break;
		case "A":
		case "%": 
			if (this.board.cursor.x > 0)
				this.board.cursor.x -= 1;
			break;
		case "D":
		case "'":
			if (this.board.cursor.x < BOARD_LENGTH - 2)
				this.board.cursor.x += 1;
			break;
		case " ":
			this.board.swap();
			break;
		default:
			this.board.rise();
			break;
	}
}
Game.prototype.update = function(time_step) {
	this.board.update();
}


var Board = function() {
	
	this.height = BOARD_HEIGHT;
	this.width = BOARD_LENGTH;
	this.blocks = new Array(BOARD_HEIGHT);
	for (var x = 0; x < BOARD_HEIGHT; x++) {
		this.blocks[x] = new Array();
		for (var y = 0; y < BOARD_LENGTH; y++) {
			this.blocks[x].push(EMPTY_BLOCK);
		}
	}
	
	for (var x = 0; x < BOARD_HEIGHT / 2; x++) {
		this.rise();
	}
	
	this.cursor = { "x" : 2, "y" : 5 };
	
}
Board.prototype.update = function() {
	
	this.checkClear();

	this.fall();

	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			this.blocks[i][j].state_timer += time_step;
			if (this.blocks[i][j].get_state() == "CLEAR" && this.blocks[i][j].state_timer >= CLEAR_PERIOD) {
				this.blocks[i][j] = EMPTY_BLOCK;
			} 
		}
	}
	
}
Board.prototype.swap = function() {
	if (this.blocks[this.cursor.y][this.cursor.x].get_state() != "CLEAR") {
		if (this.blocks[this.cursor.y][this.cursor.x + 1].get_state() != "CLEAR") {
			temp = this.blocks[this.cursor.y][this.cursor.x];
			this.blocks[this.cursor.y][this.cursor.x] = this.blocks[this.cursor.y][this.cursor.x + 1];
			this.blocks[this.cursor.y][this.cursor.x + 1] = temp;
		}
	}
}
Board.prototype.checkClear = function() {
	// Check for horizontal clears.
	var h = matrix_make(BOARD_HEIGHT, BOARD_LENGTH, 1);
	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = 1; j < BOARD_LENGTH; j++) {
			if (this.blocks[i][j].empty()) {
				h[i][j] = 0;
			} else if (this.blocks[i][j].matches(this.blocks[i][j - 1])) {
				h[i][j] = h[i][j - 1] + 1;
			} else {
				h[i][j] = 1;
			}
		}
	}
	
	// Check for vertical clears.
	var v = matrix_make(BOARD_HEIGHT, BOARD_LENGTH, 1);
	for (var i = 1; i < BOARD_HEIGHT; i++) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			if (this.blocks[i][j].empty()) {
				v[i][j] = 0;
			} else if (this.blocks[i][j].matches(this.blocks[i - 1][j])) {
				v[i][j] = v[i - 1][j] + 1;
			} else {
				v[i][j] = 1;
			}
		}
	}
	
	// Make horizontal clears.
	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = BOARD_LENGTH - 1; j >= 0; j--) {
			if (h[i][j] >= 3) {
				var blocks_to_clear = h[i][j];
				for (var delta = 0; delta < blocks_to_clear; delta++) {
					this.blocks[i][j - delta].set_state("CLEAR");
					h[i][j - delta] = 0;
				}
			}
		}
	}
	
	// Make horizontal clears.
	// TODO: Adapt
	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = BOARD_LENGTH - 1; j >= 0; j--) {
			if (v[i][j] >= 3) {
				var blocks_to_clear = v[i][j];
				for (var delta = 0; delta < blocks_to_clear; delta++) {
					this.blocks[i - delta][j].set_state("CLEAR");
					v[i - delta][j] = 0;
				}
			}
		}
	}
}
Board.prototype.fall = function() {
	// Step 1: Convert mid-air RESTs in airs to FLOATs.
	// Step 2: Convert FLOATs after grace period to FALLs.
	// Step 3: Drop FALLs or convert to RESTs.
	for (var j = 0; j < BOARD_LENGTH; j++) {
		if (this.blocks[0][j].get_state() != "CLEAR") {
			this.blocks[0][j].set_state("REST");
		}
	}
	for (var i = 1; i < BOARD_HEIGHT; i++) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			// STEP 1
			switch (this.blocks[i][j].get_state()) {
				
				case "REST":
					if (this.blocks[i - 1][j].empty()) {
						console.log(i + " " + j);
						for (var x = i; x < BOARD_HEIGHT; x++) {
							// TODO: INVESTIGATE
							this.blocks[x][j].set_state("FLOAT");
						}
					}
					break;
				case "FLOAT":
					if (this.blocks[i][j].state_timer >= FLOAT_PERIOD) {
						this.blocks[i][j].set_state("FALL");
					}
					break;
				case "FALL":
					if (this.blocks[i - 1][j].empty() || this.blocks[i - 1][j].get_state() == "FALL") {
						// TODO: INVESTIGATE
						if (this.blocks[i][j].state_timer >= DROP_SPEED) {
							this.blocks[i][j].state_timer = 0;
							this.blocks[i - 1][j] = this.blocks[i][j];
							this.blocks[i][j] = EMPTY_BLOCK;
						}
					}
					else
					{
						this.blocks[i][j].set_state("REST");
					}
					break;
			}
		}
	}
	
}
Board.prototype.rise = function() {
	for (var j = 0; j < BOARD_LENGTH; j++) {
		if (!this.blocks[BOARD_HEIGHT - 1][j].empty()) {
			console.log("LOSE");
		}
	}
	for (var i = BOARD_HEIGHT - 2; i >= 0; i--) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			this.blocks[i + 1][j] = this.blocks[i][j];
			this.blocks[i][j] = EMPTY_BLOCK;
		}
	}
	
	for (var j = 0; j < BOARD_LENGTH; j++) {
		var possible_colors = new Array();
		for (color in BLOCK_COLORS) {
			var color_ok = true;
			// See if color would cause a clear.
			if (this.blocks[2][j].color == this.blocks[1][j].color) {
				if (BLOCK_COLORS[color] == this.blocks[2][j].color) {
					color_ok = false;
				}
			}
			if (j >= 2) {
				if (this.blocks[0][j - 2].color == this.blocks[0][j - 1].color) {
					if (BLOCK_COLORS[color] == this.blocks[0][j - 1].color) {
						color_ok = false;
					}
				}
			}
			if (color_ok) {
				possible_colors.push(BLOCK_COLORS[color]);
			}
		}
		this.blocks[0][j] = new Block(possible_colors);
	}
}

var Block = function(block_colors) {
	this.color = block_colors[Math.floor(Math.random() * block_colors.length)];
	this.bright_color = this.color.replace("b", "f");
	this.state = "REST"; // STATES SO FAR: REST, FALL (FLOAT), CLEAR
	this.state_timer = 0;
}
Block.prototype.empty = function() {
	return false;
}
Block.prototype.matches = function(otherBlock) {
	block_is_matchable = (this.state == "REST" || this.state == "FLOAT");
	other_block_is_matchable = (otherBlock.state == "REST") || (this.state == "FLOAT");
	colors_match = this.color == otherBlock.color;
	return block_is_matchable && other_block_is_matchable && colors_match;
}
Block.prototype.get_state = function() {
	return this.state;
}
Block.prototype.set_state = function(new_state) {
	this.state = new_state;
	this.state_timer = 0;
}
Block.random = function() {
	return new Block(BLOCK_COLORS);
}

var EMPTY_BLOCK = new Block([EMPTY_BLOCK_COLOR]);
EMPTY_BLOCK.matches = function(otherBlock) { return false; }
EMPTY_BLOCK.empty = function() { return true; }
EMPTY_BLOCK.set_state = function() { this.state = "EMPTY" } // TODO: INVESTIGATE
EMPTY_BLOCK.set_state("EMPTY");

var matrix_make = function(height, width, default_val) {
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
