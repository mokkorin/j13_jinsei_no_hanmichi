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
    salary_time : function(job_list){
    	this.money += job_list[this.job].Salary;
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
    event : function(event_list, job_list, player, message, AorC){
    	message.font = '20px 游明朝';
    	message.text = event_list[this.frame].explain;
    	message.x = (WIDTH/2) - message._boundWidth/2;
    	message.y = (HEIGHT/2) - 20;
    	if(AorC == CHILD){
    		player.intelligent += event_list[this.frame].child;
    		if(player.intelligent < 0){
    			player.intelligent = 0;
    		}
    	}
    	if(AorC == ADULT){
    		player.money += event_list[this.frame].adult * job_list[player.job].Bairitu;
    		if(this.frame == PLUS_MASU || this.frame == MINUS_MASU){
    			message.text += ("x" + job_list[player.job].Bairitu);
    		}	
    		if(player.money < 0){
    			player.money = 0;
    		}
    	}
		
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


/* 全体表示関数(樽) */
var display_everyone = function(Players, member_num, scene) {
	var bg = new Sprite(WIDTH, HEIGHT);
	var surface = new Surface(WIDTH, HEIGHT);
	var close = new Sprite(80, 80);
	var tytle = new Label();
	var king =[null,null,null,null];
	var ranking = [null,null,null,null];
    var result = [null,null,null,null];
    var tmp,rank=1;
	
    ranking = Players.concat();
    if(member_num < 4) ranking.splice(member_num,4-member_num);

    for(var i=0;i<4;i++){
        king[i]=new Sprite(65,50);
        king[i].image = core.assets['./image/ranking.png'];
        king[i].frame =i;
        king[i].x = WIDTH/3-40;
        king[i].y = 50;
    }
	ranking.sort(function(a,b){
        if(a.money < b.money) return 1;
        if(a.money > b.money) return -1;
        return 0;
    });
	
	surface.context.beginPath();
	surface.context.fillStyle = 'rgba(0, 0, 0, 0.8)';
	surface.context.fillRect (0, 0, WIDTH, HEIGHT);
	bg.image = surface;
	scene.addChild(bg);

	close.image = core.assets['./image/close.png'];
	close.x = WIDTH - 100;
	close.y = HEIGHT - 400;
	scene.addChild(close);
	
	for(var i=0;i<member_num;i++){
        if(i>0){
			if(ranking[i-1].money==ranking[i].money) rank--;
        }
        result[i] =new Label();
        tmp = ranking[i].type/4+1;
        result[i].font = '23px Arial bold';
		result[i].color = 'rgba(255, 0, 0, 1)'
        result[i].text = '  player' + tmp + ' score :' + ranking[i].money;
        result[i].x = WIDTH/3;
        result[i].y = 70+i*60;
        rank++;
        king[i].y=50+60*i;
        scene.addChild(king[i]);
        scene.addChild(result[i]);
    }
	
	close.ontouchstart = function(){
		scene.removeChild(bg);
		scene.removeChild(close);
		for(var i =0; i < member_num; i++){
			scene.removeChild(king[i]);
			scene.removeChild(result[i]);
		}
	};
	

}


/* メイン関数 */
window.onload = function(){
    core = new Core(WIDTH, HEIGHT);
    core.preload('./image/masu.png');
    core.preload('./image/chara1.png');
    core.preload('./image/start.png');
    core.preload('./image/saikoro.png');
	core.preload('./image/status.png');
	core.preload('./image/job_button.png');
	
	core.preload('./image/every.png'); // (樽)
	core.preload('./image/close.png');
	core.preload('./image/ranking.png');
	
	
    core.onload = function(){
		moveStageToCenter(core);	//画面を中央に表示

		
		/* core.onload()関数内の大域変数 */
		var socket = io.connect();
		var myID = 999;
		var member_num = 0;
		var member_limit = 2;		//最低限遊べる人数

		var event_list = [];	//マスのイベントのリスト
		var job_list = [];		//ジョブのリスト

		var money_text = new Label();
		var intel_text = new Label();
		var turn_text = new Label(); // （樽）
		var job_text = new Label(); // (樽)
		
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
			var p_status = new Sprite(180, 85);
			var every_p = new Sprite(90, 80); // (樽)
			var saikoro = new Sprite(200, 64);
			var Players = [null, null, null, null];
			var time = 0;
			var turn = 1;		//ターン数
			var t_cnt = 0;		//ターン数を増やすためのカウント
			var now_message = new Label(' ');
			var event_message = new Label(' ');
			var generation_message = new Label('子供時代');
			var generation = CHILD;
			var job_info = new Label('');

			var isMyturn = 0;	//自分のターンかどうか
			var isMove = 0;		//移動中かどうか
			var movePlayer = 0;	//移動中のプレイヤー
			var move = 0;		//進むべきマスの数

			now_message.font = '20px 游明朝';
			now_message.x = 10;
			now_message.y = 10;
			scene.addChild(now_message);

			generation_message.font = '20px 游明朝';
			generation_message.x = WIDTH - 100;
			generation_message.y = HEIGHT/2 - 150;
			scene.addChild(generation_message);

			event_message.font = '30px 游明朝';
			event_message.x = (WIDTH/2) + event_message._boundWidth;
			event_message.y = (HEIGHT/2) - 20;
			scene.addChild(event_message);

			saikoro.image = core.assets['./image/saikoro.png'];
			saikoro.x = WIDTH/2 - 100;
			saikoro.y = HEIGHT - 58;
			scene.addChild(saikoro);

			/* ここでステータス表示 */
			p_status.image = core.assets['./image/status.png'];
			p_status.x = WIDTH - 190;
			p_status.y = HEIGHT - 85;
			scene.addChild(p_status);

			/* 全体表示ボタン(樽) */
			every_p.image = core.assets['./image/every.png'];
			every_p.x = WIDTH - 100;
			every_p.y = HEIGHT - 166;
			scene.addChild(every_p);
			
			job_info.font = '20px 游明朝';
			job_info.color = "red";
			job_info.x = (p_status.x + 180/2) - job_info._boundWidth/2;
			job_info.y = HEIGHT - 30;
			scene.addChild(job_info);

			scene.backgroundColor = "rgb(50, 200, 200)";
			socket.emit('game initialize');		//シーンを読み込んだらサーバ側にgame initializeを送信
			socket.on('init', function(data, number, eventArray, jobArray){		//map data を読み込んだらマップを作成し表示する
				MapCreate(map, WIDTH/2-10, HEIGHT/2-40, data);
				MapOutput(map, scene);
				event_list = eventArray;
				job_list = jobArray;
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
				/* turn表示セット(樽) */
				turn_text.moveTo(WIDTH - 100 , HEIGHT - 400 );
				turn_text.color = 'rgba(0, 0, 0, 1)';
				turn_text.font = "20px Century";
				scene.addChild(turn_text); // (樽)
				scene.addChild(money_text);
				scene.addChild(intel_text);
				player_disp(Players, scene);
			});
			
			socket.emit('game turn', t_cnt);

			socket.on('your turn', function(t_num, Turn){
	    		t_cnt = t_num;
	    		turn = Turn;
	    		now_message.text = "あなたの番です";
	    		isMyturn = 1;
	    		turn_text.text = ((turn + '') + "ターン目");
			});

			socket.on('other turn', function(num, t_num, Turn){
	    		t_cnt = t_num;
	    		turn = Turn;
	    		now_message.text = "Player" + num + "の番です";
	    		isMyturn = 0;
	    		turn_text.text = ((turn + '') + "ターン目");
			});

			socket.on('move start', function(p_num, mv_num){
	    		//Players[p_num-1].player_move(mv_num);
	    		console.log("turn = " + turn);
	    		console.log("t = " + t_cnt);
	    		move = mv_num;
	    		movePlayer = p_num;
	    		isMove = 1;
	    		t_cnt++;
			});

			socket.on('job select', function(){
	    		t_cnt = 0;
	    		generation = ADULT;
	    		generation_message.text = "大人時代";
	    		core.pushScene(jobSelect(Players));
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

			/* 全体表示ボタン処理 */
			every_p.ontouchstart = function(){
				display_everyone(Players, member_num, scene);
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
							Players[movePlayer-1].place.event(event_list, job_list, Players[movePlayer-1], event_message, generation);
							/* 自分のステータス表示、座標は微調整（樽）*/
							money_text.text = (Players[myID-1].money + '');			
							intel_text.text = (Players[myID-1].intelligent + '');
							//console.log(event_message.text);
							//Players[movePlayer-1].output();
    						socket.emit('game turn', t_cnt);
						}
					}
				}
				if(Players[myID-1].job != null){
					job_info.text = job_list[Players[myID-1].job].Name;
					job_info.x = (p_status.x + 180/2) - job_info._boundWidth/2;
				}
			});
			/*socket.on('disconnect player', function(data){
			  Players[data-1] = null;
			  scene.parentNode.removeChild(Players[data-1]);
			  player_disp(Players, scene);
			  });
			*/
			
			return scene;
		};

		var jobSelect = function(Players){
			var scene = new Scene();
			var label_text = new Label();
			var job_image = new Sprite(400, 40); 
			var button = new Array(job_list.length);
			var isPush = 0;
			
			label_text.text = ("これから君は社会人になる。職業を選択しよう！");
			label_text.color = 'rgba(255, 0, 0, 1)';
			label_text.font = "20px  Centuly";
			label_text.width = 500;
			label_text.moveTo(10 , 15);
			scene.addChild(label_text);
			
			scene.backgroundColor = 'rgba(40, 40, 40, 0.9)';

			var button_func = function(){
				if(this.childNodes[1].opacity == 1 && isPush == 0){
					socket.emit('select job', myID, (this.childNodes[0].y - 70)/60);
					label_text.text = "つうしん　たいき　ちゅう";
					isPush = 1;
				}
				console.log((this.childNodes[0].y - 70)/60);	//位置依存
			}

			socket.on('all clicked', function(jobs){
				for (var i = 0; i < Players.length; i++) {
					if(Players[i] != null){
						Players[i].job = jobs[i];
					}
				}
				core.popScene();

			});

			for(var i = 0; i < job_list.length; i++){
				button[i] = new Group()
				job_image = new Sprite(400, 40);
				job_image.image = core.assets['./image/job_button.png'];
				job_image.x = (WIDTH - 400) /2 ;
				job_image.y = 70 + (60 * i);
				
				job_text = new Label();
				job_text.moveTo(job_image.x + 5 , job_image.y + 5);
				if((Players[myID-1].intelligent) >= i*10){
					job_text.color = 'rgb(0, 0, 0)';
					job_text.opacity = 1.0;

				}else{
					job_text.color = 'rgb(0, 0, 0)';
					job_text.opacity = 0.3;
				}
				job_text.font = "18px Century";
				job_text.text = ("職業:" + job_list[i].Name + " " + 
								 "給料:" + (job_list[i].Salary + '') + " " +
								 "倍率:" + (job_list[i].Bairitu + '')  );

				button[i].addChild(job_image);
				button[i].addChild(job_text);
				scene.addChild(button[i]);
				button[i].addEventListener("touchstart", button_func);
			}

			
			return scene;
			
		}
		
		var PayDayScene = function(Players,job_list){
			var scene = new Scene();
			var label_text = new Label('やった！給料日だ！');
			var salary_text = new Label();
			var click_text = new Label('画面をクリックしてください');
			
			scene.backgroundColor = 'rgba(40, 40, 40, 0.9)';

			label_text.color = 'rgba(255, 0, 0, 1)';
			label_text.font = "20px 游明朝";
			label_text.moveTo(10 , 15);
			scene.addChild(label_text);

			salary_text.text = ("+" + (job_list[Players[myID-1].job].Salary; + '') +" 円");
			salary_text.color = 'rgba(255, 0, 0, 1)';
			salary_text.font = "40px 游明朝";
			salary_text.moveTo(10 , HEIGHT/2);
			scene.addChild(salary_text);

			click_text.color = 'rgba(255, 0, 0, 1)';
			click_text.font = "20px 游明朝";
			click_text.moveTo(10 , HEIGHT - 40);
			scene.addChild(click_text);
			
			scene.ontouchstart = function(){
				socket.emit('salary fin', myID);
				click_text.text = ("つうしん たいき ちゅう")
			};
			
			socket.on('all click', function(){
				core.popScene();
			});
			
			return scene;
		}
		
		core.replaceScene(MenuScene());

		
    };
    core.start();
};
