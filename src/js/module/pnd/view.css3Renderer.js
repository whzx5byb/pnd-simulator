'use strict';
define(function(require, exports, module) {
  var combos = 0;
  var functions = {
    /**
     * 初始化画布, 添加功能性的div层
     * @return {[type]} [description]
     */
    initCanvas: function() {
      var canvas = document.getElementById(this.canvasId),
          boardW = this.boardWidth, 
          boardH = this.boardHeight,
          bgSrc = this.bgSrc,
          html = '' +
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
    initOrbContainer: function() {
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
          orbContainer.id = 'orb_' + j + '_' + i;
          orbContainer.style.cssText = 'position: absolute; -webkit-transition: linear ' + this.transition / 1000 + 's;' +
            'width:' + cellW + 'px;' +
            'height:' + cellH + 'px;' +
            '-webkit-transform: translate3d(' + j * cellW + 'px, ' + i * cellH + 'px, 0)';
          this.orbContainers.push(orbContainer);

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
     * 消除珠子
     * @param  {[type]} arr [description]
     * @return {Promise Object}     [description]
     */
    clearOrbs: function(clearedOrbs) {
      combos += 1;
      var c = combos>12?12:combos;
      setTimeout(function(){
        document.getElementById('se'+c).play();
      },50);
      console.log('clear!:', clearedOrbs.map(function(i){return i[0]}))
      clearedOrbs.forEach(function(item) {
        //this.orbs[item].style.opacity = 0;
        this.orbContainers[item[0]+30].childNodes[0].style.webkitOpacity = 0;
        

        //this.orbContainers[item[0]+30].childNodes[0].src = this.transparentImg;
        
      }, this);
    },
    moveOrbs: function(movedOrbs) {
      var x, y,
        cellW = this.cellWidth,
        cellH = this.cellHeight,
        sizeX = this.boardSizeX,
        sizeY = this.boardSizeY,
        start = movedOrbs.start || [],
        end = movedOrbs.end || [],
        skyfall = movedOrbs.skyfall || [],
        skyfallStart = movedOrbs.skyfallStart || [];

      var pre = this.orbSrcPrefix,
          suf = this.orbSrcSuffix,
          names = this.orbNames;

      // 如果有天降, 先绘出天降珠子
      if (skyfallStart.length > 0) {
        skyfallStart.forEach(function(item, index) {
          this.orbContainers[item+30].childNodes[0].style.webkitOpacity = 1;
          this.orbContainers[item+30].childNodes[0].src = pre + names[skyfall[index][1]] + suf;
        }, this);
      }
      
      //console.log('before:', this.orbContainers, '[0]=', this.orbContainers[0])

      var emptyOrbs = movedOrbs.empty;
      // 保存对原来所有珠子的引用
      var oldContainers = this.orbContainers.concat();
      // 处理下落部分
      end.forEach(function(item, index) {
        this.orbContainers[item+30] = oldContainers[start[index]+30];
      }, this);
      // 处理天降珠子部分
      skyfallStart.forEach(function(item, index) {
        this.orbContainers[item+30] = oldContainers[emptyOrbs[index]+30];
      }, this);
      

      // 交换下落前后的珠子的引用
      // start.forEach(function(item, index) {
      //   var temp = this.orbContainers[item+30];
      //   this.orbContainers[item+30] = this.orbContainers[end[index]+30];
      //   this.orbContainers[end[index]+30] = temp;
      // }, this);

      //console.log('after:',this.orbContainers, '[0]=', this.orbContainers[0])
      this.orbContainers.forEach(function(item, index) {

        var xx = index % sizeX,
            yy = Math.floor(index / sizeX);
        item.style.webkitTransform = 'translate3d(' + xx*cellW + 'px,' + yy*cellH + 'px,0)';
      }, this)
      
    }
  }

  
  
  module.exports = {
    initRenderer: function(obj) {
      [
        'initCanvas', 
        'initOrbContainer',
        'clearOrbs',
        'moveOrbs'
      ].forEach(function(item){
        obj['r_' + item] = functions[item];
      })
    }
  }
});
