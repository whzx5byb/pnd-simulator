var Pnd = (function(pnd) {

  var View = function(opt) {
    this.transparentImg = 'img/1x1.png'
    this.orbSrcPrefix = 'img/';
    this.orbSrcSuffix = '.png';
    this.orbNames = ["fire", "water", "wood", "light", "dark", "heart", "poison", "disturb"];
    this.bgSrc = 'img/bg.png';
    this.canvasWidth = 360;
    this.canvasHeight = 600;
    this.boardWidth = 360;
    this.boardHeight = 300;
    this.boardSizeX = 6;
    this.boardSizeY = 5;
    this.cellWidth = this.boardWidth / this.boardSizeX;
    this.cellHeight = this.boardHeight / this.boardSizeY;
    this.orbWidth = 58;
    this.orbHeight = 58;

    this.animation = 1;       // 动画效果开关
    this.comboInterval = 500; // combo计算间隔(ms)

    this.canvasId = 'canvas';
    this.render = {};

    this.canvasObj = {};
    this.boardObj = {};
    this.orbContainers = [];
    this.orbs = [];
    
    this.data = Array(this.boardSizeX * this.boardSizeY);
    
    this.init();
  }

  View.prototype.init = function() {
    var canvas = document.getElementById(this.canvasId),
        sizeX = this.boardSizeX,
        sizeY = this.boardSizeY,
        cellW = this.cellWidth,
        cellH = this.cellHeight,
        orbW = this.orbWidth,
        orbH = this.orbHeight;
    this.canvasObj = canvas;

    // 用DIV+CSS渲染
    // 创建版面容器
    var boardObj = document.createElement('div');
    boardObj.id = 'board';
    boardObj.style.cssText = 'width:' + this.boardWidth + 'px; ' + 
                             'height:' + this.boardHeight + 'px; ' +
                             'background-image:url("' + this.bgSrc + '"); ' + 
                             'background-size: cover';
    canvas.appendChild(boardObj);
    this.boardObj = boardObj;

    // 创建格子容器
    var temp = document.createDocumentFragment();
    for (var i = 0; i < sizeY; i ++ ) {
      for (var j = 0; j < sizeX; j ++ ) {
        // 创建单个的珠子容器
        var orbContainer = document.createElement('div');
        orbContainer.id = 'orb_' + i + '_' + j;
        orbContainer.style.cssText =  'position: absolute; -webkit-transition: ease-in 0.25s;' +
                                      'width:' +  cellW + 'px;' +
                                      'height:' + cellH + 'px;' +
                                      '-webkit-transform: translate3d(' + j*cellW + 'px, ' + i*cellH + 'px, 0)';
        this.orbContainers.push(orbContainer);

        // 创建单个珠子
        var orb = document.createElement('img');
        orb.src = '';
        orb.width = orbW;
        orb.height = orbH;
        orb.style.cssText = '-webkit-transition:' + this.comboInterval / 1000 + 's';
        this.orbs.push(orb);
        orbContainer.appendChild(orb);

        temp.appendChild(orbContainer);
      }
    }
    boardObj.appendChild(temp);
    // DIV+CSS 渲染结束

    //this.bindUserEvent();
  }

  // 绑定用户事件
  View.prototype.bindUserEvent = function() {
    if (true) {
      this.bindMouseEvent();
    } else {
      this.bindTouchEvent();
    }
  }
  
  View.prototype.bindMouseEvent = function() {
    this.canvasObj.addEventListener('mousedown', function(ev) {
      alert('mousedown')
    });
  }

  // 显示版面
  View.prototype.show = function(arr) {
    var pre = this.orbSrcPrefix,
        suf = this.orbSrcSuffix,
        names = this.orbNames,
        arr = arr || [];
    for (var i = 0, len = arr.length; i < len; i ++) {
      if (typeof arr[i] != 'object') {
        arr[i] = {type:arr[i], plus:0}
      }
      this.data[i] = arr[i];
      this.orbs[i].src = pre + names[arr[i].type] + suf;
    }
  }
  // 清空版面
  View.prototype.empty = function() {
    for (var i = 0, len = this.orbs.length; i < len; i ++) {
      delete(this.data[i]);
      this.orbs[i].src = this.transparentImg;
    }
  }
  View.prototype.handle = function(opt) {
    this.eliminate(opt.matchedOrbs, function(){
      this._moveOrbsTo(opt.movedOrbs)
    });
  }
  // 消除珠子
  // 参数: 
  // 
  View.prototype.eliminate = function(matchedOrbs, callback) {
    var arr = [],
        interval = this.comboInterval,
        _this = this,
        self = arguments.callee,
        remain = [];

    if (matchedOrbs.length > 0) {
      arr = matchedOrbs[0];
      remain = matchedOrbs.slice(1);

      this._eliminateSingle(arr, function(){self.call(_this, remain, callback)});
    } else {
      callback.call(this);
    }
  }
  // 消除单串珠子
  View.prototype._eliminateSingle = function(arr, callback) {
    var interval = this.comboInterval,
        _this = this;

    // 消除珠子
    if (arr == undefined) {callback();return;}
    for (var i = 0; i < arr.length; i ++ ) {
      delete(this.data[i]);
      this.orbs[arr[i]].style.opacity = 0;
    }
    // 显示combo数


    // 动画结束后的回调
    if (this.animation) {
      setTimeout(function(){
        callback.call(_this);
      }, interval);
    } else {
      callback.call(this);
    }
  }

  // 掉落珠子
  View.prototype.drop = function() {
    this._moveOrbsTo([0,1,2,3,4,5],[12,13,14,15,16,17])
  }

  // 
  View.prototype._moveOrbsTo = function(arr) {
    var x, y,
        cellW = this.cellWidth,
        cellH = this.cellHeight;
    //alert(m + '|' + n)
    
    for (var i in arr) {
      x = arr[i] % this.boardSizeX;
      y = Math.floor(arr[i] / this.boardSizeX),
      // 改变珠子容器坐标
      this.data[arr[i]] = this.data[i];
      delete(this.data[i]);
      this.orbContainers[i].style.webkitTransform = 'translate3d(' + x*cellW + 'px,' + y*cellH + 'px,0)';
    }

  }
  
  pnd.View = View;
  return pnd;
})(Pnd || {})