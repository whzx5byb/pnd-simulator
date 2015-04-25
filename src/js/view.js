var Pnd = (function(pnd) {

  var View = function(opt) {
    this.transparentImg = opt.transparentImg;
    this.orbSrcPrefix = opt.orbSrcPrefix;
    this.orbSrcSuffix = opt.orbSrcSuffix;
    this.orbNames = opt.orbNames;
    this.bgSrc = opt.bgSrc;
    this.canvasWidth = opt.canvasWidth;
    this.canvasHeight = opt.canvasHeight;
    this.boardWidth = opt.boardWidth;
    this.boardHeight = opt.boardHeight;
    this.boardSizeX = opt.boardSizeX;
    this.boardSizeY = opt.boardSizeY;
    this.cellWidth = this.boardWidth / this.boardSizeX;
    this.cellHeight = this.boardHeight / this.boardSizeY;
    this.orbWidth = opt.orbWidth;
    this.orbHeight = opt.orbHeight;
    this.orbMargin = this.cellWidth - this.orbWidth;
    this.animFlag = opt.animFlag;       // 动画效果开关
    this.comboInterval = opt.comboInterval; // combo计算间隔(ms)
    this.canvasId = opt.canvasId;

    this.rendering = 1;  //0: 不支持css3的浏览器; 1: css3动画; 2: canvas绘图库

    this.canvasObj = {};
    this.boardObj = {};
    this.orbContainers = [];
    this.orbs = [];
    
    this.data = Array(this.boardSizeX * this.boardSizeY);
    
    this.init();
  }

  /**
   * 初始化UI
   * @return {[type]}
   */
  View.prototype.init = function() {
    this._renderContainer();
    //this._bindUserEvent();
  }
  /**
   * 根据浏览器版本自动设置渲染方式
   */
  View.prototype.autoSetRendering = function() {
    this.setRendering(1);
  }
  View.prototype.setRendering = function(para) {
    this.rendering = para;
  }
  /**
   * 绑定用户事件, 在准备接受用户输入时调用
   * @return {[type]}
   */
  View.prototype.bindBoardEvent = function() {
    if (true) {
      this.bindMouseEvent();
    } else {
      this.bindTouchEvent();
    }
  }
  /**
   * 取消绑定用户事件, 在播放动画前调用
   * @return {[type]}
   */
  View.prototype.unbindBoardEvent = function() {

  }

  View.prototype._bindMouseEvent = function() {
    var canvas = this.canvasObj;
    canvas.addEventListener('mousedown', function(ev) {
      
    });
    canvas.addEventListener('mouseup', function(ev) {

    })
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
  View.prototype._renderContainer = function() {
    var r = this.rendering;
    switch (r) {
      case 0: 
        this._renderContainerByDom(); 
        break;
      case 1: 
        this._renderContainerByCss3(); 
        break;
      case 2: 
        this._renderContainerByCanvas(); 
        break;
    }
  }
  View.prototype._renderContainerByCss3 = function() {
    var canvas = document.getElementById(this.canvasId),
        sizeX = this.boardSizeX,
        sizeY = this.boardSizeY,
        cellW = this.cellWidth,
        cellH = this.cellHeight,
        orbW = this.orbWidth,
        orbH = this.orbHeight;
    this.canvasObj = canvas;
    // 创建场景容器
    var sceneObj = document.createElement('div');
    sceneObj.style.cssText =  'width:' + this.boardWidth + 'px; ' + 
                              'height:' + (this.canvasHeight - this.boardHeight) + 'px;' +
                              'background: #eee';
    canvas.appendChild(sceneObj);
    // 创建版面容器
    var boardObj = document.createElement('div');
    boardObj.style.cssText =  'width:' + this.boardWidth + 'px; ' + 
                              'height:' + this.boardHeight + 'px; ' +
                              'background-image:url("' + this.bgSrc + '"); ' + 
                              'background-size: cover';
    canvas.appendChild(boardObj);
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
        orb.src = this.transparentImg;
        orb.width = orbW;
        orb.height = orbH;
        orb.style.cssText = '-webkit-transition:' + this.comboInterval / 1000 + 's';
        this.orbs.push(orb);
        orbContainer.appendChild(orb);

        temp.appendChild(orbContainer);
      }
    }
    boardObj.appendChild(temp);

    this.boardObj = boardObj;

  }



  pnd.View = View;
  return pnd;
})(Pnd || {})