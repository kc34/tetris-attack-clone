var Input = function() {

	this.boardhash = [];
}

Input.prototype.register = function(name, board) {

	this.boardhash[name] = board;
}

Input.prototype.deregister_name = function(name) {

	this.boardhash[name] = null;
}

Input.prototype.is_register = function(name) {

	if (!(name in my_game.input.boardhash)) {
		console.log(name + " is not registered. [!!]");
		return false;
	}
	return true;
}

// TODO: FIND OUT WHY "this" IN BELOW OBJECTS IS AN EMPTY ARRAY

Input.prototype.up = function(name) {

	if (my_game.input.is_register(name)) {
		if (my_game.input.boardhash[name].cursor.y < BOARD_HEIGHT - 1) {
			my_game.input.boardhash[name].cursor.y += 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.down = function(name) {

	if (my_game.input.is_register(name)) {
		if (my_game.input.boardhash[name].cursor.y > 0) {
			my_game.input.boardhash[name].cursor.y -= 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.left = function(name) {

	if (my_game.input.is_register(name)) {
		if (my_game.input.boardhash[name].cursor.x > 0) {
			my_game.input.boardhash[name].cursor.x -= 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.right = function(name) {

	if (my_game.input.is_register(name)) {
		if (my_game.input.boardhash[name].cursor.x < BOARD_LENGTH - 2) {
			my_game.input.boardhash[name].cursor.x += 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.switch = function(name)	{

	if (my_game.input.is_register(name)) {
		my_game.input.boardhash[name].swap();
	}
}

Input.prototype.raise = function(name)	{

	if (my_game.input.is_register(name)) {
		my_game.input.boardhash[name].raise();
	}
}