/**
 * Converts a key to something more meaningful to other classes
 */
var Controller = function()
{
	this.meaning = new Object();

	this.assignDefaultMeanings();
}

// TODO: make enum maybe?

Controller.prototype.assignDefaultMeanings = function()
{
	this.assignMeaningSpecial(8, "global.start");

	this.assignMeaning("W", "player.0_up");
	this.assignMeaning("A", "player.0_left");
	this.assignMeaning("S", "player.0_down");
	this.assignMeaning("D", "player.0_right");
	this.assignMeaning("J", "player.0_a");
	this.assignMeaning("N", "player.0_b");
	this.assignMeaning("K", "player.0_c");

	// these characters are kinda weird but thats how it is
	// arrow keys & 156 numpad
	this.assignMeaning("&", "player.1_up");
	this.assignMeaning("%", "player.1_left");
	this.assignMeaning("(", "player.1_down");
	this.assignMeaning("'", "player.1_right");
	this.assignMeaning("e", "player.1_a");
	this.assignMeaning("a", "player.1_b");
	this.assignMeaning("f", "player.1_c");
}

/**
 * Converts a key to something more meaningful to other classes
 * Avoids hardcoding keys
 * 
 * @param  {String} key     Key as character
 * @param  {String} meaning Some regexable string
 */
Controller.prototype.assignMeaning = function(key, meaning)
{
	this.meaning[key] = meaning;
}

/**
 * Same as assignMeaning but with keycodes.
 * @param  {Number} keyCode Key as keycode
 * @param  {String} meaning Some regexable string
 */
Controller.prototype.assignMeaningSpecial = function(keyCode, meaning)
{
	this.assignMeaning(String.fromCharCode(keyCode), meaning);
}

Controller.prototype.getMeaning = function(key)
{
	if (!(key in this.meaning)) {return "none.none";}
	
	return this.meaning[key];
}