/**
 * 形状模块
 * 给定版面大小sx, sy, 重力方向gravity; 一个形状由以下参数描述: 包含坐标的有序数组[]. 如[2,3,4,5]
 * [1,2,3,4] 和 [1,3,2,4] 不是同一个形状
 * 
 */

define(function(require, exports, module) {
  'use strict';
  var sx = 6,
      sy = 5,
      gravity = [0, 1],
      a = sx * sy;

  function set(opt) {
    sx = opt.sx || sx;
    sy = opt.sy || sy;
    a = sx * sy;
    gravity = opt.gravity || gravity;
  }
  
  /**
   * 获得一个形状的掉落形状
   *   消除珠子后留下的空位形状的"向下"掉落形状即为生成天降珠子的初始形状
   *   消除珠子后留下的空位形状的"向上"掉落形状即为天降珠子的目标形状
   * @param  {number[]} figure  [description]
   * @return {number[]} ret     [description]
   */

  function getFallingOf(figure, arr) {
    var arr = arr || gravity,
        x = 0,
        y = 0,
        gx = arr[0],
        gy = arr[1],
        sxh = (sx + 1) / 2,
        syh = (sy + 1) / 2;
    return figure.map(function(item) {
      var x = item % sx,
          y = Math.floor(item / sx),
          distance = 0;
      // 将该点"下"移一格
      x += gx;
      y += gy;
      // 判断该点是否在界内
      while (gx * (x + 1) < sxh * (gx + 1) && gy * (y + 1) < syh * (gy + 1)) {
        // 若该点也不在形状内, 则距离+1
        if (figure.indexOf(x + y * sx) < 0) {
          distance += 1;
        }
        x += gx;
        y += gy;
      }
      return (gx + gy * sx) * distance + item;
    })
  }
  /**
   * 获得一个形状的反掉落形状, 即重力反向时的掉落
   * @param  {[type]} figure [description]
   * @return {[type]} ret    [description]
   */
  function getRisingOf(figure) {
    return getFallingOf(figure, [gravity[0] * -1, gravity[1] * -1]);
  }

  /**
   * 给定2个形状, 同时去除他们的重复部分(对排序敏感)
   * @return {[type]} [description]
   */
  function removeRepeated(arr) {
    var f1 = arr[0], f2 = arr[1];
    var i = 0;
    while(i < f1.length) {
      if (f1[i] == f2[i]) {
        f1.splice(i,1);
        f2.splice(i,1);
      } else {
        i += 1;
      }
    }
    return [f1, f2];
  }

  /**
   * 获得一个形状的互补形状
   * @param  {[type]} figure [description]
   * @return {[type]}        [description]
   */
  function getComplementOf(figure) {
    var a = 30;
    var arr = [];
    for (var i = 0; i < a; i ++) {
      if (figure.indexOf(i) < 0) arr.push(i);
    }
    return arr;
  }
  
  /**
   * 给定一个形状, 获得当前面板下该形状为空时的掉落情况
   * @param {num[]} 以数组形式给定的一个形状
   * @return {num[][]}
   */
  function getFallingProgress(emptyFigure) {
    var e = emptyFigure || [];

    var start1 = getComplementOf(e),
        end1 = getFallingOf(start1),
        temp = removeRepeated([start1, end1]);

    start1 = temp[0];
    end1 = temp[1];

    var start2 = getFallingOf(e),
        end2 = getRisingOf(e);

    return [start1, end1, start2, end2];
  }

  module.exports = {
    getComplementOf: getComplementOf,
    getFallingOf: getFallingOf,
    getRisingOf: getRisingOf,
    removeRepeated: removeRepeated,
    getFallingProgress: getFallingProgress

  }
});
