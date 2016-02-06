var Input = function() {

	this.name_to_board = [];
	this.board_to_name = [];
}

// Prevents two things from mapping to the same board

Input.prototype.register = function(name, board) {

	if (this.get_board(name)) {
		console.log("Name " + name + " already taken!");
		return false;
	}

	if (this.get_name(board)) {
		console.log("Board already taken by " + this.get_name(board));
		return false;
	}

	this.name_to_board[name] = board;
	this.board_to_name[board] = name;

	return true;
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

	var board = this.get_board(name)

	if (board != undefined) {
		if (board.cursor.y + 1 < board.HEIGHT - 1 || (board.death_grace && board.cursor.y < board.HEIGHT - 1)) {
			board.cursor.y += 1;
			board.total_moves++;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.down = function(name) {

	var board = this.get_board(name)

	if (board != undefined) {
		if (board.cursor.y > 0) {
			board.cursor.y -= 1;
			board.total_moves++;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.left = function(name) {

	var board = this.get_board(name)

	if (board != undefined) {
		if (board.cursor.x > 0) {
			board.cursor.x -= 1;
			board.total_moves++;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.right = function(name) {

	var board = this.get_board(name)

	if (board != undefined) {
		if (board.cursor.x < BOARD_LENGTH - 2) {
			board.cursor.x += 1;
			board.total_moves++;
			SoundPlayer.play_move();
		}
	}
}

Input.prototype.switch = function(name)	{

	var board = this.get_board(name)

	if (board != undefined) {
		board.swap();
		board.total_moves++;
	}
}

Input.prototype.raise = function(name)	{

	var board = this.get_board(name)

	if (board != undefined) {
		board.force_raise = true;
		board.clear_lag = 0;
	}
}