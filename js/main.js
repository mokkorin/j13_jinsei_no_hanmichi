enchant();

var log = function()
{
	console.log(arguments);
}

window.onload = function(){
	var core = new Core(520, 320);
	core.preload('./image/chara1.png');

	core.onload = function(){
		var scene = core.rootScene;
		scene.backgroundColor = "green";
		var bear = new Sprite(32, 32);
		var socket = io.connect();

		socket.on('hello', function(msg) {
			console.log('hello from ' + msg);
		})

		bear.image = core.assets['./image/chara1.png'];
		bear.x = 0;
		bear.y = 0;
		
		this.rootScene.addEventListener("touchstart", function(e){
			bear.x = e.localX-(32/2);
			bear.y = e.localY-(32/2);
		})
		
		core.rootScene.addChild(bear);
	};
	core.start();
};