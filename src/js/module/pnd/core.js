define(function(require, exports, module) {
  'use strict';
  var View = require('pnd.view'),
      Model = require('pnd.model'),
      Presenter = require('pnd.presenter'),
      option = require('pnd.option')


  module.exports = {
    init: function(opt) {
      var opt = opt || option,
          view = new View(opt),
        model = new Model(opt),
        presenter;
      opt.view = view;
      opt.model = model;

      presenter = new Presenter(opt);
      return presenter;
    },
    initTester: function(opt) {
      var opt = opt || option,
        model = new Model(opt),
        tester;
      opt.model = model;

      tester = new Tester(opt);
      return tester;
    }
  };
});
