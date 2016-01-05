var SoundPlayer = {
	
	CLEAR_SOUNDS : ["sound/Clear1.wav", "sound/Clear2.wav", "sound/Clear3.wav"],
	CHAIN_SOUNDS : ["sound/Chain1.wav", "sound/Chain2.wav", "sound/Chain3.wav"],
	TRIPLE : "sound/Triple.wav",
	MOVE_SOUND : "sound/Move.wav",
	SWAP_SOUND : "sound/Swap.wav",
	
	play_clear : function() {
		var clear_sound = random_from_array(this.CLEAR_SOUNDS);
		var clear = new Audio(clear_sound);
		clear.play();
	},
	
	play_chain : function(intensity) {
		if (DANK_MEMES_ENABLED && intensity == 3) {
			var triple = new Audio(this.TRIPLE);
			triple.play();
			console.log("Oh baby!");
		}
		for (var i = 0; i < intensity; i++) {
			if (i >= 2) {
				var chain_sound = random_from_array(this.CHAIN_SOUNDS);
				var chain = new Audio(chain_sound);
				chain.play();
			} else {
				this.play_clear();
			}
		}
	},
	
	play_move : function() {
		var move = new Audio(this.MOVE_SOUND);
		move.play();
	},
	
	play_swap : function() {
		var swap = new Audio(this.SWAP_SOUND);
		swap.play();
	}
	
}
