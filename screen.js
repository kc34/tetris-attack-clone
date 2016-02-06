// TODO: Learn to make things not fail silently

var Screen = function() {

	if (this.constructor === Screen) {
		console.log("Cannot initialize abstract class!");
	}
}

Screen.prototype.draw = function(accumulator) {
	console.log("Abstract screen");
}

Screen.prototype.keydown_handler = function(key) {
	console.log("Abstract screen");
}

Screen.prototype.keyup_handler = function(key) {
	console.log("Abstract screen");
}