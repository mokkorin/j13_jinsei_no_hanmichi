enchant();

/* 定数群 */
const WIDTH = 620;
const HEIGHT = 420;

const PLUS_MASU = 0;
const MINUS_MASU = 1;
const ITEM_MASU = 2;
const NORMAL_MASU = 3;

const MASU_MAX = 12;



var core = null;

var Test = Class.create({
	initialize : function(){
		this.x = 0;
		this.next = null;
	},
	writelog : function(){
		console.log(this.x);
	},
	test : function(){
		this.x = this.next.x;
	}
});

var Square = Class.create(Sprite, {
	initialize : function(){
		Sprite.call(this, 32, 32);
		this.image = core.assets['./image/masu.png'];
		this.x = 0;
		this.y = 0;
		this.frame = 0;
		this.next = null;
	},
	create : function(x, y, type){
		this.x = x;
		this.y = y;
		this.frame = type;
	},
	output : function(){
		console.log('x = ' + this.x);
		console.log('y = ' + this.y);
	}
});

/* 画面中央表示の関数 */
var moveStageToCenter = function(core) {
	 var stagePos = {
	  	top: (window.innerHeight - (core.height * core.scale)) / 2,
	 	left: (window.innerWidth - (core.width * core.scale)) / 2,
	 };
	 var stage = document.getElementById('enchant-stage');
	 stage.style.position = 'absolute';
	 stage.style.top = stagePos.top + 'px';
	 stage.style.left = stagePos.left + 'px';
	 core._pageX = stagePos.left;
	 core._pageY = stagePos.top;
};

/* マップ生成関数 */
var MapCreate = function(masu, centerX, centerY)
{
	var p = masu;
	var q = null;
	var mx = 0;
	var my = 0;
	var rx = 200;
	var ry = 100;

	p.create(rx * Math.cos(0) + centerX, ry * Math.sin(0) + centerY, 1);
	for(var i=1; i<MASU_MAX; i++){
		mx = rx * Math.cos((Math.PI/180) * i *(360/MASU_MAX)) + centerX;
		my = ry * Math.sin((Math.PI/180) * i * (360/MASU_MAX)) + centerY;
		q = new Square();
		q.create(mx, my, 1);
		p.next = q;
		p = p.next;
	}
	p.next = masu;

}

/* マップ表示関数 */
var MapOutput = function(map, scene)
{
	var b = map;
	for(var i=0; i<MASU_MAX; i++){
		//b.output();
		scene.addChild(b);
		b = b.next;
	}
}


/* メイン関数 */
window.onload = function(){
	core = new Core(WIDTH, HEIGHT);
	core.preload('./image/masu.png');
	core.preload('./image/chara1.png');

	core.onload = function(){
		moveStageToCenter(core);	//画面を中央に表示

		/* core.onload()関数内の大域変数 */
		var socket = io.connect();
		var myID = 0;


		/* メニューシーンを生成する関数 */
		var MenuScene = function(){
			var scene = new Scene();
			var id_message = new Label();
			var info_message = [null, null, null, null, null];		//メッセージログ。直近5個まで表示
			var add_info = "";		//info_messageに追加する文字列

			scene.backgroundColor = "rgb(0, 200, 250)";	//sceneの背景色の設定

			for(var i=0; i<info_message.length; i++){
				info_message[i] = new Label(' ');
				info_message[i].font = '20px Arial';
				info_message[i].x = 50;
				info_message[i].y = (HEIGHT/2) + (info_message[i]._boundHeight*i);
			}

			
			socket.on('setID', function(data){
				myID = data;
				id_message.text = "あなたはPlayer" + myID + "です";	
				id_message.font = '15px Arial';
				id_message.x = WIDTH - (50 + id_message._boundWidth);
				id_message.y = HEIGHT - 50;
				scene.addChild(id_message);
			});

			/* 他のプレイヤーが参加したのを感知 */
			socket.on('player enter', function(data){
				add_info = "Player" + data + "が参加しました";		//ログを追加
			});

			/* 他のプレイヤーの切断を感知 */
			socket.on('disconnect player', function(data){
				if(data < myID){
					myID--;		//切断したプレイヤーのidが自分より小さかった時セットしなおす
					socket.emit('change id', myID);
				}
				add_info = "Player" + data + "が退出しました";		//ログを追加
			});

			/* フレームごとに行う */
			scene.addEventListener(Event.ENTER_FRAME, function(){
				if(add_info != ""){
					for(var i=1; i<info_message.length; i++){
						info_message[i-1].text = info_message[i].text;
					}
					info_message[info_message.length-1].text = add_info;
					add_info = "";
					for(var i=0; i<info_message.length; i++){
						scene.addChild(info_message[i]);
					}
				}

			});

			/*	
			socket.on('start game', function(){
				core.replaceScene(GameScene());
			});
			*/

			return scene;
		};


		var GameScene = function(){
			var scene = new Scene();
			var a = new Test();
			var b = new Test();
			var map = new Square();

			scene.backgroundColor = "rgb(50, 200, 200)";

			MapCreate(map, WIDTH/2, HEIGHT/2 - 50);
			MapOutput(map, scene);

			a.x = 10;
			b.next = a;
			b.test();
			a.writelog();
			b.writelog();

	
			console.log('unko');

			return scene;
		};

		core.replaceScene(GameScene());

		
	};
	core.start();
};
