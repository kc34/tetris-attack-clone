var SoundPlayer = {
	
	CLEAR_SOUNDS : ["sound/Clear1.wav", "sound/Clear2.wav", "sound/Clear3.wav"],
	CHAIN_SOUNDS : ["sound/Chain1.wav", "sound/Chain2.wav", "sound/Chain3.wav"],
	TRIPLE : "sound/Triple.wav",
	MOVE_SOUND : "sound/Move.wav",
	SWAP_SOUND : "sound/Swap.wav",
	
	play_clear : function() {
		this.try_sound(random_from_array(this.CLEAR_SOUNDS));
	},
	
	play_chain : function(intensity) {
		if (DANK_MEMES_ENABLED && intensity == 3) {
			this.try_sound(this.TRIPLE);
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
		this.try_sound(this.MOVE_SOUND);
	},
	
	play_swap : function() {
		this.try_sound(this.SWAP_SOUND);
	},
	
	try_sound : function(sound_file) {
		var my_audio = new Audio(sound_file);
		my_audio.play();
	}
	
}
