var Pnd = (function(pnd) {
  // 快速遍历二维数组
  var forEach = function(arr, func) {

  }
  // 定义版面数据类
  var Board = function(opt) {
    var opt = opt || {};
    this.sizeX = opt.sizeX || 6;      // 版面宽度
    this.sizeY = opt.sizeY || 5;    // 版面高度
    this.amount = this.sizeX * this.sizeY;
    this.typenum = opt.typenum || 8;  // 版面珠子种类数(最大)
    this.gravity = [0, 1];             // 定义重力方向. x正向为从左向右, y正向为从上向下. 
    this.skyfallArray = Board.calcSkyfallArray(opt.skyfall || [0,1,2,3,4,5]); // 天降珠子颜色以及几率


    this.data = [];

  }
  // 生成指定的珠子出现概率数组
  // 未指明加权时按平均考虑
  // 如[0,1,2,3,4,5]
  Board.calcSkyfallArray = function(typeArr, rateArr) {
    var typeArr = typeArr || [0,1,2,3,4,5],
        rateArr = rateArr || typeArr.map(function() {return 0}),
        len = typeArr.length;

    var ret = [], 
        r = exRate = 0;
    for (var i = 0; i < len; i ++) {
      exRate += parseInt(rateArr[i]) / 100;
    }
    for (i = 0; i < len; i ++) {
      if (i == len - 1) {
        ret.push([typeArr[i], 1]);
      } else {
        r += (1 / len + rateArr[i] / 100) / (1 + exRate);
        ret.push([typeArr[i], r]);
      }
      
    }
    return ret;

  }
  
  Board.makeOrbsByRate = function(amount, arr) {
    var amount = amount || 30;
    var ret = [], len = arr.length;
    for (var i = 0; i < amount; i ++) {
      random = Math.random();
      for (var j = 0; j < len; j ++) {
        // 用随机数与天降数组的第二项相比较
        if (random < arr[j][1]) {
          ret.push({type:arr[j][0], plus:0});
          break;
        }
      }
    }
    return ret;
  }

  // 根据天降配置生成指定数量的珠子
  Board.prototype.makeOrbsBySkyfall = function(amount) {
    var amount = amount || this.amount;
    return Board.makeOrbsByRate(amount, this.skyfallArray);
  }
  // 波利洗版
  Board.prototype.randomize = function() {
    var skyfall = this.makeOrbsBySkyfall();
    this.data = skyfall;
    return this.data;
  }
  // 洗版
  Board.prototype.changeOrbsToMixed = function() {

  }

  // 转珠 
  Board.prototype.changeOrb = function() {

  }
  // 点灯
  Board.prototype.powerupOrb = function() {

  }

  // 获得当前盘面珠子数量
  Board.prototype.getOrbsNum = function() {
    var amount = this.amount, n = 0, arr = [], typenum = this.typenum, d;
    for (var i = 0; i < typenum; i ++) {
      arr[i] = 0;
    }
    for (var i = 0; i < amount; i ++ ) {
      d = this.data[i].type;
      arr[d] = (arr[d] == undefined) ? 1 : arr[d] + 1;
    }
    return arr;
  }

  // 发出消除指令
  Board.prototype.matchBoardByRule = function() {
    // 获取消除的珠子坐标
    var matchedOrbs = [[0,1,2,3],[12,13,14,15],[25,26,27],[11,17,23,29]];
    return this.matchBoard(matchedOrbs);
  }

  Board.prototype.matchBoard = function(matchedOrbs) {
    var sx = this.sizeX,
        sy = this.sizeY,
        am = this.amount,
        sxh = sx / 2,
        syh = sy / 2,
        gx = this.gravity[0],
        gy = this.gravity[1],
        movedOrbs = []; // 移动了的珠子数组, 下标是移动前的珠子坐标, 值为移动后的珠子坐标
    for (var i = 0; i < am; i ++) {
      movedOrbs[i] = i;
    }
    
    matchedOrbs = matchedOrbs || [];
    
    // 遍历每个珠子坐标,获得它"上方"受到重力作用的珠子的坐标, 以及下落的最终位置
    var t = matchedOrbs.join(',').split(',');
    for (var i = 0, len = t.length; i < len; i ++) {
      if (t[i] == '') {continue;}
      delete(movedOrbs[t[i]]);
      var x = t[i] % sx, y = Math.floor(t[i] / sx);

      // 判定位于x,y坐标的珠子"上方"是否有珠
      while (x * gx + sxh > sxh * gx && y * gy + syh > syh * gy) {
        // 若有则将坐标向重力反方向移动一格,该位置的珠重力移动量+1
        x = x - gx;
        y = y - gy;
        if (!isNaN(movedOrbs[y*sx + x])) {movedOrbs[y*sx + x] += gx + gy * sx;}
        
      }
    }
    // 去除没有移动的珠子
    for (i in movedOrbs) {
      if (movedOrbs[i] == i) delete(movedOrbs[i]);
    }
    return {
      matchedOrbs: matchedOrbs,
      movedOrbs: movedOrbs
    }
  }
  

  pnd.Board = Board;
  return pnd;
})(Pnd || {});