enchant();

/* 定数群 */
const WIDTH = 620;
const HEIGHT = 420;

const PLUS_MASU = 0;
const MINUS_MASU = 1;
const ITEM_MASU = 2;
const NORMAL_MASU = 3;

const MASU_MAX = 20;

const CHILD = 0;
const ADULT = 1;

var core = null;

/* class群 */
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

/* Playerクラス */
var Player = Class.create(Sprite,{
    initialize : function(map, PlayerID) { // クラス作成時の初期化処理
		this.intelligent = 0;
		this.money = 0; 
		this.item = new Array(3);
		this.place = map;
		this.job = null;
		this.type = 4*PlayerID;
		this.time = 0;	//frame処理
		/* spriteのやつ */
		Sprite.call(this, 32, 32);
		this.image = core.assets['./image/chara1.png'];
		this.x = (this.place.x - 32/2) + (20 * (PlayerID%2));
		this.y = (this.place.y - 32/2) + (20 * Math.floor(PlayerID/2));
		this.frame = this.type+1;
    },
    player_move : function(value) { // playerを移動させる関数
		for(var i = 0; i < value; i++){
		    this.place = this.place.next;
		    this.x = (this.place.x - 32/2) + (20 * ((this.type/4)%2));
		    this.y = (this.place.y - 32/2) + (20 * Math.floor((this.type/4)/2));
		}
    },
    onenterframe:function(){
    	this.time++;
    	if(this.time > 10){
    		this.time = 0;
    		if(this.frame+1 > this.type+2){
    			this.frame = this.type+1;
    		}else{
    			this.frame++;
    		}
    	}
    },
    output : function(){
    	console.log(this.intelligent);
    }

    // 以下必要な数だけメソッドを記述
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
    event : function(event_list, player, message, AorC){
    	if(AorC == CHILD){
    		player.intelligent += event_list[this.frame].child;
    		if(player.intelligent < 0){
    			player.intelligent = 0;
    		}
    	}
    	if(AorC == ADULT){
    		player.money += event_list[this.frame].adult;
    		if(player.money < 0){
    			player.money = 0;
    		}
    	}
		message.font = '20px 游明朝';
    	message.text = event_list[this.frame].explain;
    	message.x = (WIDTH/2) - message._boundWidth/2;
    	message.y = (HEIGHT/2) - 20;

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
var MapCreate = function(masu, centerX, centerY, data)
{
    var p = masu;
    var q = null;
    var mx = 0;
    var my = 0;
    var rx = 200;
    var ry = 130;

    p.create(rx * Math.cos(0) + centerX, ry * Math.sin(0) + centerY, data[0]);
    for(var i=1; i<MASU_MAX; i++){
		mx = rx * Math.cos((Math.PI/180) * i *(360/MASU_MAX)) + centerX;
		my = ry * Math.sin((Math.PI/180) * i * (360/MASU_MAX)) + centerY;
		q = new Square();
		q.create(mx, my, data[i]);
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

/* player表示関数(要作り込み) */
var player_disp = function(player, scene)
{
    for(var i=0; i<player.length; i++){
		scene.addChild(player[i]);
    }
}


/* 職業選択関数(樽) */
function jobSelect(job_list) {
	
}


/* メイン関数 */
window.onload = function(){
    core = new Core(WIDTH, HEIGHT);
    core.preload('./image/masu.png');
    core.preload('./image/chara1.png');
    core.preload('./image/start.png');
    core.preload('./image/saikoro.png');
	core.preload('./image/status.png'); // (樽)
	
    core.onload = function(){
	moveStageToCenter(core);	//画面を中央に表示

		
	/* core.onload()関数内の大域変数 */
	var socket = io.connect();
	var myID = 999;
	var member_num = 0;
	var member_limit = 2;		//最低限遊べる人数

	var event_list = [];

	var money_text = new Label();
	var intel_text = new Label();
		
	/* メニューシーンを生成する関数 */
	var MenuScene = function(){
	    var scene = new Scene();
	    var id_message = new Label();
	    var info_message = [null, null, null, null, null];		//メッセージログ。直近5個まで表示
	    var add_info = "";		//info_messageに追加する文字列
	    var start_button = new Sprite(200, 50);

	    scene.backgroundColor = "rgb(0, 200, 250)";	//sceneの背景色の設定

	    start_button.image = core.assets['./image/start.png'];
	    start_button.x = WIDTH/2 - 100;
	    start_button.y = HEIGHT - 100;
	    /* スタートボタンにタッチイベントを付加 */
	    start_button.ontouchstart = function(){
			if(member_num < member_limit)	return;
			socket.emit('ready');
	    };

	    socket.on('start game', function(){
			core.replaceScene(GameScene());
	    });

	    for(var i=0; i<info_message.length; i++){
			info_message[i] = new Label(' ');
			info_message[i].font = '15px Arial';
			info_message[i].x = 50;
			info_message[i].y = (HEIGHT/2) + (info_message[i]._boundHeight*i);
	    }

	    socket.on('initialize', function(data){
			member_num = data;
			myID = data;
			id_message.text = "あなたはPlayer" + myID + "です";	
			id_message.font = '20px Arial';
			id_message.x = 50;
			id_message.y = 100;
			scene.addChild(id_message);
	    });
	    
	    socket.on('setID', function(data){
			myID = data;
			id_message.text = "あなたはPlayer" + myID + "です";	
			id_message.font = '20px Arial';
			id_message.x = 50;
			id_message.y = 100;
			scene.addChild(id_message);
	    });

	    /* 他のプレイヤーが参加したのを感知 */
	    socket.on('player enter', function(data){
			add_info = "Player" + data + "が参加しました";		//ログを追加
			member_num++;
	    });

	    /* 他のプレイヤーの切断を感知 */
	    socket.on('disconnect player', function(data){
			if(data < myID){
			    myID--;		//切断したプレイヤーのidが自分より小さかった時セットしなおす
			    socket.emit('change id', myID);
			}
			add_info = "Player" + data + "が退出しました";		//ログを追加
			member_num--;
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
			
			
			if(myID == 1){			//Player1であればスタートボタンが表示される
			    if(member_num >= member_limit){			
					start_button.opacity = 1.0;	//規定人数以上であればボタンがアクティブになる
			    }else{
					start_button.opacity = 0.5;
			    }
			    scene.addChild(start_button);
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
	    var map = new Square();
		var p_status = new Sprite(180, 85); // (樽)
	    var saikoro = new Sprite(200, 64);
	    var Players = [null, null, null, null];
	    var time = 0;
	    var turn = 1;
	    var now_message = new Label(' ');
	    var event_message = new Label(' ');
	    var generation = CHILD;

	    var isMyturn = 0;	//自分のターンかどうか
	    var isMove = 0;		//移動中かどうか
	    var movePlayer = 0;	//移動中のプレイヤー
	    var move = 0;		//進むべきマスの数

	    now_message.font = '20px 游明朝';
	    now_message.x = 10;
	    now_message.y = 10;
	    scene.addChild(now_message);

	    event_message.font = '30px 游明朝';
	    event_message.x = (WIDTH/2) + event_message._boundWidth;
	    event_message.y = (HEIGHT/2) - 20;
	    scene.addChild(event_message);

	    saikoro.image = core.assets['./image/saikoro.png'];
	    saikoro.x = WIDTH/2 - 100;
	    saikoro.y = HEIGHT - 58;
	    scene.addChild(saikoro);

		/* ここでステータス表示(樽) */
		p_status.image = core.assets['./image/status.png'];
	    p_status.x = WIDTH - 190;
	    p_status.y = HEIGHT - 85;
		scene.addChild(p_status);
		
	    scene.backgroundColor = "rgb(50, 200, 200)";
	    socket.emit('game initialize');		//シーンを読み込んだらサーバ側にgame initializeを送信
	    socket.on('init', function(data, number, array){		//map data を読み込んだらマップを作成し表示する
			MapCreate(map, WIDTH/2-10, HEIGHT/2-40, data);
			MapOutput(map, scene);
			event_list = array;
			console.log(event_list[0].explain);
			for(var i=0; i<number; i++){
			    Players[i] = new Player(map, i);
			}

			money_text.moveTo(WIDTH - 160 , HEIGHT - 75 );
			money_text.color = 'rgba(255, 0, 0, 1)';
			money_text.font = "20px Century";
			intel_text.moveTo( WIDTH - 75, HEIGHT - 75 );
			intel_text.color = 'rgba(255, 0, 0, 1)';
			intel_text.font = "20px Century";

			scene.addChild(money_text);
			scene.addChild(intel_text);
			player_disp(Players, scene);
	    });
	    
	    socket.emit('game turn', turn);

	    socket.on('your turn', function(){
	    	now_message.text = "あなたの番です";
	    	isMyturn = 1;
	    });

	    socket.on('other turn', function(num){
	    	now_message.text = "Player" + num + "の番です";
	    	isMyturn = 0;
	    });

	    socket.on('move start', function(p_num, mv_num){
	    	//Players[p_num-1].player_move(mv_num);
	    	move = mv_num;
	    	movePlayer = p_num;
	    	isMove = 1;
	    	turn++;
	    });

	    //サイコロのタッチイベント
	    saikoro.ontouchstart = function(){
	    	if(isMyturn == 1){
	    		if(isMove == 0){
		    		move = Math.floor(Math.random()*5) + 1;
		    		event_message.font = '30px 游明朝';
		    		event_message.text = move;
		    		event_message.x = (WIDTH/2) + event_message._boundWidth;
	    			event_message.y = (HEIGHT/2) - 20;
		    		socket.emit('player move', move);
	    		}
	    	}
	    };

	    /* フレーム処理 */
		scene.addEventListener(Event.ENTER_FRAME, function(){
			time++;
			if(time > 10){
				time = 0;
				if(isMove == 1){
					if(move > 0){
						move--;
						event_message.font = '30px 游明朝';
		    			event_message.text = move;
		    			event_message.x = (WIDTH/2) + event_message._boundWidth;
	    				event_message.y = (HEIGHT/2) - 20;
						Players[movePlayer-1].player_move(1);
					}
					else{
						isMove = 0;
						event_message.text = "";
						Players[movePlayer-1].place.event(event_list, Players[movePlayer-1], event_message, generation);
						console.log(event_message.text);
						Players[movePlayer-1].output();
    					socket.emit('game turn', turn);
					}
				}
			}
			/* 自分のステータス表示、座標は微調整（樽）*/
			money_text.text = (Players[myID-1].money + '');			
			intel_text.text = (Players[myID-1].intelligent + '');
			
		});
	    /*socket.on('disconnect player', function(data){
		Players[data-1] = null;
		scene.parentNode.removeChild(Players[data-1]);
		player_disp(Players, scene);
	    });
	   */
	    
	    return scene;
	};

	
	core.replaceScene(MenuScene());

	
    };
    core.start();
};
