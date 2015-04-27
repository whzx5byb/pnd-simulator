var Pnd = (function(pnd) {
  
  var option = {
    // 全局选项
    logMode: 1,                                 // 事件日志模块开关

    // 数据模型选项
    boardSizeX: 6,                              // 横向珠子个数
    boardSizeY: 5,                              // 纵向珠子个数
    typeNum: 8,                                 // 最大珠子类型数(火水木光暗心毒废)
    gravity: [0, 1],                            // 天降时的重力方向, 即珠子掉落方向
    skyfallBases: [1, 1, 1, 1, 1, 1, 0, 0],     // 天降珠子的基础权重, 1 表示有天降, 0 表示无天降
    skyfallWeights: [0, 0, 0, 0, 0, 0, 0, 0],   // 使用技能时天降珠子的加成权重

    // 静态UI选项
    canvasId: 'pndCanvas',                      // 画布元素id    
    orbSrcPrefix: 'img/',                       // 珠子图片路径前缀
    orbSrcSuffix: '.png',                       // 珠子图片路径后缀
    orbNames: ["fire", "water", "wood", "light", "dark", "heart", "poison", "disturb"],
                                                // 珠子图片文件命名
    transparentImg: 'img/1x1.png',              // 无珠子时的透明图片文件路径
    bgSrc: 'img/bg.png',                        // 版面背景图片路径
    canvasWidth: 360,                           // 画布宽度
    canvasHeight: 600,                          // 画布高度
    boardWidth: 360,                            // 珠子版面宽度
    boardHeight: 300,                           // 珠子版面高度
    orbWidth: 58,                               // 珠子物体宽度
    orbHeight: 58,                              // 珠子物体高度
    // UI动画效果选项
    animation: 1,                               // 动画效果开关
    comboInterval: 500,                         // combo计算间隔(ms)
    // UI声音效果选项
    se: 1,


    // 几率模拟器选项
    testTimes: 50000                            // 默认模拟次数
  }

  
  pnd.init = function(opt) {
    
    var opt = opt || option,
        view = new this.View(opt),
        model = new this.Model(opt),
        presenter;
    opt.view = view;
    opt.model = model;

    presenter = new this.Presenter(opt);
    return presenter;
  }
  pnd.initTester = function(opt) {
    var opt = opt || option,
        model = new this.Model(opt),
        tester;
    opt.model = model;

    tester = new this.Tester(opt);
    return tester;
  }
  return pnd;
})(Pnd || {});



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


    $(this.mouseCanvas.lowerCanvasEl).on('touchstart mousedown', function(ev) {
      
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
    })
    

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
    var x = ev.clientX || ev.originalEvent.touches[0].pageX - window.scrollX,
        y = ev.clientY || ev.originalEvent.touches[0].pageY - window.scrollY;
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
      $('#log').html('stopDragging');

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

