/**
 * 形状模块
 * 一个形状由以下参数描述: 版面坐标横个数x, 版面坐标纵个数y, 重力方向[gx,gy], 包含坐标的有序数组[].
 */
define(function(require, exports, module) {
  var sx = 6,
    sy = 5,
    gravity = [0, 1],
    a = sx * sy;

  function set(opt) {
    sx = opt.sx || sx;
    sy = opt.sy || sy;
    a = sx * sy;
    gravity = opt.gravity || gravity;
  }
  /**
   * 获得一个形状挡住光线, 照射不到地方的形状
   *   消除珠子后留下的空位形状的"向上"光照阴影即为需要移动的形状
   * @param   {number[]} figure 传入的形状数组
   * @param   {number[]} arr  光照矢量方向, 默认为和重力方向相同
   * @return  {number[]} ret    [description]
   */

  function getShadeOf(figure, arr) {
    figure = figure || [];
    light = arr || gravity;
    var x = 0,
      y = 0,
      lx = arr[0],
      ly = arr[1],
      sxh = (sx + 1) / 2,
      syh = (sy + 1) / 2,
      ret = [];
    figure.forEach(function(item) {
      x = item % sx;
      y = Math.floor(item / sx);
      // 判断一点是否在界内的公式: lx * (x + 1) < sxh * (lx + 1)
      while (lx * (x + 1) < sxh * (lx + 1) && ly * (y + 1) < syh * (ly + 1)) {
        // 若该点在界内, 则将它下面的点
        x = x + lx;
        y = y + ly;
        if (!isNaN(movedOrbs[y * sx + x])) {
          movedOrbs[y * sx + x] += gx + gy * sx;
        }
      }
    })
  }

  /**
   * 获得一个形状的掉落形状
   *   消除珠子后留下的空位形状的"向下"掉落形状即为生成天降珠子的初始形状
   *   消除珠子后留下的空位形状的"向上"掉落形状即为天降珠子的目标形状
   * @param  {number[]} figure  [description]
   * @param  {number[]} gravity [description]
   * @return {number[]} ret        [description]
   */

  function getDropOf(figure, arr) {
    arr = arr || gravity;
    var x = 0,
        y = 0,
        gx = arr[0],
        gy = arr[1],
        sxh = (sx + 1) / 2,
        syh = (sy + 1) / 2;
    return figure.map(function(item) {
      var x = item % sx,
          y = Math.floor(item / sx),
          distance = 0;
      // 将该点"下"移一格
      x += gx;
      y += gy;
      // 判断该点是否在界内
      while (gx * (x + 1) < sxh * (gx + 1) && gy * (y + 1) < syh * (gy + 1)) {
        // 若该点也不在形状内, 则距离+1
        if (figure.indexOf(x + y * sx) < 0) {
          distance += 1;
        }
        x += gx;
        y += gy;
      }
      return (gx + gy * sx) * distance + item;
    })
  }
  module.exports = {
    getDropOf: getDropOf
  }
});
