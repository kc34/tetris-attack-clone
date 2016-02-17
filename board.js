FORCE_RAISE_SPEED = 3;

var Board = function(board_number) {
	
	this.HEIGHT = BOARD_HEIGHT;
	this.WIDTH = BOARD_LENGTH;
	
	this.block = matrix_make(this.HEIGHT, this.WIDTH, EMPTY_BLOCK);
	this.raising_blocks = this.genNextRow(); // That grammar though

	this.cursor = { "x" : 2, "y" : -1 };

	// Init Board
	for (var x = 0; x < this.HEIGHT / 2; x++) {
		this.trueRaise();
	}

	// Rising Board Stuff	
	this.force_raise = false;

	this.clearing = false; // Prevents clear_lag from depleting
	this.clear_lag = 2; // Seconds
	this.autoraise_speed = 0.2; // Blocks per second
	this.autoraise_acceleration = 0.01 // Blocks per second^2
	this.fractional_raise = 0;

	this.death_grace = false;
	this.has_lost = 0; // Seconds from lose

	this.current_chain = 1;

	// Stats!
	this.highest_chain = 0;
	this.total_clears = 0;
	this.total_blocks = 0;
	this.total_moves = 0;

	this.board_number = board_number;
}

Board.prototype.toString = function() {

	// Used for hashing boards
	// TODO: use actual hash
	return this.board_number;
}

/**
 * A mostly-arbitrarily ordered sequence of steps to advance the board to the next tick.
 */
Board.prototype.update = function(dt) {
	
	this.raise(dt);

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
				this.total_blocks++;
				if (this.block[row][col].chain_material) {
					chain_found = true;
				}
				this.block[row][col].set_state(Block.StateEnum.CLEAR);
			}
			
		}
	}
	
	if (clear_found) {
		SoundPlayer.play_clear();
		this.total_clears++;
		this.clear_lag = Math.max(1,this.clear_lag);
	}

	if (chain_found) {
		this.current_chain += 1;
		this.highest_chain = Math.max(this.current_chain,this.highest_chain);
		console.log("BOARD #" + this.board_number + " " + this.current_chain + "x chain!!!");
		SoundPlayer.play_chain(this.current_chain);

		this.clear_lag += this.current_chain/10;
	}
	
	// At this point, nothing at rest can be chain material.
	
	// Also keep track of non-rests. If all are at rest, chain is reset.
	var non_rests = 0;
	for (var row = 0; row < this.HEIGHT; row++) {
		for (var col = 0; col < this.WIDTH; col++) {
			if (this.block[row][col].get_state() == Block.StateEnum.REST) {
				this.block[row][col].chain_material = false;
			} else {
				if (!this.block[row][col].empty()) { non_rests += 1; }
			}
		}
	}
	
	if (non_rests == 0) {
		this.clearing = false;
		if (this.current_chain != 1) {
			this.current_chain = 1;
			console.log("BOARD #" + this.board_number + " " + "Chain over");
		}
	}
	else {
		this.clearing = true;
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

Board.prototype.genNextRow = function() {

	var next_row = [];
	
	for (var j = 0; j < this.WIDTH; j++) {
		var possible_colors = new Array();
		for (color in BLOCK_COLORS) {
			var color_ok = true;
			// See if color would cause a clear.
			if (this.block[1][j].color == this.block[0][j].color) {
				if (BLOCK_COLORS[color] == this.block[1][j].color) {
					color_ok = false;
				}
			}
			if (j >= 2) {
				if (next_row[j - 2].color == next_row[j - 1].color) {
					if (BLOCK_COLORS[color] == next_row[j - 1].color) {
						color_ok = false;
					}
				}
			}
			if (color_ok) {
				possible_colors.push(BLOCK_COLORS[color]);
			}
		}
		if (possible_colors.length == 0) {
			next_row[j] = Block.random();
		} else {
			next_row[j] = new Block(possible_colors);
		}
	}

	return next_row;
}

Board.prototype.trueRaise = function() {

	// Shift every block up
	for (var i = this.HEIGHT - 2; i >= 0; i--) {
		for (var j = 0; j < this.WIDTH; j++) {
			this.block[i + 1][j] = this.block[i][j];
			this.block[i][j] = EMPTY_BLOCK;
		}
	}

	// Give grace period when about to lose!
	for (var j = 0; j < this.WIDTH; j++) {
		if (!this.block[this.HEIGHT - 1][j].empty()) {
			this.clear_lag = 2;
			this.death_grace = true;
			break;
		}
	}

	// Add new blocks to the front
	for (var j = 0; j < this.WIDTH; j++)
	{
		this.block[0][j] = this.raising_blocks[j];
	}
	this.raising_blocks = this.genNextRow();

	// Move the cursor up one
	if (this.cursor.y + 1 < this.HEIGHT) {
		this.cursor.y += 1;
	}
}

Board.prototype.raise = function(dt) {

	this.autoraise_speed += this.autoraise_acceleration * dt;

	if (this.force_raise) {
		this.fractional_raise += dt * FORCE_RAISE_SPEED;
	}
	else if (this.has_lost)
	{
		this.has_lost += dt;
		this.fractional_raise -= dt * this.HEIGHT / 5;
	}
	else {

		if (!this.clearing) {
			// Auto raise board
			if (this.clear_lag > 0) {
				this.clear_lag -= dt;
				if (this.clear_lag < 0) {
					this.fractional_raise += -this.clear_lag * this.autoraise_speed;
					this.clear_lag = 0;
				}
			}
			else {
				this.fractional_raise += dt * this.autoraise_speed;
			}
		}
	}	

	while (this.fractional_raise > 1) {
		this.trueRaise();

		this.fractional_raise--;
		this.force_raise = false;
	}

	// Hey

	if (this.death_grace) {

		// Check for a loss.
		if (this.clear_lag == 0) {
			console.log("BOARD #" + this.board_number + " " + "You lose!!");
			this.has_lost = 0.0001;
			this.death_grace = false;
		}
		else {
			var all_empty = true;
			for (var j = 0; j < this.WIDTH; j++) {
				if (!this.block[this.HEIGHT - 1][j].empty()) {
					all_empty = false;
				}
			}
			if (all_empty)
			{
				this.death_grace = false;
				this.clear_lag = 0;
			}
		}
	}

	// Dont put the cursor above the board
	if (this.cursor.y + 1 >= this.HEIGHT && !this.death_grace) {
		this.cursor.y -= 1;
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
