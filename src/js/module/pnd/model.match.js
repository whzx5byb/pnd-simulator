var Pnd = (function(pnd) {

  // 定义消除模型
  var MatchModel = function(opt) {
    this.min = opt.min || 3; // 触发消除的最小相连珠子数
    this.sizeX = opt.boardSizeX || 6;
    this.sizeY = opt.boardSizeY || 5;
    this.amount = this.sizeX * this.sizeY;
  }

  /**
   * 用floodfill方法标记连通区域
   * @param  {number[][]} data    
   * @return {number[][]} repeatedColorArr  表示相同颜色数组的数组, 如[[0,1,2,3,4],[12,13,14]]
   */
  MatchModel.prototype._floodfill = function (data) {
    var amount = this.amount,
        sizeX = this.sizeX,
        sizeY = this.sizeY,
        data = data || [],
        color = 0,              // 起始位置颜色
        colorArr = data.map(function() {
          return -1;
        }),                     // 存放各个点颜色的数组, 初始值为-1 (未上色)
        repeatedColorArr = [];  // 存放表示相同颜色数组的数组

    // 遍历版面每一个珠子
    for (var i = 0, len = data.length; i < len; i++) {
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
      var type = data[i][1],
          l, r, u, d;
      // 若自己已是该色, 则返回, 否则给自己上色
      if (colorArr[i] == color) return;
      colorArr[i] = color;
      // 如果邻居珠子存在且是相同颜色, 则也给它上色
      l = this._getNeighbor('l', i);
      r = this._getNeighbor('r', i);
      u = this._getNeighbor('u', i);
      d = this._getNeighbor('d', i);
      if (l > -1 && data[l][1] == type) {
        paint(l);
      }
      if (r > -1 && data[r][1] == type) {
        paint(r);
      }
      if (u > -1 && data[u][1] == type) {
        paint(u);
      }
      if (d > -1 && data[d][1] == type) {
        paint(d);
      }
    }
  }
  /**
   * 对一组连通区域数据按消除规则遍历匹配
   * @param  {number[][]} data 一组表示相同颜色的点集合的数组, 如[[0,1,2,3,4],[12,13,14]]
   * @return {number[][]} data 一组表示匹配消除规则的点的集合的数组, 如[[0,1,2,3,4],[12,13,14]]
   */
  MatchModel.prototype._matchPattern = function(data) {
    var temp = [], di; // 临时存放消除点的数组
    for (var i in data) {
      di = data[i];
      // 如果该连通区域大小小于3, 则直接跳过
      if (di.length < 3) {
        delete di;
        continue;
      }
      temp = [];
      
      for (var j in di) {
        var o = di[j],
            ll = di.indexOf(this._getNeighbor('l', o)),
            rr = di.indexOf(this._getNeighbor('r', o)),
            uu = di.indexOf(this._getNeighbor('u', o)),
            dd = di.indexOf(this._getNeighbor('d', o));
        // 如果该点的左右邻居也在此区域里, 将这3点判定为消除点
        if (ll > -1 && rr > -1) {
          temp.push(di[ll], di[j], di[rr]);
        }
        // 如果该点的上下邻居也在此区域里, 将这3点判定为消除点
        if (uu > -1 && dd > -1) {
          temp.push(di[uu], di[j], di[dd]);
        }
      }
      // 与临时消除点数组比对, 删去那些不在其中的元素
      data[i] = di.filter(function(item) {
        return temp.indexOf(item) > -1;
      });
    }
    return data;
  }

  /**
   * 对给定珠子数据数组进行匹配
   * @param  {number[][]} data [description]
   * @return {[type]}      [description]
   */
  MatchModel.prototype.match = function(data) {
    var d = this._floodfill(data);
    return this._matchPattern(d);
  }
  MatchModel.prototype._getNeighbor = function(str, i) {
    var x = this.sizeX,
        a = this.amount;
    switch (str) {
      case 'l':
        return (i % x == 0) ? -1 : i - 1;
      case 'r':
        return (i % x == x - 1) ? -1 : i + 1;
      case 'u':
        return i - x;
      case 'd':
        return (i + x >= a) ? -1 : i + x;
    }
  }

  pnd.MatchModel = MatchModel;
  return pnd;
})(Pnd || {})
