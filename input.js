var Input = function() {

	this.boardhash = [];
	this.namehash = [];
}

// Prevents two things from mapping to the same board

Input.prototype.register = function(name, board) {

	this.boardhash[name] = board;
	this.namehash[board] = name;
}

Input.prototype.deregister_name = function(name) {

	this.namehash[this.boardhash[name]] = null;
	this.boardhash[name] = null;
}

Input.prototype.deregister_board = function(board) {

	this.boardhash[this.namehash[board]] = null;
	this.namehash[board] = null;
}

Input.prototype.is_register = function(name) {

	if (!(name in this.boardhash)) {
		console.log(name + " is not registered. [!!]");
		return false;
	}
	return true;
}

// A bunch of hooks!

Input.prototype.up = function(name) {

	if (this.is_register(name)) {
		if (this.boardhash[name].cursor.y < BOARD_HEIGHT - 1) {
			this.boardhash[name].cursor.y += 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.down = function(name) {

	if (this.is_register(name)) {
		if (this.boardhash[name].cursor.y > 0) {
			this.boardhash[name].cursor.y -= 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.left = function(name) {

	if (this.is_register(name)) {
		if (this.boardhash[name].cursor.x > 0) {
			this.boardhash[name].cursor.x -= 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.right = function(name) {

	if (this.is_register(name)) {
		if (this.boardhash[name].cursor.x < BOARD_LENGTH - 2) {
			this.boardhash[name].cursor.x += 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.switch = function(name)	{

	if (this.is_register(name)) {
		this.boardhash[name].swap();
	}
}

Input.prototype.raise = function(name)	{

	if (this.is_register(name)) {
		this.boardhash[name].raise();
	}
}