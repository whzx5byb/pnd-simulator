define(function(require, exports, module){
  var Q = require('q'),
      pep = require('pep');

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
    this.amount = this.boardSizeX * this.boardSizeY;
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

    this.canvasDiv = {};
    this.boardDiv = {};
    this.orbContainers = [];
    this.orbs = [];
    this.skyfallOrbs = [];

    this.tasks = [];
    this.isBusy = 0;
    
    this.data = Array(this.boardSizeX * this.boardSizeY);
    
    this.observer = require('pnd.observer');
    this.init();
  }

  /**
   * 初始化UI
   * @return {[type]}
   */
  View.prototype.init = function() {
    // 选择渲染方式
    switch(this.renderOpt) {
      // 初始化渲染器, 重载view的渲染相关方法
      case 'css3':
        this.renderer = require('pnd.view.css3Renderer');
    }
    var event = require('pnd.view.event');
    // 将渲染器里定义的方法绑定到view上
    this.renderer.init(this);
    event.init(this);

    Q.fcall(function(){
      return this._initCanvas();
    }.bind(this)).then(function(){
      return this._initOrbContainer();
    }.bind(this), function(err){
      console.log(err);
    })
    
    
  }


  
  View.prototype.handle = function() {
    
    var task = this.tasks[0],
        _this = this;
    this._unbindUserEvents();
    var s = Q.fcall(function() {
      return this._clearOrbs(task.clearedOrbs);
    }.bind(this)).then(function() {
      return this._moveOrbsTo(task);
    }.bind(this)).then(function() {
      this.tasks.shift(0);
      if (this.tasks.length == 0) {
        this.isBusy = 0;
        this._bindUserEvents();
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
  View.prototype._clearOrbs = function(clearedOrbs) {
    
    var arr = [],
        interval = this.comboInterval,
        _this = this,
        self = arguments.callee,
        remain = [];


    if (clearedOrbs.length > 0) {
      arr = clearedOrbs[0];
      remain = clearedOrbs.slice(1);

      
      return this._clearOrbsSingle(arr).then(function(){
        return this._clearOrbs(remain);
      }.bind(this));
    }
  }
  // 消除单串珠子
  View.prototype._clearOrbsSingle = function(arr) {
    
    var interval = this.comboInterval;

    // 消除珠子
    if (typeof arr == 'undefined' || arr.length == 0) {
      return;
    } else {
      return Q.Promise(function(resolve, reject, notify) {
        this._renderClearing(arr);
        resolve();
      }.bind(this)).delay(interval);
    }
    
  }


  // 
  View.prototype._moveOrbsTo = function(stat) {
    // TODO: 这个能忍吗...
    var amount = this.boardSizeX * this.boardSizeY,
        skyfall = stat.skyfallOrbs,
        skyfallStart = stat.skyfallStartIndexes.map(function(i){return i + amount}),
        skyfallEnd = stat.skyfallEndIndexes.map(function(i){return i + amount}),
        start = stat.startIndexes.map(function(i){return i + amount}).concat(skyfallStart),
        end = stat.endIndexes.map(function(i){return i + amount}).concat(skyfallEnd),
        empty = stat.empty.map(function(i){return i + amount});


    return Q.Promise(function(resolve, reject, notify) {
      this._renderFalling(empty, start, end, skyfall, skyfallStart);
      //alert('stop')
      resolve();
    }.bind(this)).delay(this.transition);
  }
  
  

  module.exports = View;
});
  
