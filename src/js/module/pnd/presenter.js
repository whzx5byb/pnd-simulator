define(function(require, exports, module){
  var Presenter = function(opt) {
    this.view = opt.view;
    this.model = opt.model;
    this.observer = require('pnd.observer');
    this.init();
  }

  Presenter.prototype.init = function() {
    var func = function(a, b) {
      this.handleChange(a, b);
    }.bind(this);
    this.observer.on('statChange', func)
  }
  Presenter.prototype.logData = function(a) {
    var d = this.model.getSimpleData();
    console.log(d, a);
  }
  Presenter.prototype.begin = function() {
    this.model.toNextState();
  }

  Presenter.prototype.handleChange = function(clearedOrbs, movedOrbs) {
    var view = this.view;
    var obj = {clearedOrbs: clearedOrbs,
      movedOrbs: movedOrbs}
    
    view.addHandleTask(obj);
    
  }
  module.exports = Presenter;
});
  
