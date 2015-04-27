'use strict';
(function(){
  var pnd = require('./module/core.js');
  document.getElementById('btn1').addEventListener('click', function(){
    pnd.init();
  })
})();