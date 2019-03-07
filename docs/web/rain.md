# canvas 实现雨滴效果

效果如图：
![rain](../images/rain.gif)

代码：
``` js


<canvas id="canvas" style="position: absolute; top: 0px; left: 0px; opacity: 0.58;"></canvas>


<script>
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;
var clearColor = 'rgba(0, 0, 0, 0.1)';
var max = 60;
var drops = [];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomColor(){
	var r = Math.floor(Math.random()*256);
	var g = Math.floor(Math.random()*256);
	var b = Math.floor(Math.random()*256);
	return "rgb("+r+","+g+","+b+")";//IE7不支出rgb
};
function O() {}
	O.prototype = {
		init: function() {
				this.x = random(0, w);
				this.y = 0;
				this.color = randomColor();
				this.w = 2;
				this.h = 1;
				this.vy = random(4, 5);
				this.vw = 3;
				this.vh = 1;
				this.size = 2;
				this.hit = random(h * .8, h * .9);
				this.a = 0.5;
				this.va = .96;
		},
		draw: function() {
			if (this.y > this.hit) {
				ctx.beginPath();
				ctx.moveTo(this.x, this.y - this.h / 2);
				ctx.bezierCurveTo(
					this.x + this.w / 2, this.y - this.h / 2,
					this.x + this.w / 2, this.y + this.h / 2,
					this.x, this.y + this.h / 2);
	
				ctx.bezierCurveTo(
					this.x - this.w / 2, this.y + this.h / 2,
					this.x - this.w / 2, this.y - this.h / 2,
					this.x, this.y - this.h / 2);
	
				ctx.strokeStyle = 'hsla(180, 100%, 50%, '+this.a+')';
				ctx.stroke();
				ctx.closePath();
				
			} else {
				ctx.fillStyle = this.color;
				ctx.fillRect(this.x, this.y, this.size, this.size * 5);
			}
			this.update();
		},
		update: function() {
			if(this.y < this.hit){
				this.y += this.vy;
			} else {
				if(this.a > .03){
					this.w += this.vw;
					this.h += this.vh;
					if(this.w > 100){
						this.a *= this.va;
						this.vw *= .98;
						this.vh *= .98;
					}
				} else {
					this.init();
				}
			}
			
		}
}

function resize(){
	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;
}

function setup(){
	canvas.style.opacity = "0.58";
	for(var i = 0; i < max; i++){
		(function(j){
			setTimeout(function(){
				var o = new O();
				o.init();
				drops.push(o);
			}, j * 100)
		}(i));
	}
}


function anim() {
	ctx.fillStyle = clearColor;
	ctx.fillRect(0,0,w,h);
	for(var i in drops){
		drops[i].draw();
	}
	requestAnimationFrame(anim);
}


window.addEventListener("resize", resize);

setup();
anim();
</script>
```