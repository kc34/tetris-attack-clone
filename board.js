var Board = function() {
	this.height = BOARD_HEIGHT;
	this.width = BOARD_LENGTH;
	this.block = new Array(BOARD_HEIGHT);
	for (var x = 0; x < BOARD_HEIGHT; x++) {
		this.block[x] = new Array();
		for (var y = 0; y < BOARD_LENGTH; y++) {
			this.block[x].push(EMPTY_BLOCK);
		}
	}
	this.cursor = { "x" : 2, "y" : -1 };
	for (var x = 0; x < BOARD_HEIGHT / 2; x++) {
		this.raise();
	}
	this.current_chain = 1;
}

/**
 * An arbitrarily ordered sequence of steps to advance the board to the next tick.
 */
Board.prototype.update = function() {
	
	// We need to drop blocks!
	this.fall();
	
	// We need to mark any blocks we want to clear.
	this.checkClear();
	

	
	// We need to clear blocks as well. This could be done in a function probably.
	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			
			if (this.block[i][j].get_state() == Block.StateEnum.CLEAR && this.block[i][j].state_timer <= 0) {
				
				// This block is marked for clearance!
				this.block[i][j] = EMPTY_BLOCK;
				
				// Every block above it is now chain material!
				for (var x = i; x < BOARD_HEIGHT; x++) {
					if (!this.block[x][j].empty()) {
						this.block[x][j].chain_material = true;
					}
				}
				
			} 
			
		}
	}
	
	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			this.block[i][j].update_timer(time_step); // Only one instance of update timer is allowed !!!
		}
	}
}

Board.prototype.swap = function() {
	if (this.block[this.cursor.y][this.cursor.x].isSwappable()) {
		if (this.block[this.cursor.y][this.cursor.x + 1].isSwappable()) {
			temp = this.block[this.cursor.y][this.cursor.x];
			this.block[this.cursor.y][this.cursor.x] = this.block[this.cursor.y][this.cursor.x + 1];
			this.block[this.cursor.y][this.cursor.x + 1] = temp;
		}
	}
}

Board.prototype.checkClear = function() {
	
	clear_found = false;
	chain_found = false;
	
	// Check for horizontal clears.
	var h = matrix_make(BOARD_HEIGHT, BOARD_LENGTH, 1);
	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = 1; j < BOARD_LENGTH; j++) {
			if (this.block[i][j].empty()) {
				h[i][j] = 0;
			} else if (this.block[i][j].matches(this.block[i][j - 1])) {
				h[i][j] = h[i][j - 1] + 1;
			} else {
				h[i][j] = 1;
			}
		}
	}
	
	// Check for vertical clears.
	var v = matrix_make(BOARD_HEIGHT, BOARD_LENGTH, 1);
	for (var j = 0; j < BOARD_LENGTH; j++) {
		for (var i = 1; i < BOARD_HEIGHT; i++) {
			if (this.block[i][j].empty()) {
				v[i][j] = 0;
			} else if (this.block[i][j].matches(this.block[i - 1][j])) {
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
				clear_found = true;
				var blocks_to_clear = h[i][j];
				for (var delta = 0; delta < blocks_to_clear; delta++) {
					if (this.block[i][j - delta].chain_material) {
						chain_found = true;
					}
					this.block[i][j - delta].set_state(Block.StateEnum.CLEAR);
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
				clear_found = true;
				var blocks_to_clear = v[i][j];
				for (var delta = 0; delta < blocks_to_clear; delta++) {
					if (this.block[i - delta][j].chain_material) {
						chain_found = true;
					}
					this.block[i - delta][j].set_state(Block.StateEnum.CLEAR);
					v[i - delta][j] = 0;
				}
			}
		}
	}
	
	if (clear_found) {
		var clear_sound = CLEAR_SOUNDS[Math.floor(Math.random() * CLEAR_SOUNDS.length)];
		var clear = new Audio(clear_sound);
		console.log(clear_sound);
		clear.play();
	}
	
	if (chain_found) {
		this.current_chain += 1;
		console.log(this.current_chain + "x chain!!!");
		for (var i = 0; i < this.current_chain; i++) {
			var chain_sound = CHAIN_SOUNDS[Math.floor(Math.random() * CHAIN_SOUNDS.length)];
			var chain = new Audio(chain_sound);
			console.log(chain_sound);
			chain.play();
		}
	}
	
	// At this point, nothing at rest can be chain material.
	// Also keep track of non-rests. If all are at rest, chain is reset.
	var non_rests = 0;
	for (var i = 0; i < BOARD_HEIGHT; i++) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			if (this.block[i][j].get_state() == Block.StateEnum.REST) {
				this.block[i][j].chain_material = false;
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
	
	for (var row = 0; row < BOARD_HEIGHT; row++) {
		for (var col = 0; col < BOARD_LENGTH; col ++) {
			
			// STEP 1:
			if (this.block[row][col].get_state() == Block.StateEnum.REST) {
				if (row > 0 && this.block[row - 1][col].empty()) {
					for (var x = row; x < BOARD_HEIGHT; x++) {
						this.block[x][col].set_state(Block.StateEnum.FLOAT);
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
					this.block[row][col].set_state(Block.StateEnum.REST);
				} else {
					if (this.block[row][col].state_timer == 0) {
						// Move block down one.
						this.block[row - 1][col] = this.block[row][col];
						this.block[row][col] = EMPTY_BLOCK;
						// Determine and set new state
						if (row - 1 == 0 || this.block[row - 2][col].isSupportive()) {
							this.block[row - 1][col].set_state(Block.StateEnum.REST);
						} else {
							this.block[row - 1][col].set_state(Block.StateEnum.FALL);
						}
					}
				}
			}
			
		}
	}
	
}
Board.prototype.raise = function() {
	
	// Check for a loss.
	var loss = false;
	for (var j = 0; j < BOARD_LENGTH; j++) {
		if (!this.block[BOARD_HEIGHT - 1][j].empty()) {
			loss = true;
		}
	}
	if (loss) { console.log("You lose!!"); }
	
	// Raise blocks from top to bottom.
	for (var i = BOARD_HEIGHT - 2; i >= 0; i--) {
		for (var j = 0; j < BOARD_LENGTH; j++) {
			this.block[i + 1][j] = this.block[i][j];
			this.block[i][j] = EMPTY_BLOCK;
		}
	}
	
	for (var j = 0; j < BOARD_LENGTH; j++) {
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
	
	this.cursor.y += 1;
	
}
