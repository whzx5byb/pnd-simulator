var Pnd = (function(pnd) {

  
  // 定义消除模型
  var matchModel = {
    min: 3, // 触发消除的最小相连珠子数
    sizeX: 6,
    sizeY: 5,
    amount: 30,
    getBoard: function() {

    },
    match: function(data) {
      var amount = this.amount,
          sizeX = this.sizeX,
          sizeY = this.sizeY,
          data = data || [];

      // 用floodfill上色法标记连通区域
      var color = 0;
      var colorArr = data.map(function(){return -1});
      var repeated = [];
      
      for (var i = 0,dLen = data.length; i < dLen; i ++ ) {
        // 遍历版面每一个珠子,若未被上色则从此珠开始上色,若已经上色则跳过
        if (colorArr[i] < 0) {
          repeated[color] = [i];
          paint(i);
          color += 1;
        } else {
          repeated[colorArr[i]].push(i);
        }
      }

      for (var i in repeated) {
        if (repeated[i].length < this.min) {
          delete repeated[i];
          continue;
        }
        var temp = [];
        for (var j in repeated[i]) {
          var f = repeated[i][j];
          
          var l = repeated[i].indexOf(getLeft(f)), 
              r = repeated[i].indexOf(getRight(f)),
              u = repeated[i].indexOf(getUp(f)),
              d = repeated[i].indexOf(getDown(f));
          if (l > -1 && r > -1) {
            temp.push(repeated[i][l], repeated[i][j], repeated[i][r]);
          }
          if (u > -1 && d > -1) {
            temp.push(repeated[i][u], repeated[i][j], repeated[i][d]);
          }
        }

        repeated[i] = repeated[i].filter(function(item) {
          return temp.indexOf(item) > -1;
        });
      }
      console.log(repeated)
      return repeated;

      function paint(i) {
        var type = data[i].type;
        if (colorArr[i] == color) return;
        colorArr[i] = color;
        var l = getLeft(i);
        var r = getRight(i);
        var u = getUp(i);
        var d = getDown(i);
        if (l > -1 && data[l].type == type) {
          paint(l);
        }
        if (r > -1 && data[r].type == type) {
          paint(r);
        }
        if (u > -1 && data[u].type == type) {
          paint(u);
        }
        if (d > -1 && data[d].type == type) {
          paint(d);
        }
      }
      function getLeft(i) {
        return (i%sizeX == 0) ? -1 : i-1;
      }
      function getRight(i) {
        return (i%sizeX == sizeX-1) ? -1 : i+1;
      }
      function getUp(i) {
        return i - sizeX;
      }
      function getDown(i) {
        return (i+sizeX >= amount) ? -1 : i+sizeX;
      }
    
    }
  }

  


  pnd.matchModel = matchModel;
  return pnd;
})(Pnd || {})