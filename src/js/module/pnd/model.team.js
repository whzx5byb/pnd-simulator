define(function(require, exports, module){
  'use strict';
  // 总伤害公式: 总伤害 = 每串伤害求和 * combo倍率 * 队长浮动倍率 * 队长TYPE倍率 * 横排觉醒倍率
  // 
  // 单串伤害公式: 单串伤害 = 基础攻击 * 消珠数倍率 * 二体攻击倍率 * 加珠倍率
  // 
  // 消珠数倍率 = 1 + (消除珠子数量 - 3) * 0.25
  var getClearedNumberBonus = function(clearedNumber) {
    return 1 + (clearedNumber - 3) * 0.25;
  }
  // 二体攻击倍率 = 消除珠子数量 == 4 ? Math.pow(1.5, 二体觉醒所持数量) : 1
  var getTwoWayBonus = function(clearedNumber, twoWayKakuseiNumber) {
    return (clearedNumber == 4) ? Math.pow(1.5, twoWayKakuseiNumber) : 1;
  }
  // 加珠倍率 = (1 + 消除加珠的数量 * 0.06) * (1 + 全体加珠觉醒所持数量 * 0.05)
  var getEnchantedBonus = function(enchantedNumber, enchantedKakuseiNumber) {
    return (1 + enchantedNumber * 0.06) * (1 + enchantedKakuseiNumber * 0.05);
  }

  var chara = {
    hp: 3000, //血量
    atk: 1000, //攻击力
    rcv: 500, //回复
    type: [], //TYPE
    mainAttr: 2, //主属性
    subAttr: 0, //副属性
    skill: skillId, //技能ID
    cooldown: 3, //技能CD
    kakusei: [], //觉醒

    isLeader: 0, //是否为队长
    disabled: 0, //是否被绑
  };

  var team = {
    members: [],
    hp: 0,
    kakusei: [],

    init: function(arr) {
      this.members.push();
    },

    /**
     * 处理多串combo
     * @param  {number[][][]} clearedOrbs [description]
     * @return {[type]}             [description]
     */
    _handleCombos: function(clearedOrbs) {
      clearedOrbs = clearedOrbs || [];
      clearedOrbs.forEach(function(item) {
        this._handleSingleCombo(item);
      }, this)
    }
    /**
     * 处理单次combo的伤害转换
     * @param  {number[][]} comboArr [description]
     * @return {[type]}     [description]
     */
    _handleSingleCombo: function(comboArr) {
      comboArr = comboArr || [];
      var orbType = comboArr[0][1],
          clearedNumber = comboArr.length,
          enchantedKakuseiNumber = 123;
          enchantedNumber = 0;
      // 计算加珠个数
      comboArr.forEach(function(item) {
        if (item[2] > 0) enchantedNumber += 1;
      });
      
      var b1 = getClearedNumberBonus(clearedNumber),
          b2 = getEnchantedBonus(enchantedNumber, enchantedKakuseiNumber);


      // 对每个队员遍历, 检查主副属性
      this.members.forEach(function(item) {
        var mainBonus = (item.mainAttr == orbType) ? 1 : 0,
            subBonus = (item.subAttr == orbType) ? (item.subAttr == item.mainAttr ? 0.1 : 0.3333333) : 0;
            twoWayKakuseiNumber = item.kakusei.reduce(function(a,b){return (b==23)?a+1:a},0);
        // TODO: 获得二体攻击对应编号
        



        var b3 = getTwoWayBonus(clearedNumber, twoWayKakuseiNumber);
        mainDmg = mainBonus * b1 * b2 * b3;
        subDmg = subBonus * b1 * b2 * b3;
      })
    }


  };
  module.exports = team;
});