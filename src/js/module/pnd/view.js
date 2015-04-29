define(function(require, exports, module){
  var Q = require('q');
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
    this.transition = opt.transition; // 珠子下落速度(ms)
    this.canvasId = opt.canvasId;


    this.renderOpt = 'css3';  //0: 不支持css3的浏览器; 1: css3动画; 2: canvas绘图库
    this.renderer = {};

    this.canvasObj = {};
    this.boardObj = {};
    this.orbContainers = [];
    this.orbs = [];
    this.skyfallOrbs = [];

    this.tasks = [];
    this.isBusy = 0;
    
    this.data = Array(this.boardSizeX * this.boardSizeY);
    
    this.init();
  }

  /**
   * 初始化UI
   * @return {[type]}
   */
  View.prototype.init = function() {
    // 选择渲染方式
    var renderer = this.renderer;
    switch(this.renderOpt) {
      // 初始化渲染器, 重载view的渲染相关方法
      case 'css3':
        this.renderer = require('pnd.view.css3Renderer');
    }
    this.renderer.initRenderer(this);

    Q.fcall(function(){
      return this.r_initCanvas();
    }.bind(this)).then(function(){
      return this.r_initOrbContainer();
    }.bind(this), function(err){
      console.log(err);
    })
    
    

    //this._bindUserEvent();
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

  View.prototype.handle = function() {
    
    var task = this.tasks[0],
        _this = this;
    var s = Q.fcall(function() {
      return this._clearOrbs(task.clearedOrbs);
    }.bind(this)).then(function() {
      return this._moveOrbsTo(task.movedOrbs);
    }.bind(this)
    ).then(function() {
      this.tasks.shift(0);

      if (this.tasks.length == 0) {
        this.isBusy = 0;
        return ;
      } else {
        return this.handle();
      }
    }.bind(this)).fail(function(err) {
      console.log(err)
    });
    return s;
    
  }
  View.prototype.addHandleTask = function(obj) {
    this.tasks.push(obj);

    if (this.isBusy == 0) {
      this.handle();
      this.isBusy = 1;
    }
  }
  //
  View.prototype._clearOrbs = function(matchedOrbs) {
    console.log('clearOrbs!:', matchedOrbs)
    var arr = [],
        interval = this.comboInterval,
        _this = this,
        self = arguments.callee,
        remain = [];


    if (matchedOrbs.length > 0) {
      arr = matchedOrbs[0];
      remain = matchedOrbs.slice(1);

      
      return this._clearOrbsSingle(arr).then(function(){
        return this._clearOrbs(remain);
      }.bind(this));
    }
  }
  // 消除单串珠子
  View.prototype._clearOrbsSingle = function(arr) {
    console.log('clearOrbsSingle')
    var interval = this.comboInterval;

    // 消除珠子
    if (typeof arr == 'undefined' || arr.length == 0) {
      return;
    } else {
      return Q.Promise(function(resolve, reject, notify) {
        this.r_clearOrbs(arr);
        resolve();
      }.bind(this)).delay(interval);
    }
    
  }


  // 
  View.prototype._moveOrbsTo = function(movedOrbs) {
    var x, y,
        cellW = this.cellWidth,
        cellH = this.cellHeight,
        start = movedOrbs.start || [],
        end = movedOrbs.end || [],
        skyfall = movedOrbs.skyfall || [],
        skyfallStart = movedOrbs.skyfallStart || [];

    var pre = this.orbSrcPrefix,
        suf = this.orbSrcSuffix,
        names = this.orbNames;

    return Q.Promise(function(resolve, reject, notify) {
      this.r_moveOrbs(movedOrbs);
      //alert('stop')
      resolve();
    }.bind(this)).delay(this.transition);
  }
  
  

  module.exports = View;
});
  
