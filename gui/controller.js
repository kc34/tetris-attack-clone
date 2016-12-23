/**
 * Gives names to keys for use in other functions
 */
var Controller = function()
{
	this.meaning = new Object();

	this.assignDefaultMeanings();
}

Controller.prototype.assignDefaultMeanings = function()
{
	this.assignMeaningSpecial(8, "global.start");

	this.assignMeaning("W", "player_0.up");
	this.assignMeaning("A", "player_0.left");
	this.assignMeaning("S", "player_0.down");
	this.assignMeaning("D", "player_0.right");
	this.assignMeaning("J", "player_0.a");
	this.assignMeaning("N", "player_0.b");
	this.assignMeaning("K", "player_0.c");

	// these characters are kinda weird but thats how it is
	this.assignMeaning("&", "player_1.up");
	this.assignMeaning("%", "player_1.left");
	this.assignMeaning("(", "player_1.down");
	this.assignMeaning("'", "player_1.right");
	this.assignMeaning("e", "player_1.a");
	this.assignMeaning("a", "player_1.b");
	this.assignMeaning("f", "player_1.c");
}

Controller.prototype.assignMeaning = function(key, meaning)
{
	this.meaning[key] = meaning;
}

Controller.prototype.assignMeaningSpecial = function(keyCode, meaning)
{
	this.meaning[String.fromCharCode(keyCode)] = meaning;
}

Controller.prototype.getMeaning = function(key)
{
	if (!(key in this.meaning)) {return "none.none";}
	
	return this.meaning[key];
}