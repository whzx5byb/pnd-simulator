define(function(require, exports, module){
  'use strict';
  var Presenter = function(opt) {
    
  }

  Presenter.prototype.init = function() {
    var func = function(a, b) {
      this.handleChange(a, b);
    };
    this.observer.on('board.statChange', func.bind(this));
    /*this.observer.on('board.dataUpdate', function(data){
      var smallCanvas = document.getElementById('smallCanvas');
      var color = ['red', 'blue', 'green', 'yellow', 'darkmagenta', 'pink']
      var str = '';
      data.forEach(function(item){
        str += '<div class="unit" style="background:' + color[item[1]] + '">&nbsp;</div>'
      });
      smallCanvas.innerHTML = str;
    });*/
    this.observer.on('view.orbExchange', function(index1, index2){
      this.model.updateData({
        method: 'exchange',
        index1: index1,
        index2: index2
      })
    }.bind(this));
    this.observer.on('view.moveEnd', function(){
      this.model.toNextState();
    }.bind(this))
  }
  
  Presenter.prototype.begin = function() {
    this.model.toNextState();
  }

  Presenter.prototype.handleChange = function(stat) {

    var view = this.view;
    
    console.log('statChange', stat.clearedOrbs)

    view.addHandleTask(stat);
    
  }
  module.exports = Presenter;
});
  
