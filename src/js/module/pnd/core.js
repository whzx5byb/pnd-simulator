define(function(require, exports, module) {
  'use strict';
  var View = require('pnd.view'),
      Model = require('pnd.model'),
      Presenter = require('pnd.presenter'),
      option = require('pnd.option'),
      observer = require('pnd.observer')


  module.exports = {
    init: function(opt) {
      opt = opt || option;
      var view = new View(opt),
          model = new Model(opt),
          presenter = new Presenter(opt);
      presenter.view = view;
      presenter.model = model;
      presenter.observer = observer;

      presenter.init();
      model.init();

      
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