var Pnd = (function(pnd) {

  var Model = function(opt) {
    this.sizeX = opt.boardSizeX;      
    this.sizeY = opt.boardSizeY;    
    this.amount = this.sizeX * this.sizeY;
    this.typeNum = opt.typeNum;  
    this.gravity = opt.gravity;
    this.skyfallBases = opt.skyfallBases;
    this.skyfallWeights = opt.skyfallWeights;

    this.dataArr = [];
    this.skyfallArr = [];
    

    this.init(opt);
  }
  
  /**
   * 初始化珠盘数据模型
   * 珠子用[index, type, isPlus]的数组来表示
   * @return {void}
   */
  Model.prototype.init = function(opt) {
    this.matchModel = new pnd.MatchModel(opt);

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
    for (var i = 0; i < amount; i ++) {
      this.dataArr[i] = [i, -1, 0];
    }
  }
  /**
   * 使用天降配置填满珠盘
   * @return {[type]} [description]
   */
  Model.prototype.fulfill = function() {
    var n = this._getEmptyNum();
    this.getOrbsBySkyfall(n);
  }
  


  // 根据天降配置和版面生成天降数组
  Model.prototype.getOrbsBySkyfall = function() {
    // 获得无排列顺序的珠子数组
    var emptyOrbs = this._getEmptyOrbs();
    var arr = Model.getOrbsByRates(emptyOrbs.length, this.skyfallArr);
    // 根据当前版面空缺情况, 获得天降珠子的位置排列
    emptyOrbs.forEach(function(){
      
    })
    
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

  // 获得当前盘面珠子数量
  Model.prototype.getOrbsNum = function() {
    var amount = this.amount, n = 0, arr = [], typeNum = this.typeNum, d;
    for (var i = 0; i < typeNum; i ++) {
      arr[i] = 0;
    }
    for (var i = 0; i < amount; i ++ ) {
      d = this.data[i][1];
      arr[d] = (arr[d] == undefined) ? 1 : arr[d] + 1;
    }
    return arr;
  }

  // 发出消除指令
  Model.prototype.matchBoardByRule = function() {
    // 获取消除的珠子坐标
    var matchedOrbs = [[0,1,2,3],[12,13,14,15],[25,26,27],[11,17,23,29]];
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
    for (var i = 0; i < am; i ++) {
      movedOrbs[i] = i;
    }
    
    matchedOrbs = matchedOrbs || [];
    
    // 遍历每个消除的珠子坐标,获得它"上方"受到重力作用的珠子的坐标, 以及下落的最终位置
    var t = matchedOrbs.join(',').split(',');
    for (var i = 0, len = t.length; i < len; i ++) {
      if (t[i] == '') {continue;}
      delete(movedOrbs[t[i]]);
      var x = t[i] % sx, y = Math.floor(t[i] / sx);

      // 判定位于x,y坐标的珠子"上方"是否有珠
      while (x * gx + sxh > sxh * gx && y * gy + syh > syh * gy) {
        // 若有则将坐标向重力反方向移动一格,该位置的珠重力移动量+1
        x = x - gx;
        y = y - gy;
        if (!isNaN(movedOrbs[y*sx + x])) {movedOrbs[y*sx + x] += gx + gy * sx;}
        
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
    this.skyfallArr = Model.getSkyfallRates(this.skyfallBases, this.skyfallWeights);
  }

  /**
   * 获取当前盘面空珠的位置
   * @return {number[]} 空珠的位置
   */
  Model.prototype._getEmptyOrbs = function() {
    var amount = this.amount,
        arr = [];

    this.dataArr.forEach(function(item, index){
      if (item[1] == -1) {arr.push[index];}
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
  Model.getSkyfallRates = function(sfBases, sfWeights) {
    // 最终概率 = (基础概率 + 额外技能概率) / (1 + 额外技能概率之和/100)
    // 基础概率 = 1 / 出现的珠子类别数量 * 该珠出现与否
    var len = sfBases.length,
        orbTypes = 0,
        sum = 0,
        temp = 0,
        ret = [];

    for (var i = 0; i < len; i ++) {
      // 基础权重中大于0的全部置1
      sfBases[i] = (sfBases[i] > 0) ? 1 : 0;
      // 统计珠子类别数量和额外技能概率之和
      orbTypes += sfBases[i];
      sum += sfWeights;
    }
    for (i = 0; i < len; i ++) {
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
  Model.getOrbsByRates = function(arr, amount) {
    var amount = amount || 30,
        ret = [],
        rnd = 0,
        len = arr.length;

    for (var i = 0; i < amount; i ++) {
      rnd = Math.random();
      for (var j = 0; j < len; j ++) {
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

  pnd.Model = Model;
  return pnd;
})(Pnd || {});
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

var Pnd = (function(pnd) {

  
  // 定义路线模型
  var routeModel = function() {

  }

  // 定义路线类
  // 路线用-隔开坐标,相邻两坐标横纵坐标大于1时自动认定为ctw. 例如1,1-1,2-1,3-3,3-3,2
  var Route = function(str) {
    this.originStr = '';
    this.length = 0;
    this.ctwFlag = 0;
    this.concatChar = '-';
    this.fromString(str);
  }
  Route.isNearby = function(coor1, coor2) {
    if (Math.abs(coor1[0] - coor2[0]) > 1 || Math.abs(coor1[1] - coor2[1]) > 1) {
      return false;
    } else {
      return true;
    }
  }
  Route.isNeighbour = function(coor1, coor2) {
    if (Math.pow(coor1[0] - coor2[0], 2) + Math.pow(coor1[1] - coor2[1], 2) - 1 < 0.001) {
      return true;
    } else {
      return false;
    }
  }
  Route.prototype.fromString = function(str) {
    this.originStr = str;
    this.parseString(str);
  }
  Route.prototype.parseString = function(s) {
    var str = s,
        concat = this.concatChar,
        arr = [];

    // 解开连接符
    arr = str.split(concat);

    // 检查坐标
    for (var i = 0, len = arr.length; i < len; i ++ ) {
      arr[i] = arr[i].split(',');

      if (i > 0) {
        if (Route.isNearby(arr[i-1], arr[i])) {
          this.length += 1;
        } else {
          this.ctwFlag += 1;
        }
      }
    }

  }
  Route.prototype.toString = function() {
    return this.originStr;
  }
  


  pnd.Route = Route;
  return pnd;
})(Pnd || {})

var Pnd = (function(pnd) {
  var Presenter = function(opt) {
    this.view = opt.view;
    this.model = opt.model;
  }
  Presenter.prototype.begin = function() {
    this.model.matchAndDrop();
  }

  pnd.Presenter = Presenter;
  return pnd;
})(Pnd || {})
var Pnd = (function(pnd) {
  // 定义版面数据类
  
  var Tester = function(opt) {
    this.times = opt.testTimes;
    this.model = opt.model;


    // return {
    //   test: function(func1, func2) {
    //     var o = new Pnd.Board(opt), n = 0;
    //     for (var i = 0; i < times; i ++ ) {
    //       func1.apply(o);
    //       result = o.getOrbsNum();
    //       result.fire = result[0];
    //       result.water = result[1];
    //       result.wood = result[2];
    //       result.light = result[3];
    //       result.dark = result[4];
    //       result.heart = result[5];
    //       if (func2(result)) {
    //         n += 1;
    //       }
    //     }
    //     return n / times;
    //   }
    // }
  }
  /**
   * 设定测试内容
   * @param {function}
   */
  Tester.prototype.setTest = function(func) {

  }
  /**
   * 设定测试的期望结果
   * @param {function} exp 
   */
  Tester.prototype.setExpectations = function(exp) {

  }
  /**
   * 开始测试
   * @param  {number} 
   * @return {[type]}
   */
  Tester.prototype.run = function(times) {
    var model = this.model,
        times = times || this.times;
        
    for (var i = 0; i < times; i ++) {
      func1.apply(this.model);
    }
  }

  pnd.Tester = Tester;
  return pnd;
})(Pnd || {});




var Pnd = (function(pnd) {

  var View = function(opt) {
    this.transparentImg = opt.transparentImg;
    this.orbSrcPrefix = opt.orbSrcPrefix;
    this.orbSrcSuffix = opt.orbSrcSuffix;
    this.orbNames = opt.orbNames;
    this.bgSrc = opt.bgSrc;
    this.canvasWidth = opt.canvasWidth;
    this.canvasHeight = opt.canvasHeight;
    this.boardWidth = opt.boardWidth;
    this.boardHeight = opt.boardHeight;
    this.boardSizeX = opt.boardSizeX;
    this.boardSizeY = opt.boardSizeY;
    this.cellWidth = this.boardWidth / this.boardSizeX;
    this.cellHeight = this.boardHeight / this.boardSizeY;
    this.orbWidth = opt.orbWidth;
    this.orbHeight = opt.orbHeight;
    this.orbMargin = this.cellWidth - this.orbWidth;
    this.animFlag = opt.animFlag;       // 动画效果开关
    this.comboInterval = opt.comboInterval; // combo计算间隔(ms)
    this.canvasId = opt.canvasId;

    this.rendering = 1;  //0: 不支持css3的浏览器; 1: css3动画; 2: canvas绘图库

    this.canvasObj = {};
    this.boardObj = {};
    this.orbContainers = [];
    this.orbs = [];
    
    this.data = Array(this.boardSizeX * this.boardSizeY);
    
    this.init();
  }

  /**
   * 初始化UI
   * @return {[type]}
   */
  View.prototype.init = function() {
    this._renderContainer();
    //this._bindUserEvent();
  }
  /**
   * 根据浏览器版本自动设置渲染方式
   */
  View.prototype.autoSetRendering = function() {
    this.setRendering(1);
  }
  View.prototype.setRendering = function(para) {
    this.rendering = para;
  }
  /**
   * 绑定用户事件, 在准备接受用户输入时调用
   * @return {[type]}
   */
  View.prototype.bindBoardEvent = function() {
    if (true) {
      this.bindMouseEvent();
    } else {
      this.bindTouchEvent();
    }
  }
  /**
   * 取消绑定用户事件, 在播放动画前调用
   * @return {[type]}
   */
  View.prototype.unbindBoardEvent = function() {

  }

  View.prototype._bindMouseEvent = function() {
    var canvas = this.canvasObj;
    canvas.addEventListener('mousedown', function(ev) {
      
    });
    canvas.addEventListener('mouseup', function(ev) {

    })
  }

  // 显示版面
  View.prototype.show = function(arr) {
    var pre = this.orbSrcPrefix,
        suf = this.orbSrcSuffix,
        names = this.orbNames,
        arr = arr || [];
    for (var i = 0, len = arr.length; i < len; i ++) {
      if (typeof arr[i] != 'object') {
        arr[i] = {type:arr[i], plus:0}
      }
      this.data[i] = arr[i];
      this.orbs[i].src = pre + names[arr[i].type] + suf;
    }
  }
  // 清空版面
  View.prototype.empty = function() {
    for (var i = 0, len = this.orbs.length; i < len; i ++) {
      delete(this.data[i]);
      this.orbs[i].src = this.transparentImg;
    }
  }
  View.prototype.handle = function(opt) {
    this.eliminate(opt.matchedOrbs, function(){
      this._moveOrbsTo(opt.movedOrbs)
    });
  }
  
  View.prototype.eliminate = function(matchedOrbs, callback) {
    var arr = [],
        interval = this.comboInterval,
        _this = this,
        self = arguments.callee,
        remain = [];

    if (matchedOrbs.length > 0) {
      arr = matchedOrbs[0];
      remain = matchedOrbs.slice(1);

      this._eliminateSingle(arr, function(){self.call(_this, remain, callback)});
    } else {
      callback.call(this);
    }
  }
  // 消除单串珠子
  View.prototype._eliminateSingle = function(arr, callback) {
    var interval = this.comboInterval,
        _this = this;

    // 消除珠子
    if (arr == undefined) {callback();return;}
    for (var i = 0; i < arr.length; i ++ ) {
      delete(this.data[i]);
      this.orbs[arr[i]].style.opacity = 0;
    }
    // 显示combo数


    // 动画结束后的回调
    if (this.animation) {
      setTimeout(function(){
        callback.call(_this);
      }, interval);
    } else {
      callback.call(this);
    }
  }

  // 掉落珠子
  View.prototype.drop = function() {
    this._moveOrbsTo([0,1,2,3,4,5],[12,13,14,15,16,17])
  }

  // 
  View.prototype._moveOrbsTo = function(arr) {
    var x, y,
        cellW = this.cellWidth,
        cellH = this.cellHeight;
    //alert(m + '|' + n)
    
    for (var i in arr) {
      x = arr[i] % this.boardSizeX;
      y = Math.floor(arr[i] / this.boardSizeX),
      // 改变珠子容器坐标
      this.data[arr[i]] = this.data[i];
      delete(this.data[i]);
      this.orbContainers[i].style.webkitTransform = 'translate3d(' + x*cellW + 'px,' + y*cellH + 'px,0)';
    }

  }
  View.prototype._renderContainer = function() {
    var r = this.rendering;
    switch (r) {
      case 0: 
        this._renderContainerByDom(); 
        break;
      case 1: 
        this._renderContainerByCss3(); 
        break;
      case 2: 
        this._renderContainerByCanvas(); 
        break;
    }
  }
  View.prototype._renderContainerByCss3 = function() {
    var canvas = document.getElementById(this.canvasId),
        sizeX = this.boardSizeX,
        sizeY = this.boardSizeY,
        cellW = this.cellWidth,
        cellH = this.cellHeight,
        orbW = this.orbWidth,
        orbH = this.orbHeight;
    this.canvasObj = canvas;
    // 创建场景容器
    var sceneObj = document.createElement('div');
    sceneObj.style.cssText =  'width:' + this.boardWidth + 'px; ' + 
                              'height:' + (this.canvasHeight - this.boardHeight) + 'px;' +
                              'background: #eee';
    canvas.appendChild(sceneObj);
    // 创建版面容器
    var boardObj = document.createElement('div');
    boardObj.style.cssText =  'width:' + this.boardWidth + 'px; ' + 
                              'height:' + this.boardHeight + 'px; ' +
                              'background-image:url("' + this.bgSrc + '"); ' + 
                              'background-size: cover';
    canvas.appendChild(boardObj);
    // 创建格子容器
    var temp = document.createDocumentFragment();
    for (var i = 0; i < sizeY; i ++ ) {
      for (var j = 0; j < sizeX; j ++ ) {
        // 创建单个的珠子容器
        var orbContainer = document.createElement('div');
        orbContainer.id = 'orb_' + i + '_' + j;
        orbContainer.style.cssText =  'position: absolute; -webkit-transition: ease-in 0.25s;' +
                                      'width:' +  cellW + 'px;' +
                                      'height:' + cellH + 'px;' +
                                      '-webkit-transform: translate3d(' + j*cellW + 'px, ' + i*cellH + 'px, 0)';
        this.orbContainers.push(orbContainer);

        // 创建单个珠子
        var orb = document.createElement('img');
        orb.src = this.transparentImg;
        orb.width = orbW;
        orb.height = orbH;
        orb.style.cssText = '-webkit-transition:' + this.comboInterval / 1000 + 's';
        this.orbs.push(orb);
        orbContainer.appendChild(orb);

        temp.appendChild(orbContainer);
      }
    }
    boardObj.appendChild(temp);

    this.boardObj = boardObj;

  }



  pnd.View = View;
  return pnd;
})(Pnd || {})