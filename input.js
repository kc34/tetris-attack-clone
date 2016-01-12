var Input = function() {

	this.name_to_board = [];
	this.board_to_name = [];
}

// Prevents two things from mapping to the same board

Input.prototype.register = function(name, board) {

	if (this.get_board(name)) {
		console.log("Name " + name + " already taken!");
		return null;
	}

	if (this.get_name(board)) {
		console.log("Board already taken by " + this.get_name(board));
		return null;
	}

	this.name_to_board[name] = board;
	this.board_to_name[board] = name;
}

Input.prototype.deregister_name = function(name) {

	// Apparently delete is bad
	delete this.board_to_name[this.name_to_board[name]]
	delete this.name_to_board[name]
}

Input.prototype.deregister_board = function(board) {

	delete this.name_to_board[this.board_to_name[board]]
	delete this.board_to_name[board]
}

Input.prototype.get_board = function(name) {

	if (!(name in this.name_to_board)) {
		return null;
	}
	return this.name_to_board[name];
}

Input.prototype.get_name = function(board) {

	if (!(board in this.board_to_name)) {
		return null;
	}
	return this.board_to_name[board];
}

// A bunch of hooks!

Input.prototype.up = function(name) {

	if (this.get_board(name) != undefined) {
		if (this.name_to_board[name].cursor.y < BOARD_HEIGHT - 1) {
			this.name_to_board[name].cursor.y += 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.down = function(name) {

	if (this.get_board(name) != undefined) {
		if (this.name_to_board[name].cursor.y > 0) {
			this.name_to_board[name].cursor.y -= 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.left = function(name) {

	if (this.get_board(name) != undefined) {
		if (this.name_to_board[name].cursor.x > 0) {
			this.name_to_board[name].cursor.x -= 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.right = function(name) {

	if (this.get_board(name) != undefined) {
		if (this.name_to_board[name].cursor.x < BOARD_LENGTH - 2) {
			this.name_to_board[name].cursor.x += 1;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.switch = function(name)	{

	if (this.get_board(name) != undefined) {
		this.name_to_board[name].swap();
	}
}

Input.prototype.raise = function(name)	{

	if (this.get_board(name) != undefined) {
		SoundPlayer.play_move();
		this.name_to_board[name].raise();
	}
}