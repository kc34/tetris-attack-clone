var Menu = function() {

	Screen.apply(this, []);

	this.difficulty = 0;
	this.last_pressed; // This doesn't actually do anything
}

// Inherit from Screen 
Menu.prototype = Object.create(Screen.prototype);
Menu.prototype.constructor = Menu;

Menu.prototype.update = function(dt) {

}

Menu.prototype.draw = function(accumulator) {

	// start with a screen clear
	ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
	ctx.fillRect( 0 , 0 , window.innerWidth , window.innerHeight );

	ctx.fillStyle = TEXT_COLOR;
	ctx.font = 30 + "px sans-serif";
	ctx.textAlign = "center";
	ctx.fillText("Hey. Press J to Start!", window.innerWidth/2, window.innerHeight/2);

	if (this.last_pressed != undefined) {
		ctx.fillText("No, that's " + this.last_pressed, window.innerWidth/2, 3 * window.innerHeight/4);
	}

}

Menu.prototype.keydown_handler = function(key, meaning) {

	if (key == 'J') { my_screen = new Game(1); }
	else {
		this.last_pressed = key;
	}
}

Menu.prototype.keyup_handler = function(key, meaning) {


}
