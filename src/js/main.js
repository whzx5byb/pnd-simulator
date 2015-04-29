'use strict';
define(function(require, exports, module){
  var pnd = require('pnd.core');
  var s = pnd.init();

  document.getElementById('btn1').addEventListener('click', function(){
    
    s.begin();
  });

  module.exports = {};
});
  