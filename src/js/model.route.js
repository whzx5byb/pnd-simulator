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