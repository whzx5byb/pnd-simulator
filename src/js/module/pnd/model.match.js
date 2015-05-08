/**
 * 消除规则匹配模块
 * 给定一个面板分布数组number[], 其中索引代表面板中珠子的位置, 索引对应的成员代表面板中相应位置的珠子类型
 * 
 */
define(function(require, exports, module){
  'use strict';
  var sx = 6,
      sy = 5,
      a = sx * sy;
  

  /**
   * 用floodfill方法标记连通区域
   * @param  {number[]}   data    
   * @return {number[][]} repeatedColorArr 形状的数组, 每个成员表示一个具有相同类型珠子的形状, 如[[0,1,2,3,4],[12,13,14]]
   */
  function floodfill(data) {
    var data = data || [],
        color = 0,              // 起始位置颜色
        colorArr = data.map(function() {
          return -1;
        }),                     // 存放各个点颜色的数组, 初始值为-1 (未上色)
        repeatedColorArr = [];  // 存放表示相同颜色数组的数组

    // 遍历版面每一个珠子
    for (var i = 0, len = data.length; i < len; i++) {
      // 如果该珠为空则跳过
      if (data[i] == -1) {continue;}
      if (colorArr[i] < 0) {
        // 若未被上色, 则从此珠开始上色
        repeatedColorArr[color] = [i];
        paint(i);
        color += 1;
      } else {
        // 若已上色, 则将该珠放入重复珠数组
        repeatedColorArr[colorArr[i]].push(i);
      }
    }
    return repeatedColorArr;

    function paint(i) {
      var type = data[i],
          l, r, u, d;
      // 若自己已是该色, 则返回, 否则给自己上色
      if (colorArr[i] == color) return;
      colorArr[i] = color;
      // 如果邻居珠子存在且是相同类型, 则也给它上色
      l = getNeighbor('l', i);
      r = getNeighbor('r', i);
      u = getNeighbor('u', i);
      d = getNeighbor('d', i);
      if (l > -1 && data[l] == type) {
        paint(l);
      }
      if (r > -1 && data[r] == type) {
        paint(r);
      }
      if (u > -1 && data[u] == type) {
        paint(u);
      }
      if (d > -1 && data[d] == type) {
        paint(d);
      }
    }
  }
  /**
   * 对一个形状数据按消除规则遍历匹配
   * @param  {number[][]} data 形状的数组, 如[[2,3,4,5,6],[12,13,14]]
   * @return {number[][]} data 形状的数组, 每个成员表示应该在1combo中消除的珠子的形状, 如[[2,3,4,5],[12,13,14]]
   */
  function matchPattern(data) {
    var d = data;
    d = d.filter(function(item) {
      return item.length >= 3;
    }).map(function(item) {
      var temp = [];
      item.forEach(function(ii){
        var ll = item.indexOf(getNeighbor('l',ii)),
            rr = item.indexOf(getNeighbor('r',ii)),
            uu = item.indexOf(getNeighbor('u',ii)),
            dd = item.indexOf(getNeighbor('d',ii));
        // 如果该点的左右邻居也在此区域里, 将这3点判定为消除点
        if (ll > -1 && rr > -1) {
          temp.push(item[ll], ii, item[rr]);
        }
        // 如果该点的上下邻居也在此区域里, 将这3点判定为消除点
        if (uu > -1 && dd > -1) {
          temp.push(item[uu], ii, item[dd]);
        }
      });
      return item.filter(function(ii){
        return temp.indexOf(ii) > -1;
      });
    }).filter(function(item) {
      return item.length > 0;
    });
    return d;
  }

  /**
   * 对给定珠子数据数组进行匹配
   * @param  {number[]} data [description]
   * @return {[type]}      [description]
   */
  function match(data) {
    var d = floodfill(data);
    return matchPattern(d);
  }

  function getNeighbor(str, i) {
    switch (str) {
      case 'l':
        return (i % sx == 0) ? -1 : i - 1;
      case 'r':
        return (i % sx == sx - 1) ? -1 : i + 1;
      case 'u':
        return i - sx;
      case 'd':
        return (i + sx >= a) ? -1 : i + sx;
    }
  }
  module.exports = {
    floodfill: floodfill,
    matchPattern: matchPattern,
    match: match
  };
});
  
