'use strict';
define(function(require, exports, module) {
  var functions = {
    r_initCanvas: function() {
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
    r_initOrbContainer: function() {
      var temp = document.createDocumentFragment(),
          sizeX = this.boardSizeX,
          sizeY = this.boardSizeY,
          cellW = this.cellWidth,
          cellH = this.cellHeight,
          orbW = this.orbWidth,
          orbH = this.orbHeight;
      for (var i = 0; i < sizeY * 2; i++) {
        for (var j = 0; j < sizeX; j++) {
          // 创建单个的珠子容器
          var orbContainer = document.createElement('div');
          orbContainer.id = 'orb_' + i + '_' + j;
          orbContainer.style.cssText = 'position: absolute; -webkit-transition: ease-in ' + this.transition / 1000 + 's;' +
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
          if (j + i * sizeX < 30) {
            this.skyfallOrbs.push(orb);
          } else {
            this.orbs.push(orb);
          }
          orbContainer.appendChild(orb);

          temp.appendChild(orbContainer);
        }
      }
      this.boardDiv.appendChild(temp);
    },
    r_clearOrbs: function(arr) {
      if (arr == undefined) {return;}
      for (var i = 0; i < arr.length; i ++ ) {
        delete(this.data[i]);
        this.orbs[arr[i]].style.opacity = 0;
      }
    }
  }

  
  
  module.exports = {
    initRenderer: function(obj) {
      [
        'r_initCanvas', 
        'r_initOrbContainer',
        'r_clearOrbs'
      ].forEach(function(item){
        obj[item] = functions[item]
      })
    }
  }
});
