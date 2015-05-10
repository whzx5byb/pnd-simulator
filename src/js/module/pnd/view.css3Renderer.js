/**
 * 用CSS3对界面进行渲染
 * 
 * 珠子盘面的模型如下:
 *   设盘面大小为6x5, 则建立60个div>img;
 *   前30个为临时绘制天降珠子用, 其中img的src设为透明1x1;
 *   后30个为绘制版面珠子用, img的src设为对应的珠子图像;
 *   
 *   在orbContainers属性里, 严格按顺序保存对这60个div元素的引用;
 *   通过this.getOrbContainerAt(sx, sy)方法, 可以获得对第sx列, 第sy行的div元素的引用;
 *
 *   用指针移动珠子时, 先交换orbContainers中的索引
 *   消除珠子时, 只修改对应的img元素的src
 *   珠子下落和天降过程时, 先计算出将要移动位置的珠子的起始位置和终点位置, 然后交换orbContainer中的索引.
 *   
 *  
 */
define(function(require, exports, module) {
  'use strict';
  var gOriginOrb,gGhostOrb, gPre, gSuf, gNames, sizeX, cellW, cellH,
      Q = require('q'),
      orbContainers = [];
  function uniqueArray(arr) {
    return arr.sort().reduce(function(previous, current, index, array){
      if (current != arr[index+1]) {
        previous.push(current);
      }
      return previous;
    },[])
  }
  function setVendor(element, prop, value) {
    var capProp;
    if (typeof prop == 'object') {
      for (var i in prop) {
        setVendor(element, i, prop[i]);
      }
      return;
    }
    if ( prop in element.style ) {
      element.style[prop] = value;
    } else {
      capProp = prop.charAt(0).toUpperCase() + prop.slice(1);
      element.style["Webkit" + capProp] = value;
      element.style["Moz" + capProp] = value;
      element.style["ms" + capProp] = value;
      element.style["O" + capProp] = value;
    }
  };
  /**
   * 绘制指定索引处的珠子产生的移动
   * 移动目标位置为该索引指定的目标
   * @param  {[type]} indexes [description]
   * @return {[type]}         [description]
   */
  function renderOrbMoving(indexes, option) {
    var len = indexes.length,
    option = option || {};

    // TODO: 将空珠移除transition后再移动, 减少动画
    return Q.Promise(function(resolve, reject, notify){
      var onTransitionEnd = function() {
        len -= 1;
        console.log(len)
        this.removeEventListener('webkitTransitionEnd', onTransitionEnd, false);
        if (len == 0) {resolve();}
      }
      indexes.forEach(function(item) {
        var sx = item % sizeX, 
            sy = Math.floor(item / sizeX);
        option['transform'] = 'translate3d(' + sx * cellW + 'px,' + sy * cellH + 'px,0)';

        orbContainers[item].addEventListener('webkitTransitionEnd', onTransitionEnd, false);
        setVendor(orbContainers[item], option);
      });
    });
    
  };
  /**
   * 绘制珠子消失的过程
   * @param  {[type]} indexes [description]
   * @return {[type]}         [description]
   */
  function renderOrbDisappearing(indexes) {
    var len = indexes.length;
    

    return Q.Promise(function(resolve, reject, notify){
      var onTransitionEnd = function() {
        len -= 1;
        this.removeEventListener('webkitTransitionEnd', onTransitionEnd, false);
        if (len == 0) {resolve();}
      }
      indexes.forEach(function(item) {
        orbContainers[item]['childNodes'][0].addEventListener('webkitTransitionEnd', onTransitionEnd, false);
        setVendor(orbContainers[item]['childNodes'][0], {'opacity': 0});
      });
    });

  }
  /**
   * 绘制珠子出现时的过程
   * @param  {[type]} indexes [description]
   * @param  {[type]} orbs    [description]
   * @return {[type]}         [description]
   */
  function renderOrbAppearing(indexes, skyfall) {
    indexes.forEach(function(item, index) {
      var obj = orbContainers[item]['childNodes'][0];
      setVendor(obj, {'opacity': 1});
      // TODO: 处理加珠生成.
      obj.src = gPre + gNames[skyfall[index][1]] + gSuf;
    })
  }
  /**
   * 绘制连击提示文字
   * @return {[type]} [description]
   */
  function renderComboString(indexes) {

    // 获取文字应该显示的位置
    

  }
  var methods = {
    /**
     * 初始化画布, 添加功能性的div层
     * @return {[type]} [description]
     */
    _initCanvas: function() {
      var canvas = document.getElementById(this.canvasId),
          boardW = this.boardWidth, 
          boardH = this.boardHeight,
          bgSrc = this.bgSrc;



      var html = '' +
            '<div id="pndSceneDiv" style="">' +
            '  <div id=""></div>' +
            '  <div id="pndTeambarDiv"></div>' +
            '  <div id="pndLifebarDiv"></div>' +
            '</div>' +
            '<div id="pndBoardDiv" style="width:${boardW}px; height:${boardH*2}px; background: url(${bgSrc}) bottom no-repeat; background-size: ${boardW}px ${boardH}px;">' +
            '</div>' +
          '';

      html = html.replace(/\$\{(.*?)\}/g, function(str, s1){
        return eval(s1);
      });


      this.canvasDiv = canvas;
      this.canvasDiv.innerHTML = html;
      this.teambarDiv = document.getElementById('pndTeambarDiv');
      this.lifebarDiv = document.getElementById('pndLifebarDiv');
      this.boardDiv = document.getElementById('pndBoardDiv');
    },
    /**
     * 初始化珠盘方格, 预载入珠子图像
     * @return {[type]} [description]
     */
    _initOrbContainer: function() {
      var temp = document.createDocumentFragment(),
          sizeX = this.boardSizeX,
          sizeY = this.boardSizeY,
          cellW = this.cellWidth,
          cellH = this.cellHeight,
          orbW = this.orbWidth,
          orbH = this.orbHeight;
      // TODO: 说好的预载入呢?
      // 循环创建珠子个数x2个div
      for (var i = 0; i < sizeY * 2; i++) {
        for (var j = 0; j < sizeX; j++) {
          // 创建单个的珠子容器
          var orbContainer = document.createElement('div');
          setVendor(orbContainer, {
            'position': 'absolute',
            'width': cellW + 'px',
            'height': cellH + 'px',
            'transitionDuration': this.transition/1000 + 's',
            'transform': 'translate3d(' + j * cellW + 'px, ' + i * cellH + 'px, 0)'
          })
          orbContainers.push(orbContainer);

          // 创建单个珠子
          var orb = document.createElement('img');
          orb.src = this.transparentImg;
          orb.width = orbW;
          orb.height = orbH;
          orb.style.cssText = '-webkit-transition:' + this.comboInterval / 1000 + 's';
          // 分配前一半给天降珠子使用
          if (j + i * sizeX < 30) {
            this.skyfallOrbs.push(orb);
          } else {
          // 后一半为版面珠子
            this.orbs.push(orb);
          }
          orbContainer.appendChild(orb);

          temp.appendChild(orbContainer);
        }
      }
      this.boardDiv.appendChild(temp);
    },
    /**
     * 绘制珠子的消除过程
     * @param  {number[][]} 要消除的珠子
     * @return {Promise Object} [description]
     */
    _renderClearing: function(indexes) {
      // TODO: 用webkitTransitEnds事件, 实现消除后再跳combo, 消除后再将src变为透明
      return renderOrbDisappearing(indexes).then(function(){
        return renderComboString(indexes)
      });
    },
    /**
     * 绘制珠子的掉落过程
     * @param  {[type]} movedOrbs [description]
     * @return {[type]}           [description]
     */
    _renderFalling: function(empty, start, end, skyfall, skyfallStart) {
      var x, y,
          cellW = this.cellWidth,
          cellH = this.cellHeight,
          sizeX = this.boardSizeX,
          sizeY = this.boardSizeY,
          pre = this.orbSrcPrefix,
          suf = this.orbSrcSuffix,
          names = this.orbNames;

      // 如果有天降, 先绘出天降珠子
      if (skyfallStart.length > 0) {
        renderOrbAppearing(skyfallStart, skyfall);
      }
      
      
      
      var oldContainers = orbContainers.concat();
      // 处理下落部分
      end.forEach(function(item, index) {
        orbContainers[item] = oldContainers[start[index]];
      }, this);
      // 处理天降珠子部分
      skyfallStart.forEach(function(item, index) {
        orbContainers[item] = oldContainers[empty[index]];
      }, this);
      

      // TODO: 
      // 1. 只修改有变动的珠子的DOM
      // 2. 对空珠, 临时修改transition为0, 减少不必要的动画
      
      return renderOrbMoving(uniqueArray(start.concat(end)), {'transition': 'transform linear 0.25s'});
      
    },

    _getOrbContainerAt: function(sx, sy) {
      var s = sy * this.boardSizeX + sx;
      if (sx < this.boardSizeX && sy < this.boardSizeY * 2 && s >= this.amount && s < this.amount * 2) {
        return orbContainers[s];
      } else {
        return null;
      }
    },

    /**
     * 绘制指针点选时, 珠子被选中的过程
     * @param  {[type]} obj 被选中的珠子
     * @param  {[type]} x   该珠子的分身将被绘制的初始坐标x
     * @param  {[type]} y   该珠子的分身将被绘制的初始坐标y
     * @return {[type]}     [description]
     */
    _renderSelectingOrb: function(obj, x, y) {
      // 将选中的珠子透明化处理
      gOriginOrb = obj;
      setVendor(obj, {'transition': '0s', 'opacity': 0.4});

      // 创建跟随指针移动的提示珠
      // TODO: 将提示珠缓存起来, 而不是每次用完就删掉
      var newOrb = obj.cloneNode(true);
      newOrb.id = 'gGhostOrb';
      newOrb.childNodes[0].width = this.orbWidth*1.2;
      newOrb.childNodes[0].height = this.orbWidth*1.2;
      setVendor(newOrb, {
        'opacity': 0.8,
        'width': this.orbWidth*1.2 + 'px',
        'height': this.orbHeight*1.2 + 'px',
        'left': '0px', 
        'top': '0px', 
        'transform': 'translate3d(' + x + 'px,' + y + 'px,0)'
      });

      gGhostOrb = newOrb;
      this.canvasDiv.appendChild(gGhostOrb);
    },

    /**
     * 绘制用指针选中珠子时, 提示珠移动的过程
     * @param  {[type]} x [description]
     * @param  {[type]} y [description]
     * @return {[type]}   [description]
     */
    _renderMovingGhostOrb: function(x, y) {
      setVendor(gGhostOrb, {'transform': 'translate3d(' + x + 'px,' + y + 'px,0)'});
    },
    /**
     * 绘制交换两颗珠子的过程
     * @param  {[type]} index1 [description]
     * @param  {[type]} index2 [description]
     * @return {[type]}    [description]
     */
    _renderExchangingOrb: function(index1, index2) {
      // 在珠子元素数组里, 交换两颗珠子的引用
      var temp = orbContainers[index1];
      orbContainers[index1] = orbContainers[index2];
      orbContainers[index2] = temp;

      // 绘制发生变动的珠子
      renderOrbMoving([index1, index2], {'transitionDuration': '0.05s'});
    },
    /**
     * 绘制指针离开, 取消选中珠子的过程
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    _cancelSelectingOrb: function() {
      console.log('select end')
      gGhostOrb.parentNode.removeChild(gGhostOrb);
      
      setVendor(gOriginOrb, {'transitionDuration': '0.25s', 'opacity': 1});
    },

    


  }

  
  
  module.exports = {
    init: function(obj) {
      gPre = obj.orbSrcPrefix;
      gSuf = obj.orbSrcSuffix;
      gNames = obj.orbNames;
      sizeX = obj.boardSizeX; 
      cellW = obj.cellWidth;
      cellH = obj.cellHeight;

      for (var i in methods) {
        if (methods.hasOwnProperty(i)) {
          obj[i] = methods[i];
        }
      }
    }
  }
});

/*
PND处理顺序:
放开手指
依次消除版面上所有珠子
  消除时加珠依然闪动
  动画效果--该串珠子渐隐
    如果有觉醒效果, 则添加觉醒特效(U或者横排)
  动画效果开始的同时, 创建闪动的combo文本
  动画效果开始的同时, 光点移动到人物头像, 添加数字
该版面全部消除后, 开始天降效果


直到没有任何珠子可以消除了
  增加半透明遮罩
    遮罩效果下加珠不再闪烁
  开始结算
  同时将combo文本依次消去
  */
