define(function(require, exports, module){
  'use strict';
  var Presenter = function(opt) {
    
  }

  Presenter.prototype.init = function() {
    var func = function(a, b) {
      this.handleChange(a, b);
    };
    this.observer.on('board.statChange', func.bind(this));
    this.observer.on('board.dataUpdate', function(obj){
      console.log('dataUpdate', obj)
    })
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
  
