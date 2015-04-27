// 引入 gulp
var gulp = require('gulp'); 

// 引入组件
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');



// 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src('./src/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

// 默认任务
gulp.task('default', function(){
    gulp.run('scripts');

});