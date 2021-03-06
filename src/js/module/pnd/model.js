define(function(require, exports, module) {
  'use strict';
  var Model = function(opt) {
    this.sizeX = opt.boardSizeX;
    this.sizeY = opt.boardSizeY;
    this.amount = this.sizeX * this.sizeY;
    this.typeNum = opt.typeNum;
    this.gravity = opt.gravity;
    this.hasSkyfall = 1;
    this.skyfallBases = opt.skyfallBases;
    this.skyfallWeights = opt.skyfallWeights;

    this.dataArr = [];
    this.skyfallRates = [];
    this.observer = require('pnd.observer');

    
  }

  /**
   * 初始化珠盘数据模型
   * 珠子用[index, type, isPlus]的数组来表示, 如[0,1,1]表示在0位置的木加珠
   * @return {void}
   */
  Model.prototype.init = function() {
    this.initSkyfallRates();
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
    this.initSkyfallRates;
  }

  /**
   * 清空所有珠子
   * @return {void}
   */
  Model.prototype.empty = function() {
    var arr = [];
    for (var i = 0; i < this.amount; i++) {
      arr.push(i);
    }

    this.updateData({
      method: 'clear',
      indexes: arr
    });
  }
  /**
   * 从当前状态进入到下一个状态
   * 状态的改变包括两个过程: 按规则消除珠子, 将剩余的珠子下落
   * 过程中如果有天降设定, 则还需要生成天降珠子, 以及处理它们的下落过程
   * @return {[type]} [description]
   */
  Model.prototype.toNextState = function(n) {
    var matchModel = require('pnd.model.match'),
        figureModel = require('pnd.model.figure'),
        self = this.toNextState.bind(this),
        n = n || 0;
    

    // 处理消除阶段
    var data = this.getSimpleData(),
        matchedData = matchModel.match(data),
        clearedOrbs = this.getFullData(matchedData);

    this.updateData({
      method: 'clear', 
      indexes: matchedData.reduce(function(previous, current) {
        return previous.concat(current);
      }, [])
    });

    // 处理掉落阶段
    var emptyArr = this.getSimpleData().reduce(function(previous, current, index){
      if (current == -1) {
        previous.push(index);
      };
      return previous;
    }, []);
    
    var fallingArr = figureModel.getFallingProgress(emptyArr);
    
    this.updateData({
      method: 'move', 
      startIndexes: fallingArr[0],
      endIndexes: fallingArr[1]
    });

    // 处理天降阶段
    var skyfallOrbs = [];
    if (this.hasSkyfall) {
      skyfallOrbs = this.getRandomOrbsByRates(emptyArr.length);
      this.updateData({
        method: 'set',
        indexes: fallingArr[3],
        data: skyfallOrbs
      });
    }

    

    // 触发事件
    var stat = {
      clearedOrbs: clearedOrbs,
      empty: emptyArr,
      startIndexes: fallingArr[0],
      endIndexes: fallingArr[1],
      skyfallStartIndexes: fallingArr[2].map(function(item) {return item - this.amount}, this),
      skyfallEndIndexes: fallingArr[3],
      skyfallOrbs: skyfallOrbs
    }

    if (emptyArr.length == 0) {
      this.observer.trigger('board.changeFinish');
    } else {
      n += 1;
      this.observer.trigger('board.statChange', stat);

      if (n < 100) {
        setTimeout(function(){self(n)}, 0);
      }
    }
  }
  /**
   * 更新数据
   * @param  {[type]} method [description]
   * @param  {[type]} arr    [description]
   * @return {[type]}        [description]
   */
  Model.prototype.updateData = function(obj) {
    // 操作数据时, 注意保持序号的对应性, 元素的第一个成员应该和它本身的索引相同
    switch (obj.method) {

      case 'clear': 
        obj.indexes.forEach(function(item) {
          this.dataArr[item] = [item, -1, 0];
        }, this);
        break;

      case 'move':

        var startIndexes = obj.startIndexes,
            endIndexes = obj.endIndexes,
            tempArr = this.dataArr.concat();

        startIndexes.forEach(function(item) {
          this.dataArr[item] = [item, -1, 0];
        }, this);
        endIndexes.forEach(function(item, index) {
          tempArr[startIndexes[index]].splice(0,1,item);
          this.dataArr[item] = tempArr[startIndexes[index]];
        }, this);
        break;

      case 'exchange':

        var index1 = obj.index1,
            index2 = obj.index2,
            temp = this.dataArr[index1].concat();
            
        this.dataArr[index1] = [index1, this.dataArr[index2][1], this.dataArr[index2][2]];
        this.dataArr[index2] = [index2, temp[1], temp[2]]
        break;

      case 'set':
        var data = obj.data;
        obj.indexes.forEach(function(item, index) {
          this.dataArr[item] = [item, data[index][1], data[index][2]];
        }, this)
        break;
    }
    this.observer.trigger('board.dataUpdate', this.dataArr);
  }

  Model.prototype._handleMatching = function() {
    var matchModel = require('pnd.model.match'),
        data = this.getSimpleData(),
        clearedOrbs = [];
    
    // 更新本地数据
    matchModel.match(data).forEach(function(item) {
      var temp = [];
      item.forEach(function(item2) {
        temp.push(this.dataArr[item2]);
        this.dataArr[item2] = [item2, -1, 0];
      }, this);
      clearedOrbs.push(temp);
    }, this);

    // 通知事件发生
    this.observer.trigger('orbsClear', clearedOrbs);
    return clearedOrbs;
  }
  Model.prototype.dropOrbs = function() {
    var figureModel = require('pnd.model.figure'),
        data = this.getSimpleData(),
        emptyArr = [],
        movedOrbs = {
          start: [],
          end: [],
          skyfall: []
        };

    // 获得版面上的空位, 若空位为0则返回
    data.forEach(function(item, index) {
      if (item == -1) emptyArr.push(index);
    });
    if (emptyArr.length === 0) {return movedOrbs;}
    // 获得空位的补集的掉落
    var originStartArr = figureModel.getComplementOf(emptyArr),
        originEndArr = figureModel.getDropOf(originStartArr),
        temp = figureModel.removeRepeated([originStartArr, originEndArr]),
        skyfallStartArr = [],
        skyfallEndArr = [],
        skyfallArr = [],
        newDataArr = this.dataArr.concat();
    // 消去重复珠后即为原来面板上需要移动的珠子始终位置
    originStartArr = temp[0];
    originEndArr = temp[1];

    // 如果有天降, 获得天降珠子的始终位置, 和天降珠子类型数据
    if (this.hasSkyfall) {
      skyfallArr = this.getRandomOrbsByRates(emptyArr.length);
      // 天降形状的始终位置其实就是空缺形状的上下掉落
      // 天降的起始位置是屏幕外, 每个减去总数目才是真实坐标
      // TODO: 30
      skyfallStartArr = figureModel.getDropOf(emptyArr).map(function(i){return i - 30});
      skyfallEndArr = figureModel.getReverseDropOf(emptyArr);
    }

    // 获得最终变动了的珠子始终位置
    movedStartArr = originStartArr.concat(skyfallStartArr);
    movedEndArr = originEndArr.concat(skyfallEndArr);
    movedOrbs = {
      start: movedStartArr,
      end: movedEndArr,
      skyfall: skyfallArr,
      skyfallStart: skyfallStartArr,
      empty: emptyArr
    };

    // 更新本地数据
    
    originEndArr.forEach(function(item, index) {
      newDataArr[item] = this.dataArr[originStartArr[index]];
    }, this)
    skyfallEndArr.forEach(function(item, index) {
      newDataArr[item] = skyfallArr[index];
    })

    this.dataArr = newDataArr.map(function(item, index){
      return [index, item[1], item[2]]
    })

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
  Model.prototype.getSimpleData = function(arr) {
    arr = arr || this.dataArr;
    return arr.map(function(item){
      return item[1];
    })
  }
  // 获得完整的当前版面数据(含加珠)
  Model.prototype.getFullData = function(arr) {
    arr = arr || [];
    return arr.map(function(item){
      if (typeof item == 'object') {
        return this.getFullData(item);
      } else {
        return this.dataArr[item];
      }
    }, this)
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
   * 初始化天降几率分布数组
   * @return {[type]} [description]
   */
  Model.prototype.initSkyfallRates = function() {
    this.skyfallRates = this._getSkyfallRates(this.skyfallBases, this.skyfallWeights);
  }
  /**
   * 根据天降权重生成珠子天降几率分布数组
   * TODO: 天降权重的官方算法需要确认
   *
   * @param  {number[]} sfBases    基础权重数组, 索引为珠子类型, 值为该珠的基础权重; 如[1, 0, 1, 1, 0, 1, 0, 0] 代表火木光心四色;
   * @param  {number[]} sfWeights  技能权重数组, 索引为珠子类型, 值为该珠的技能权重; 如[10, 0, 0, 0, 0, 0, 0, 10] 代表火赫拉火废10%;
   * @return {number[]} ret        天降分布数组, 索引为珠子类型, 值为该珠出现的几率; 如[0.2917, 0.2917, 0.5, 0.7083, 0.7083, 0.9166, 0.9166, 1];
   */
  Model.prototype._getSkyfallRates = function(sfBases, sfWeights) {
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
      sum += sfWeights[i];
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
        if (rnd < arr[j]) {
          ret.push([0, j, 0]);
          //TODO: 需要处理天降加珠
          break;
        }
      }
    }
    return ret;
  }

  module.exports = Model;
});

/**
 * 定义珠盘模型
 */
