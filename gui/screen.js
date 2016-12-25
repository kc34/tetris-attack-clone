/**
 * Abstract Screen class.
 *
 * @author: artlessAvian
 */
var Screen = function() {

	if (this.constructor === Screen) {
		throw new error("Cannot initialize abstract class!");
	}
}

Screen.prototype.update = function(dt) {
	throw new error("Cannot initialize abstract class!");
}

Screen.prototype.draw = function(accumulator) {
	throw new error("Cannot initialize abstract class!");
}

Screen.prototype.keydown_handler = function(key, meaning) {
	throw new error("Cannot initialize abstract class!");
}

Screen.prototype.keyup_handler = function(key, meaning) {
	throw new error("Cannot initialize abstract class!");
}
