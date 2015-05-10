define(function(require, exports, module){
  'use strict';
  
  var movingFlag, originSx, originSy, sizeX, sizeY, amount, cellW, cellH, pointerX, pointerY, orbW, orbH;
  var initRAF = function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
        
 
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  }
  var onPointerDown = function(ev) {
    // TODO: 需要考虑canvas元素的clientX,Y位移
    var sx = Math.floor(ev.clientX / this.cellWidth),
        sy = Math.floor(ev.clientY / this.cellHeight),
        orb = this._getOrbContainerAt(sx,sy);

    pointerX = ev.clientX;
    pointerY = ev.clientY;
    
    // 如果该位置是有效珠, 则开始选择珠子过程
    
    ev.preventDefault();
    if (orb) {
      movingFlag = 1;
      originSx = sx;
      originSy = sy;
      this._renderSelectingOrb(orb, pointerX - orbW/1.5 , pointerY - orbH/1.5);
      _handlePointerMove.call(this);
    }
  };
  var onPointerMove = function(ev) {
    pointerX = ev.clientX;
    pointerY = ev.clientY;
  }
  var onPointerUp = function(ev) {
    // TODO: 处理指针异常离开时不触发pointerup的问题
    if (movingFlag) {
      movingFlag = 0;
      
      this._cancelSelectingOrb(this.originOrb);
      this.observer.trigger('view.moveEnd');
    }
  }
  var _handlePointerMove = function() {
    var sx = Math.floor(pointerX / cellW),
        sy = Math.floor(pointerY / cellH);

    if (movingFlag) {
      this._renderMovingGhostOrb(pointerX - orbW/1.5, pointerY - orbH/1.5);
      
      // 判断鼠标是否在初始选中珠范围之外, 并且在盘面之内
      if ((sx != originSx || sy != originSy) && sx < sizeX && sx >= 0 && sy < sizeY*2 && sy >= sizeY) {
        this._renderExchangingOrb(originSx + originSy * sizeX, sx + sy * sizeX);
        this.observer.trigger('view.orbExchange', originSx + originSy * sizeX - amount, sx + sy * sizeX - amount)
        originSx = sx;
        originSy = sy;
      }
      window.requestAnimationFrame(_handlePointerMove.bind(this));
    }
  }
  var methods = {
    _bindUserEvents: function() {
      onPointerDown = onPointerDown.bind(this);
      onPointerUp = onPointerUp.bind(this);
      onPointerMove = onPointerMove.bind(this);
      this.canvasDiv.addEventListener('pointerdown', onPointerDown, false);
      this.canvasDiv.addEventListener('pointerup', onPointerUp, false);
      this.canvasDiv.addEventListener('pointermove', onPointerMove, false);
    },
    _unbindUserEvents: function() {
      this.canvasDiv.removeEventListener('pointerdown', onPointerDown, false);
      this.canvasDiv.removeEventListener('pointerup', onPointerUp, false);
      this.canvasDiv.removeEventListener('pointermove', onPointerMove, false);
    }
  }

  module.exports = {
    init: function(obj) {
      orbW = obj.orbWidth;
      orbH = obj.orbHeight;
      sizeX = obj.boardSizeX;
      sizeY = obj.boardSizeY;
      amount = obj.amount;
      cellW = obj.cellWidth;
      cellH = obj.cellHeight;
      initRAF();

      for (var i in methods) {
        if (methods.hasOwnProperty(i)) {
          obj[i] = methods[i];
        }
      }
    }
  }
});