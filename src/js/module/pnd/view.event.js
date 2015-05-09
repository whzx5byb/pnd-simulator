define(function(require, exports, module){
  var movingFlag, originSx, originSy, sizeX, sizeY, amount, cellW, cellH;
  var onPointerDown = function(ev) {
    // TODO: 需要考虑canvas元素的clientX,Y位移
    var x = ev.clientX,
        y = ev.clientY,
        sx = Math.floor(x / this.cellWidth),
        sy = Math.floor(y / this.cellHeight),
        orb = this._getOrbContainerAt(sx,sy);
    
    sizeX = this.boardSizeX;
    sizeY = this.boardSizeY;
    amount = this.amount;
    cellW = this.cellWidth;
    cellH = this.cellHeight;
    // 如果该位置是有效珠, 则开始选择珠子过程
    
    ev.preventDefault();
    if (orb) {
      movingFlag = 1;
      originSx = sx;
      originSy = sy;
      this._renderSelectingOrb(orb, x - this.orbWidth/2 , y - this.orbHeight/2);
    }
  };
  var onPointerMove = function(ev) {
    var x = ev.clientX,
        y = ev.clientY,
        sx = Math.floor(x / cellW),
        sy = Math.floor(y / cellH);

    if (movingFlag) {
      this._renderMovingGhostOrb(x - this.orbWidth/2, y - this.orbHeight/2);

      // 判断鼠标是否在初始选中珠范围之外, 并且在盘面之内
      if ((sx != originSx || sy != originSy) && sx < sizeX && sx >= 0 && sy < sizeY*2 && sy >= sizeY) {
        this._renderExchangingOrb(originSx + originSy * sizeX, sx + sy * sizeX);
        this.observer.trigger('view.orbExchange', originSx + originSy * sizeX - amount, sx + sy * sizeX - amount)
        originSx = sx;
        originSy = sy;
      }

      /*if (sx != this.originSx || sy != this.originSy) {

        this._renderExchangingOrb(sx, sy);
        this.originSx = sx;
        this.originSy = sy;
        ;
        
      }*/
    }
  }
  var onPointerUp = function(ev) {
    if (movingFlag) {
      movingFlag = 0;
      
      this._cancelSelectingOrb(this.originOrb);
      this.observer.trigger('view.moveEnd');
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
      for (var i in methods) {
        if (methods.hasOwnProperty(i)) {
          obj[i] = methods[i];
        }
      }
    }
  }
});