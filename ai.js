console.log ("Looking for really inept bots to play against?");
console.log ("Try my_game.add_ai()");
console.log ("You also might want to turn your volume down.")

var Ai = function(name, input) {

	this.name = name;
	this.input = input;

	this.counter = 0;

	this.inputs_p_second = Math.random() * Math.random() * 195 + 5;

	this.board = null;
}

Ai.prototype.update = function(dt) {

	if (this.board == null) {
		this.board = this.input.get_board(this.name);
		if (this.board == null)
		{
			return null;
		}
	}

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

		if (do_raise) {
			this.input.raise(this.name)
			continue;
		}

		var temp = Math.random();
		if (temp < 0.3) {
			// 30%
			this.input.switch(this.name);
		}
		else if (temp < 0.6) {
			// 30%
			this.input.left(this.name);
		}
		else if (temp < 0.9) {
			// 30%
			this.input.right(this.name);
		}
		else if (temp < 0.955) {
			// 5.5%
			this.input.down(this.name);
		}
		else {
			// 4.5%
			this.input.up(this.name);
		}
	}
}