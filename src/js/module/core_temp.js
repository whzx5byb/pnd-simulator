(function() {
  var boardWidth = 360,
      boardHeight = 300,
      boardSizeX = 6,
      boardSizeY = 5
      cellWidth = 60,
      cellHeight = 60,
      orbWidth = 58,
      orbHeight = 58,
      selectedOffsetX = 32,
      selectedOffsetY = 32,

    orbs = [
      ['fire', 1],
      ['water', 1],
      ['wood', 1],
      ['light', 1],
      ['dark', 1],
      ['heart', 1]
    ],
    skyfall = 1;




  //test
  var testArr = [
    [2, 5, 3, 5, 5, 5],
    [3, 4, 3, 1, 1, 2],
    [2, 4, 3, 0, 1, 5],
    [4, 4, 3, 1, 1, 2],
    [0, 1, 1, 1, 3, 5]
  ];
  var orbsName = ["fire", "water", "wood", "light", "dark", "heart"];



  var PAD = function(objId) {
    //this.canvas = null;

    this.canvas;
    this.orbs = [];

    this.init(objId);
    this.bindMouseEvent();
    
    
    

  }
  PAD.prototype.init = function(objId) {
    var _this = this;
    $('#browser').html(navigator.userAgent);
    // 初始化珠子盘面画布
    this.boardCanvas = new fabric.StaticCanvas('board_' + objId, {renderOnAddRemove: false});
    this.boardCanvas.setDimensions({
      width: boardWidth,
      height: boardHeight
    });
    
    
    

    for (var i = 0; i < testArr.length; i++) {
      for (var j = 0; j < testArr[i].length; j++) {
        (function(ii, jj) {
          // var rect = new fabric.Circle({
          //   radius: 25,
          //   fill: color[testArr[ii][jj]],
          //   left: jj * 50,
          //   top: ii * 50
          // });
          var oImg = new fabric.Image(document.getElementById(orbsName[testArr[ii][jj]] + 'Img'), {
            left: jj * cellWidth, 
            top: ii * cellHeight, 
            width: orbWidth, 
            height: orbHeight
          })
          _this.boardCanvas.add(oImg);
          _this.orbs.push(new Orb(oImg,{x:jj, y:ii, type:testArr[ii][jj]}));
        })(i, j);
      };
    };

    // 渲染背景
    var bg = fabric.Image.fromURL('img/bg.png', function(oImg){
      oImg.set({left:0, top:0, width: boardWidth, height: boardHeight});
      _this.boardCanvas.add(oImg);
      _this.boardCanvas.sendToBack(oImg)
    })
    
    setTimeout(function(){_this.boardCanvas.renderAll();},1000);

    // 初始化移动珠子时的画布
    this.mouseCanvas = new fabric.StaticCanvas('mouse_' + objId, {renderOnAddRemove: false});
    this.mouseCanvas.setDimensions({
      width: boardWidth,
      height: boardHeight
    });
    

  }

  


  PAD.prototype.bindMouseEvent = function() {
    var _this = this;

    this.mouseCanvas.lowerCanvasEl.addEventListener('touchstart', function(ev) {
      ev.preventDefault();
      var cx = ev.touches[0].pageX - window.scrollX,
          cy = ev.touches[0].pageY - window.scrollY,
          x = Math.floor(cx / cellWidth),
          y = Math.floor(cy / cellHeight),
          oOrb = _this.getOrb(x,y);

      if (oOrb) {
        _this.startDragging(oOrb,ev);
      }
    });
    this.mouseCanvas.lowerCanvasEl.addEventListener('touchend', function(ev) {
      ev.preventDefault();
      _this.stopDragging();
    });
    this.mouseCanvas.lowerCanvasEl.addEventListener('touchmove', function(ev) {
      ev.preventDefault();
      if (_this.draggingFlag) {
        _this.dragOrb(ev);
      }
    });

    /*$(this.mouseCanvas.lowerCanvasEl).on('touchstart mousedown', function(ev) {
      
      // 检测点击位是否有珠子
      var cx = ev.clientX || ev.originalEvent.touches[0].pageX - window.scrollX,
          cy = ev.clientY || ev.originalEvent.touches[0].pageY - window.scrollY,
          x = Math.floor(cx / cellWidth),
          y = Math.floor(cy / cellHeight),
          oOrb = _this.getOrb(x,y);


      if (oOrb) {
        _this.startDragging(oOrb,ev);
      }
      
    }).on('touchend mouseup', function(ev) {
      $('#log').html('touchend');
      _this.stopDragging();
    }).on('touchmove mousemove', function(ev) {
      
      if (_this.draggingFlag) {
        _this.dragOrb(ev);
      }
    })*/
    

    function isOrb(obj) {
      return true;
    }
  }

  PAD.prototype.startDragging = function(orb, e) {
    $('#log').html('startDragging');
    var _this = this,
        orbObj = orb.obj;
    this.draggingFlag = 1;
    
    // 将选中珠子复制后绘制在鼠标动作层上
    // NOTICE: fabricjs对图像clone时会再次请求图像地址执行回调函数。
    var type = orbsName[orb.type];
    var newOrb = new fabric.Image(document.getElementById(type + 'Img'), {
      // 处理起始坐标
      width: orbWidth, 
      height: orbHeight
    })
    this.mouseCanvas.add(newOrb);

    // 将原珠透明处理
    orbObj.opacity = 0.6;
    this.boardCanvas.renderAll();

    // 
    this.originOrb = orb;
    this.movingOrb = newOrb;
    /*newOrb.selectable = false;
    this.mouseCanvas.add(newOrb);
    obj.opacity = 0.6;

    for (var o = 0; o < this.orbs.length; o ++) {
      // TODO: 是否有更好的比较方法？
      if (this.orbs[o].obj.left == obj.left && this.orbs[o].obj.top == obj.top) {
        this.originOrb = this.orbs[o];
        
        break;
        //TODO: 错误处理
      }
    }
    this.movingOrb = newOrb;*/

    
  }
  PAD.prototype.dragOrb = function(ev) {
    var x = ev.touches[0].pageX - window.scrollX,
        y = ev.touches[0].pageY - window.scrollY;
    console.log('moving:'+x+'|'+y)
    //$('#log').html('moving:'+x+'|'+y)
    this.movingOrb.left = x - selectedOffsetX;
    this.movingOrb.top = y - selectedOffsetY;

    this.checkMouse(x, y)

    //this.movingOrb.render(this.canvas);
    this.mouseCanvas.renderAll();
  }
  PAD.prototype.checkMouse = function(x, y) {
    var boardOrbX = Math.floor(x / orbWidth),
        boardOrbY = Math.floor(y / orbHeight);

    if ((boardOrbX !== this.originOrb.x) || (boardOrbY !== this.originOrb.y)) {
      this.exchangeOrb(this.originOrb, this.getOrb(boardOrbX, boardOrbY));
    }
    //this.boardCanvas.renderAll();
  }
  PAD.prototype.stopDragging = function(obj,e) {
    if (this.draggingFlag) {
      

      this.originOrb.obj.opacity = 1;
      this.movingOrb.remove();
      this.draggingFlag = 0;
      this.boardCanvas.renderAll();
      this.mouseCanvas.renderAll();
    }
  }
  PAD.prototype.exchangeOrb = function(orb1, orb2) {
    var o1 = orb1.obj,
        o2 = orb2.obj, 
        l1 = o1.left,
        t1 = o1.top,
        x1 = orb1.x,
        y1 = orb1.y;

    

    /*//
    o1.animate('left',o2.left,{duration:100});
    o1.animate('top',o2.top,{duration:100});
    o2.animate('left',l1,{duration:100});
    o2.animate('top', t1,{duration:100})
    /*/
    o1.left = o2.left;
    o1.top = o2.top;
    o2.left = l1;
    o2.top = t1;
    //*/
    
    
    
    orb1.x = orb2.x;
    orb1.y = orb2.y;
    orb2.x = x1;
    orb2.y = y1;
    this.boardCanvas.renderAll();
  }
  PAD.prototype.getOrb = function(x, y) {
    for (s in this.orbs) {
      if (this.orbs[s].x == x && this.orbs[s].y == y) {
        return this.orbs[s]; 
      }
    }
    return false;
  }
  PAD.prototype.getCoordinate = function(obj) {
    var x = obj.left / orbWidth,
        y = obj.top / orbHeight;

    // TODO: 检查数据有效性

    return [x,y];
  }

  var Orb = function(obj, param) {
    this.x = param.x;
    this.y = param.y;
    this.type = param.type;
    this.obj = obj;
    this.isSelected;

    
  }
  

  window.PAD = PAD;
})();
