/**
 * The Board is made up of many Blocks. Blocks are cleared, and they fall.
 */
var Block = function(block_colors) {
	
	// Obviously, you need colors to be able to match the blocks.
	this.color = random_from_array(block_colors);
	
	// Blocks are either resting, clearing, or falling. A float will preceed a fall.
	this.state = Block.StateEnum.REST; // StateEnum is provided below.
	
	// state_timer keeps track of time remaining until next state.
	// For example, FLOAT -> FALL, or CLEAR -> EMPTY.
	this.state_timer = 0;
	
	// chain_material activates when a block is dropped by a clear.
	this.chain_material = false;
	
}

Block.prototype.empty = function() {
	// Returns true if empty (i.e. if it's the empty-singleton.)
	return false;
}

Block.prototype.isMatchable = function() {
	return (this.state == Block.StateEnum.REST || this.state == Block.StateEnum.FLOAT);
}

Block.prototype.isSupportive = function() {
	// Can this block hold up other blocks?
	return !(this.empty() || this.get_state() == Block.StateEnum.FALL);
}

Block.prototype.isSwappable = function() {
	switch (this.get_state()) {
		case Block.StateEnum.CLEAR:
		case Block.StateEnum.FLOAT:
			return false;
			break;
		case Block.StateEnum.FALL:
			return true;
			break;
		default:
			return true;
			break;
	}
}

Block.prototype.get_state = function() {
	return this.state;
}

Block.prototype.set_state = function(new_state, args) {
	old_state = this.state;
	switch (new_state) {
		case Block.StateEnum.FLOAT:
			if (typeof(args) === "undefined") {
				this.state_timer = FLOAT_PERIOD;
			} else {
				this.state_timer = args ? CHAIN_FLOAT_PERIOD : FLOAT_PERIOD;
			}
			break;
		case Block.StateEnum.CLEAR:
			this.state_timer = CLEAR_PERIOD;
			break;
		case Block.StateEnum.FALL:
			if (old_state == Block.StateEnum.FLOAT) {
				this.state_timer = 1.0 / DROP_SPEED / 2;
			} else {
				this.state_timer = 1.0 / DROP_SPEED;
			}
			break;
		default:
			this.state_timer = 0;
			break;
	}
	this.state = new_state;
}

Block.prototype.update_timer = function(dt) {
	this.state_timer = this.state_timer - dt;
	if (this.state_timer < 0) {
		this.state_timer = 0.0;
	}
}

Block.prototype.relative_position = function() {
	if (this.state == Block.StateEnum.FALL) {
		return this.state_timer / (1.0 / DROP_SPEED) - 0.5;
	} else {
		return 0.0;
	} 
}

Block.random = function() {
	return new Block(BLOCK_COLORS);
}

/**
 * Here is a very ghetto JS enum adaptor.
 */
Block.StateEnum = {
	REST : "REST",
	FLOAT : "FLOAT",
	CLEAR : "CLEAR",
	FALL : "FALL",
	EMPTY : "EMPTY"
}

var EMPTY_BLOCK = new Block([EMPTY_BLOCK_COLOR]);
EMPTY_BLOCK.matches = function(otherBlock) { return false; }
EMPTY_BLOCK.empty = function() { return true; }
EMPTY_BLOCK.set_state = function() { this.state = "EMPTY" } // TODO: INVESTIGATE
EMPTY_BLOCK.set_state("EMPTY");

Block.isMatch = function(block_a, block_b) {
	// Used for matching purposes. Both blocks have to be "matchable"
	colors_match = block_a.color == block_b.color;
	return (block_a.isMatchable() && block_b.isMatchable() && colors_match);
}
