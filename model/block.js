/**
 * The Block class represents the pieces contained in the board. They move
 * downwards when nothing is under them, and are cleared when three or more of
 * them of the same color are lined up.
 *
 * It's also important to keep track of whether they were cleared due to a chain
 * reaction. This forms one of the core tenets of gameplay.
 *
 * @author: kc34
 */
var Block = function(block_colors) {
	/**
	 * Holds the 'type' of block. Used in determining matches.
	 */
	this.color = random_from_array(block_colors);
	/**
	 * Holds the state of the block.
	 */
	this.state = Block.StateEnum.REST;
	/**
	 * Counts down, and is set to keep track of how long a state
	 * lasts.
	 */
	this.state_timer = 0;
	/**
	 * Counts down,
	 */
	this.chain_material = false;
	/**
	 * Tracks if the float is swappable.
	 */
	this.good_float = false;
}

/**
 * Returns true if the block is the empty singleton.
 */
Block.prototype.empty = function() {
	return false;
}

/**
 * Returns true if the block can be cleared.
 */
Block.prototype.isMatchable = function() {
	return (this.state == Block.StateEnum.REST || this.state == Block.StateEnum.FLOAT);
}

/**
 * Returns true if this block can support other blocks.
 */
Block.prototype.isSupportive = function() {
	return !(this.empty() || this.get_state() == Block.StateEnum.FALL);
}

/**
 * Returns true if this block can be moved.
 */
Block.prototype.isSwappable = function() {
	switch (this.get_state()) {
		case Block.StateEnum.CLEAR:
			return false;
			break;
		case Block.StateEnum.FLOAT:
			return this.good_float;
			break;
		case Block.StateEnum.FALL:
			return true;
			break;
		default:
			return true;
			break;
	}
}

/**
 * Returns the state of the block.
 */
Block.prototype.get_state = function() {
	return this.state;
}

/**
 * Updates the state of the block.
 */
Block.prototype.set_state = function(new_state, args) {
	old_state = this.state;
	switch (new_state) {
		case Block.StateEnum.FLOAT:
			if (typeof(args) === "undefined") {
				this.state_timer = FLOAT_PERIOD;
				this.good_float = false;
			} else {
				if (args) {
					this.state_timer = CHAIN_FLOAT_PERIOD;
					this.good_float = true;
				} else {
					this.state_timer = FLOAT_PERIOD;
					this.good_float = false;
				}
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

/**
 * Decrements the timer. If the timer is below zero, it will be set to zero.
 */
Block.prototype.update_timer = function(dt) {
	this.state_timer = this.state_timer - dt;
	if (this.state_timer < 0) {
		this.state_timer = 0.0;
	}
}

/**
 * Gets the position of the block relative to its board position.
 * Ideally, this will be phased out when the board is changed to have more
 * height values.
 */
Block.prototype.relative_position = function() {
	if (this.state == Block.StateEnum.FALL) {
		return this.state_timer / (1.0 / DROP_SPEED) - 0.5;
	} else {
		return 0.0;
	}
}

/**
 * Static method that generates a randomly colored block.
 */
Block.random = function() {
	return new Block(BLOCK_COLORS);
}

/**
 * Here is a JavaScript version of an enumeration.
 */
Block.StateEnum = {
	REST : "REST",
	FLOAT : "FLOAT",
	CLEAR : "CLEAR",
	FALL : "FALL",
	EMPTY : "EMPTY"
}

/**
 * Creates an empty block singleton.
 */
var EMPTY_BLOCK = new Block([EMPTY_BLOCK_COLOR]);
EMPTY_BLOCK.matches = function(otherBlock) { return false; }
EMPTY_BLOCK.empty = function() { return true; }
EMPTY_BLOCK.set_state = function() { this.state = "EMPTY" }
EMPTY_BLOCK.set_state("EMPTY");

/**
 * Statically checks if two blocks are matching.
 */
Block.isMatch = function(block_a, block_b) {
	// Used for matching purposes. Both blocks have to be "matchable"
	colors_match = block_a.color == block_b.color;
	return (block_a.isMatchable() && block_b.isMatchable() && colors_match);
}
