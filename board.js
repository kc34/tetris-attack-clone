var Board = function() {
	
	this.HEIGHT = BOARD_HEIGHT;
	this.WIDTH = BOARD_LENGTH;
	
	this.block = matrix_make(this.HEIGHT, this.WIDTH, EMPTY_BLOCK);
	
	this.cursor = { "x" : 2, "y" : -1 };
	
	for (var x = 0; x < this.HEIGHT / 2; x++) {
		this.raise();
	}
	
	this.current_chain = 1;
}

/**
 * A mostly-arbitrarily ordered sequence of steps to advance the board to the next tick.
 */
Board.prototype.update = function(dt) {
	
	// We need to drop blocks!
	this.fall();
	
	// We need to mark any blocks we want to clear.
	this.checkClear();
	
	// We need to clear blocks as well. This could be done in a function probably.
	for (var i = 0; i < this.HEIGHT; i++) {
		for (var j = 0; j < this.WIDTH; j++) {
			
			if (this.block[i][j].get_state() == Block.StateEnum.CLEAR && this.block[i][j].state_timer <= 0) {
				
				// This block is marked for clearance!
				this.block[i][j] = EMPTY_BLOCK;
				
				// Every block above it is now chain material!
				for (var x = i; x < this.HEIGHT; x++) {
					if (!this.block[x][j].empty()) {
						this.block[x][j].chain_material = true;
						if (this.block[x][j].get_state() == Block.StateEnum.REST) {
							this.block[x][j].set_state(Block.StateEnum.FLOAT, true);
						}
					}
				}
				
			} 
			
		}
	}
	
	for (var i = 0; i < this.HEIGHT; i++) {
		for (var j = 0; j < this.WIDTH; j++) {
			this.block[i][j].update_timer(dt); // Only one instance of update timer is allowed !!!
		}
	}
}

Board.prototype.swap = function() {
		
	if (this.swappable(this.cursor.x, this.cursor.y)) {
		temp = this.block[this.cursor.y][this.cursor.x];
		this.block[this.cursor.y][this.cursor.x] = this.block[this.cursor.y][this.cursor.x + 1];
		this.block[this.cursor.y][this.cursor.x + 1] = temp;
		
		this.block[this.cursor.y][this.cursor.x].chain_material = false;
		this.block[this.cursor.y][this.cursor.x + 1].chain_material = false;
		
		SoundPlayer.play_swap();
	}
}

Board.prototype.swappable = function(x, y) {
	
	var blockA = this.block[y][x];
	var blockB = this.block[y][x + 1];
	
	var initial_conditions = (blockA.isSwappable() &&
		blockB.isSwappable() &&
		(blockA.color != blockB.color) &&
	    (Math.abs(blockA.relative_position()) < LENIENCY / 2) &&
		(Math.abs(blockB.relative_position()) < LENIENCY / 2));
	
	if (initial_conditions) {
		if (y == this.HEIGHT - 1) {
			return true;
		} else {
			return ((this.block[y + 1][x].relative_position() >= 0) &&
				(this.block[y + 1][x + 1].relative_position() >= 0));
		}
	}
	return false;
	
}

Board.prototype.checkClear = function() {
	
	clear_found = false;
	chain_found = false;
	
	// Check for horizontal clears.
	var h = matrix_make(this.HEIGHT, this.WIDTH, 1);
	for (var i = 0; i < this.HEIGHT; i++) {
		h[i] = identify_matches(count_consecutive_matches(this.block[i], Block.isMatch), 3);
	}
	
	// Check for vertical clears.
	var v = matrix_make(this.WIDTH, this.HEIGHT, 1); // Tricky! this one is rotated
	for (var j = 0; j < this.WIDTH; j++) {
		
		var my_array = new Array(this.HEIGHT);
		
		for (var i = 0; i < this.HEIGHT; i++) {
			my_array[i] = this.block[i][j];
		}
		
		v[j] = identify_matches(count_consecutive_matches(my_array, Block.isMatch), 3);
		
	}
	
	// Make horizontal clears.
	for (var row = 0; row < this.HEIGHT; row++) {
		for (var col = 0; col < this.WIDTH; col++) {
			
			if (h[row][col] == true || v[col][row] == true) {
				clear_found = true;
				if (this.block[row][col].chain_material) {
					chain_found = true;
				}
				this.block[row][col].set_state(Block.StateEnum.CLEAR);
			}
			
		}
	}
	
	if (clear_found) SoundPlayer.play_clear();
	
	if (chain_found) {
		this.current_chain += 1;
		console.log(this.current_chain + "x chain!!!");
		SoundPlayer.play_chain(this.current_chain);
	}
	
	// At this point, nothing at rest can be chain material.
	
	// Also keep track of non-rests. If all are at rest, chain is reset.
	var non_rests = 0;
	for (var row = 0; i < this.HEIGHT; row++) {
		for (var col = 0; j < this.WIDTH; col++) {
			if (this.block[row][col].get_state() == Block.StateEnum.REST) {
				this.block[row][col].chain_material = false;
			} else {
				if (!this.block[i][j].empty()) { non_rests += 1; }
			}
		}
	}
	
	if (non_rests == 0 && this.current_chain != 1) {
		this.current_chain = 1;
		console.log("Chain over");
	}
}


