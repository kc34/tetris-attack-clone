console.log ("Looking for really inept bots to play against?");
console.log ("Try my_game.add_ai()");
console.log ("You also might want to turn your volume down.")

var Ai = function(name, input) {

	this.name = name;
	this.input = input;

	this.counter = 0;

	this.inputs_p_second = Math.random() * 29 + 1;

	this.board = null;

	this.input_queue = [];
}

Ai.prototype.update = function(dt) {

	// Get the board for faster access?
	// IDK its javascript
	if (this.board == null) {
		this.board = this.input.get_board(this.name);
		if (this.board == null)
		{
			return null;
		}
	}

	// TODO: This may cause dt to have a positive feedback loop!
	this.counter += dt;

	while (this.counter >= 1/this.inputs_p_second) {
		this.counter -= 1/this.inputs_p_second;

		var do_raise = true;

		for (var i = 0; i < BOARD_LENGTH; i++) {
			if (!this.board.block[BOARD_HEIGHT-2][i].empty())
			{
				do_raise = false;
				break;
			}
		}

		// Random raising for more visual appeal
		if (do_raise && Math.random() < 0.1) {
			this.input.raise(this.name)
			continue;
		}

		// Oh boy

		// This is a stack?
		if (this.input_queue.length == 0) {

			this.input.switch(this.name);

			var target_x = Math.random() * (BOARD_LENGTH-2);
			var target_y = Math.random() * (BOARD_HEIGHT-1);
			for (var x = this.board.cursor.x; x < target_x; x++) {
				this.input_queue.push("right");
			}
			for (var x = this.board.cursor.x; x > target_x; x--) {
				this.input_queue.push("left");
			}
			for (var y = this.board.cursor.y; y < target_y; y++) {
				this.input_queue.push("up");
			}
			for (var y = this.board.cursor.y; y > target_y; y--) {
				this.input_queue.push("down");
			}
			continue;
		}

		var instruction = this.input_queue.pop();
		switch (instruction) {
			case "up":
				this.input.up(this.name);
    			break;
    		case "left":
				this.input.left(this.name);
    			break;
    		case "down":
				this.input.down(this.name);
    			break;
    		case "right":
				this.input.right(this.name);
    			break;
		}


	}
}