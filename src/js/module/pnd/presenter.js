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