Board.prototype.fall = function() {
	
	// Step 1: Convert mid-air RESTs in airs to FLOATs.
	// Step 2: Convert FLOATs after grace period to FALLs.
	// Step 3: Drop FALLs or convert to RESTs.
	
	for (var row = 0; row < this.HEIGHT; row++) { // Bottom to top
		for (var col = 0; col < this.WIDTH; col++) { // Left to right
			
			// STEP 1:
			if (this.block[row][col].get_state() == Block.StateEnum.REST) {
				if (row > 0 && !this.block[row - 1][col].isSupportive()) {
					for (var x = row; x < this.HEIGHT; x++) {
						if (this.block[x][col].get_state() == Block.StateEnum.REST) {
							this.block[x][col].set_state(Block.StateEnum.FLOAT);
						}
					}
				}
			}
			
			// STEP 2:
			if (this.block[row][col].get_state() == Block.StateEnum.FLOAT) {
				if (this.block[row][col].state_timer == 0) {
					this.block[row][col].set_state(Block.StateEnum.FALL);
				}
			}
			
			// STEP 3:
			if (this.block[row][col].get_state() == Block.StateEnum.FALL) {
				if (row == 0 || this.block[row - 1][col].isSupportive()) {
					if (this.block[row][col].relative_position() - (TIME_STEP * DROP_SPEED) <= 0.0) {
						// Trying to anticipate block-clipping
						this.block[row][col].set_state(Block.StateEnum.REST);
					}
				} else {
					if (this.block[row][col].state_timer == 0) {
						// Move block down one.
						this.block[row - 1][col] = this.block[row][col];
						this.block[row][col] = EMPTY_BLOCK;
						// Determine and set new state
						/*
						if (row - 1 == 0 || this.block[row - 2][col].isSupportive()) {
							this.block[row - 1][col].set_state(Block.StateEnum.REST);
						} else {
							this.block[row - 1][col].set_state(Block.StateEnum.FALL);
						}*/
						this.block[row - 1][col].set_state(Block.StateEnum.FALL);
					}
				}
			}
			
		}
	}
	
}
Board.prototype.raise = function() {
	
	// Check for a loss.
	var loss = false;
	for (var j = 0; j < this.WIDTH; j++) {
		if (!this.block[this.HEIGHT - 1][j].empty()) {
			loss = true;
		}
	}
	if (loss) { console.log("You lose!!"); }
	
	// Raise blocks from top to bottom.
	for (var i = this.HEIGHT - 2; i >= 0; i--) {
		for (var j = 0; j < this.WIDTH; j++) {
			this.block[i + 1][j] = this.block[i][j];
			this.block[i][j] = EMPTY_BLOCK;
		}
	}
	
	for (var j = 0; j < this.WIDTH; j++) {
		var possible_colors = new Array();
		for (color in BLOCK_COLORS) {
			var color_ok = true;
			// See if color would cause a clear.
			if (this.block[2][j].color == this.block[1][j].color) {
				if (BLOCK_COLORS[color] == this.block[2][j].color) {
					color_ok = false;
				}
			}
			if (j >= 2) {
				if (this.block[0][j - 2].color == this.block[0][j - 1].color) {
					if (BLOCK_COLORS[color] == this.block[0][j - 1].color) {
						color_ok = false;
					}
				}
			}
			if (color_ok) {
				possible_colors.push(BLOCK_COLORS[color]);
			}
		}
		if (possible_colors.length == 0) {
			this.block[0][j] = Block.random();
		} else {
			this.block[0][j] = new Block(possible_colors);
		}
	}
	if (this.cursor.y + 1 < this.HEIGHT) {
		this.cursor.y += 1;
	}
	
}


/**
 *	Example input:  [0, 0, 1, 1, 1, 0], function(a, b) { return a.equals(b); }
 *  Example output: [1, 2, 1, 2, 3, 1]
 */
count_consecutive_matches = function(my_array, match_function) {

	var consecutive_matches = new Array(my_array.length);
	consecutive_matches[0] = 1;
	
	for (var idx = 1; idx < my_array.length; idx++) {
		if (match_function(my_array[idx], my_array[idx - 1])) {
			consecutive_matches[idx] = consecutive_matches[idx - 1] + 1;
		} else {
			consecutive_matches[idx] = 1;
		}
	}
	
	return consecutive_matches;
}

/**
 *  Example input:  [1, 2, 1, 2, 3, 1], 3
 * 	Example output: [F, F, T, T, T, F] (where T/F represent true/false)
 */
identify_matches = function(match_array, match_threshold) {
	
	var matched = new Array();
	
	var idx = match_array.length - 1;
	while (idx >= 0) {
		
		if (match_array[idx] >= match_threshold) {
			var blocks_to_match = match_array[idx];
			for (var delta = 0; delta < blocks_to_match; delta++) {
				matched.unshift(true);
				idx--;
			}
		} else {
			matched.unshift(false);
			idx--;
		}
		
	}
	
	return matched;
	
}
