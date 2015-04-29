define(function(require, exports, module) {
  'use strict';

  var option = {
    // 全局选项
    logMode: 1, // 事件日志模块开关

    // 数据模型选项
    boardSizeX:     6, // 横向珠子个数
    boardSizeY:     5, // 纵向珠子个数
    typeNum:        8, // 最大珠子类型数(火水木光暗心毒废)
    gravity:        [0, 1], // 天降时的重力方向, 即珠子掉落方向
    skyfallBases:   [1, 1, 1, 0, 0, 1, 0, 0], // 天降珠子的基础权重, 1 表示有天降, 0 表示无天降
    skyfallWeights: [0, 0, 0, 0, 0, 0, 0, 0], // 使用技能时天降珠子的加成权重
    canvasId:       'pndCanvas', // 画布元素id    
    orbSrcPrefix:   'img/', // 珠子图片路径前缀
    orbSrcSuffix:   '.png', // 珠子图片路径后缀
    orbNames:       ["fire", "water", "wood", "light", "dark", "heart", "poison", "disturb"],
    transparentImg: 'img/1x1.png', // 无珠子时的透明图片文件路径
    bgSrc:          'img/bg.png', // 版面背景图片路径
    canvasWidth:    360, // 画布宽度
    canvasHeight:   600, // 画布高度
    boardWidth:     360, // 珠子版面宽度
    boardHeight:    300, // 珠子版面高度
    orbWidth:       58, // 珠子物体宽度
    orbHeight:      58, // 珠子物体高度
    // UI动画效果选项
    animation:     1, // 动画效果开关
    comboInterval: 500, // combo计算间隔(ms)
    transition:    250,
    // UI声音效果选项
    se: 1,


    // 几率模拟器选项
    testTimes: 50000 // 默认模拟次数
  };
  module.exports = option;
});
