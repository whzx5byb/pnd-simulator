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


define(['pnd.model'], function(model){
  return {
    init: function() {

    },
    setTest: function() {

    },
    run: function() {
      
    }
  }
})