define(function(require, exports, module) {
  var Model = function(opt) {
    this.sizeX = opt.boardSizeX;
    this.sizeY = opt.boardSizeY;
    this.amount = this.sizeX * this.sizeY;
    this.typeNum = opt.typeNum;
    this.gravity = opt.gravity;
    this.hasSkyfall = 0;
    this.skyfallBases = opt.skyfallBases;
    this.skyfallWeights = opt.skyfallWeights;

    this.dataArr = [];
    this.skyfallRates = [];
    this.observer = require('pnd.observer');

    this.init(opt);
  }

  /**
   * 初始化珠盘数据模型
   * 珠子用[index, type, isPlus]的数组来表示
   * @return {void}
   */
  Model.prototype.init = function(opt) {
    this._initSkyfallArr();
    this.empty();


  }
  /**
   * 设置技能天降权重
   * @param {number[]} arr 可以是稀疏数组
   */
  Model.prototype.setSkyfallWeights = function(arr) {
    for (var i in arr) {
      this.skyfallWeights[i] = arr[i];
    }
    this._initSkyfallArr;
  }

  /**
   * 清空所有珠子
   * @return {void}
   */
  Model.prototype.empty = function() {
    var amount = this.amount;
    for (var i = 0; i < amount; i++) {
      this.dataArr[i] = [i, -1, 0];
    }
  }
  /**
   * 从当前状态进入到下一个状态
   * 状态的改变包括两个过程: 按规则消除珠子, 将剩余的珠子(和天降珠子)下落
   * @return {[type]} [description]
   */
  Model.prototype.toNextState = function() {
    var clearedOrbs = this.clearOrbs(),
        movedOrbs = this.dropOrbs(),
        func = this.toNextState.bind(this);
    if (clearedOrbs.length === 0 && movedOrbs.length === 0) {
      this.observer.trigger('changeOver', obj);
    } else {
      this.observer.trigger('statChange', obj);
      setTimeout(func, 0);
    }
    
    
  }

  Model.prototype.clearOrbs = function() {
    var matchModel = require('pnd.matchModel'),
        data = this.getSimpleData(),
        clearedArr = matchModel.match(data),
        clearedOrbs = [];
    
    // 更新本地数据
    clearedArr.forEach(function(item) {
      var temp = [];
      item.forEach(function(item2) {
        temp.push(this.dataArr[item2]);
        this.dataArr[item2] = [item2, -1, 0];
      });
      clearedOrbs.push(temp);
    });

    // 通知事件发生
    this.observer.trigger('orbsClear', clearedOrbs);
    return clearedOrbs;
  }
  Model.prototype.dropOrbs = function() {
    var figureModel = require('pnd.figureModel'),
        data = this.getSimpleData(),
        emptyArr = [];

    // 获得版面上的空位, 若空位为0则返回
    data.forEach(function(item, index) {
      if (item == -1) emptyArr.push(index);
    });
    if (emptyArr.length === 0) {return [];}
    // 获得空位的补集的掉落
    var originStartArr = figureModel.getComplementOf(emptyArr),
        originEndArr = figureModel.getDropOf(originStartArr),
        temp = figureModel.removeRepeated([originStartArr, originEndArr]),
        skyfallStartArr = [],
        skyfallEndArr = [],
        skyfallArr = [],
        movedOrbs,
        newDataArr = this.dataArr.concat();
    // 消去重复珠后即为原来面板上需要移动的珠子始终位置
    originStartArr = temp[0];
    originEndArr = temp[1];

    // 如果有天降, 获得天降珠子的始终位置, 和天降珠子类型数据
    if (this.hasSkyfall) {
      skyfallArr = this.getRandomOrbsByRates(emptyArr.length);
      // 天降形状的始终位置其实就是空缺形状的上下掉落
      // 天降的起始位置是屏幕外, 每个减去总数目才是真实坐标
      skyfallStartArr = figureModel.getDropOf(emptyArr).map(function(i){return i - 30});
      skyfallEndArr = figureModel.getReverseDropOf(emptyArr);
    }

    // 获得最终变动了的珠子始终位置
    movedStartArr = originStartArr.concat(skyfallStartArr);
    movedEndArr = originEndArr.concat(skyfallEndArr);
    movedOrbs = {
      start: movedStartArr,
      end: movedEndArr,
      skyfall: skyfallArr;
    };

    // 更新本地数据
    
    originEndArr.forEach(function(item, index) {
      newDataArr[item] = newData[originStartArr[index]];
    })
    skyfallEndArr.forEach(function(item, index) {
      newDataArr[item] = skyfallArr[index];
    })
    this.dataArr = newDataArr.concat();

    // 通知事件发生
    this.observer.trigger('orbsDrop', movedOrbs);
    return movedOrbs;
  }
  /**
   * 使用天降配置填满珠盘
   * @return {[type]} [description]
   */
  Model.prototype.fulfill = function() {
    var n = this._getEmptyNum();
    this.getOrbsBySkyfall(n);
  }


  // 波利洗版
  Model.prototype.randomize = function() {
    this.empty();
    var skyfall = this.getOrbsBySkyfall();
    this.data = skyfall;
    return this.data;
  }
  // 洗版
  Model.prototype.changeOrbsToMixed = function() {

  }

  // 转珠 
  Model.prototype.changeOrb = function() {

  }
  // 点灯
  Model.prototype.powerupOrb = function() {

  }
  // 获得简单的当前版面数据(不含加珠)
  Model.prototype.getSimpleData = function() {
    return this.dataArr.map(function(item){
      return item[1];
    })
  }
  // 获得当前盘面珠子数量
  Model.prototype.getOrbsNum = function() {
    var amount = this.amount,
      n = 0,
      arr = [],
      typeNum = this.typeNum,
      d;
    for (var i = 0; i < typeNum; i++) {
      arr[i] = 0;
    }
    for (var i = 0; i < amount; i++) {
      d = this.data[i][1];
      arr[d] = (arr[d] == undefined) ? 1 : arr[d] + 1;
    }
    return arr;
  }

  // 发出消除指令
  Model.prototype.matchBoardByRule = function() {
    // 获取消除的珠子坐标
    var matchedOrbs = [
      [0, 1, 2, 3],
      [12, 13, 14, 15],
      [25, 26, 27],
      [11, 17, 23, 29]
    ];
    return this._matchAll(matchedOrbs);
  }
  Model.prototype.matchAndDrop = function() {
    var matchedOrbs = this.matchModel.match;
    this._matchAll();
    this._dropAll();
  }
  /**
   * 匹配珠子并消去
   * @param  {number[][]} matchedOrbs 描述被消除珠串的二维数组, 每个成员数组表示一串被消除的珠子坐标
   * @return {[type]}
   */
  Model.prototype._matchAll = function(matchedOrbs) {
    var m = matchedOrbs.join(',').split(',');
    return {
      matchedOrbs: matchedOrbs
    }
  }
  /**
   * 将重力作用于当前珠盘
   * @return {[type]} [description]
   */
  Model.prototype._dropAll = function() {
    var sx = this.sizeX,
      sy = this.sizeY,
      am = this.amount,
      sxh = sx / 2,
      syh = sy / 2,
      gx = this.gravity[0],
      gy = this.gravity[1],
      movedOrbs = []; // 移动了的珠子数组, 下标是移动前的珠子坐标, 值为移动后的珠子坐标
    for (var i = 0; i < am; i++) {
      movedOrbs[i] = i;
    }

    matchedOrbs = matchedOrbs || [];

    // 遍历每个消除的珠子坐标,获得它"上方"受到重力作用的珠子的坐标, 以及下落的最终位置
    var t = matchedOrbs.join(',').split(',');
    for (var i = 0, len = t.length; i < len; i++) {
      if (t[i] == '') {
        continue;
      }
      delete(movedOrbs[t[i]]);
      var x = t[i] % sx,
        y = Math.floor(t[i] / sx);

      // 判定位于x,y坐标的珠子"上方"是否有珠
      while (x * gx + sxh > sxh * gx && y * gy + syh > syh * gy) {
        // 若有则将坐标向重力反方向移动一格,该位置的珠重力移动量+1
        x = x - gx;
        y = y - gy;
        if (!isNaN(movedOrbs[y * sx + x])) {
          movedOrbs[y * sx + x] += gx + gy * sx;
        }

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


  /**
   * 获得天降几率分布数组
   * @return {[type]} [description]
   */
  Model.prototype._initSkyfallArr = function() {
    this.skyfallRates = this.getSkyfallRates(this.skyfallBases, this.skyfallWeights);
  }

  /**
   * 获取当前盘面空珠的位置
   * @return {number[]} 空珠的位置
   */
  Model.prototype._getEmptyOrbs = function() {
    var amount = this.amount,
      arr = [];

    this.dataArr.forEach(function(item, index) {
      if (item[1] == -1) {
        arr.push[index];
      }
    })
    return arr;
  }

  /**
   * 根据天降权重生成珠子天降几率分布数组
   * TODO: 天降权重的官方算法需要确认
   *
   * @param  {number[]} sfBases    基础权重数组, 索引为珠子类型, 值为该珠的基础权重; 如[1, 0, 1, 1, 0, 1, 0, 0] 代表火木光心四色;
   * @param  {number[]} sfWeights  技能权重数组, 索引为珠子类型, 值为该珠的技能权重; 如[10, 0, 0, 0, 0, 0, 0, 10] 代表火赫拉火废10%;
   * @return {number[]} ret        天降分布数组, 索引为珠子类型, 值为该珠出现的几率; 如[0.2917, 0.2917, 0.5, 0.7083, 0.7083, 0.9166, 0.9166, 1];
   */
  Model.prototype.getSkyfallRates = function(sfBases, sfWeights) {
    // 最终概率 = (基础概率 + 额外技能概率) / (1 + 额外技能概率之和/100)
    // 基础概率 = 1 / 出现的珠子类别数量 * 该珠出现与否
    var len = sfBases.length,
      orbTypes = 0,
      sum = 0,
      temp = 0,
      ret = [];

    for (var i = 0; i < len; i++) {
      // 基础权重中大于0的全部置1
      sfBases[i] = (sfBases[i] > 0) ? 1 : 0;
      // 统计珠子类别数量和额外技能概率之和
      orbTypes += sfBases[i];
      sum += sfWeights;
    }
    for (i = 0; i < len; i++) {
      if (i == len - 1) {
        ret[i] = 1; // 数组尾数置为1, 防止截断误差.
      } else {
        temp += (1 * sfBases[i] / orbTypes + sfWeights[i] / 100) / (1 + sum / 100);
        ret[i] = temp;
      }
    }
    return ret;
  }

  /**
   * 根据天降几率分布数组随机生成指定数量的珠子
   * @param  {number[]}     arr    天降几率分布数组
   * @param  {number}       amount 生成珠子数量
   * @return {number[][]}   ret    生成的珠子排列数组
   */
  Model.prototype.getRandomOrbsByRates = function(amount, arr) {
    var amount = amount || 30,
        arr = arr || this.skyfallRates,
        ret = [],
        rnd = 0,
        len = arr.length;

    for (var i = 0; i < amount; i++) {
      rnd = Math.random();
      for (var j = 0; j < len; j++) {
        // 用随机数与天降数组的第二项轮流比较, 若正好则落在此区间内则生成此类珠子
        if (random < arr[j]) {
          ret.push([0, j, 0]);
          //TODO: 需要处理天降加珠
          break;
        }
      }
    }
    return ret;
  }

  module.exports = new Model();
});

/**
 * 定义珠盘模型
 */
