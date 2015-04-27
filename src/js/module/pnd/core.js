'use strict';


var view = require('pnd.view'),
  model = require('pnd.model'),
  opt = require('pnd.option');

module.exports = {
  init: function(opt) {
    var opt = opt || option,
      view = new this.View(opt),
      model = new this.Model(opt),
      presenter;
    opt.view = view;
    opt.model = model;

    presenter = new this.Presenter(opt);
    return presenter;
  },
  initTester: function(opt) {
    var opt = opt || option,
      model = new this.Model(opt),
      tester;
    opt.model = model;

    tester = new this.Tester(opt);
    return tester;
  }
};
