var Pnd = (function(pnd) {
  // 定义版面数据类
  var Simulator = function(opt) {
    var opt = opt || {},
        times = opt.times || 50000;
    return {
      test: function(func1, func2) {
        var o = new Pnd.Board(opt), n = 0;
        for (var i = 0; i < times; i ++ ) {
          func1.apply(o);
          result = o.getOrbsNum();
          result.fire = result[0];
          result.water = result[1];
          result.wood = result[2];
          result.light = result[3];
          result.dark = result[4];
          result.heart = result[5];
          if (func2(result)) {
            n += 1;
          }
        }
        return n / times;
      }
    }
  }
  

  pnd.Simulator = Simulator;
  return pnd;
})(Pnd || {});


