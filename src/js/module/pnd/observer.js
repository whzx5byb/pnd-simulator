define(function(require, exports, module) {
  var eventsList = {};
  var events = {
    //订阅
    on: function(type, handler) {
      if (typeof handler != 'function') {
        throw new Error('invalid handler')
      }
      eventsList[type] = eventsList[type] || [];
      eventsList[type].push(handler);
      return this;
    },
    //退订
    off: function(type, handler) {
      var len = arguments.length // 缓存参数个数
      var list = this.list[type] // 缓存此type类型的数组
      if (!len) { // 一个参数都没提供
        this.list = {} // 直接清空list
      } else if (len == 1) { // 有type，没handler
        delete this.list[type] // 这个type的handler全清空
      } else if (list) { // 有type，也有handler，也有list
        for (len = 0; len < list.length; len++) { // 地毯式扫荡handler
          if (list[len] === handler) list.splice(len, 1) // 犀利的劈掉handler
        }
      }
      return this // 照样菊花灿烂
    },
    //发布
    trigger: function(type) {
      var list = eventsList[type] || [];
      var args = [].slice.call(arguments, 1);
      for (var i = 0, len = list.length; i < len; i++) {
        list[i].apply(null, args) // 挨个触发事件，转发参数
      }
      return this;
    },
    // 触发一次后马上解绑
    once: function(type, handler) {
      /*if (typeof handler != 'function') {
        throw new Error('invalid handler.')
      }
      var that = this // 缓存this对象
      var one = function() { // one里调用handler
        handler.apply(null, arguments) // 所有参数任意转发
        that.off(type, one) // 解绑one事件，注意解绑的是one！
      }
      return this.on(type, one) // 绑定one事件，还照样能提供菊花*/
    }
  };
  module.exports = events;
});
