/**
 * Created by kumak7 on 25-11-2015.
 */
var paths = {
    dist: './dist',
    filesToCopy: [
        'img/**/*',
        'html/**/*',
        'css/**/*',
        'js/codemirror/lib/codemirror.js',
        'js/codemirror/addon/hint/css-hint.js',
        'js/codemirror/addon/hint/show-hint.js',
        'js/codemirror/mode/css/css.js',
        'js/codemirror/mode/javascript/javascript.js',
        'js/codemirror/mode/xml/xml.js',
        'js/codemirror/mode/htmlmixed/htmlmixed.js',
        'js/codemirror/addon/hint/show-hint.css',
        'js/codemirror/lib/codemirror.css',
        'js/reveal.js/**/*',
        '*.json',
        '*.html'
    ]
};

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var gftp = require( 'vinyl-ftp' );
var runSequence = require('run-sequence');
var argv = require('yargs').argv;

gulp.task('default', ['build']);

gulp.task('listcss', function() {
    gulp
        .src('css/**/*')
        .pipe(require('gulp-filelist')('csslist.json'))
        .pipe(gulp.dest('.'));
});
gulp.task('listhtml', function() {
    gulp
        .src('html/**/*')
        .pipe(require('gulp-filelist')('htmllist.json'))
        .pipe(gulp.dest('.'));
});

gulp.task('pack', function(done) {
    if (!fs.existsSync(paths.dist)) {
        fs.mkdirSync(paths.dist);
    }

    gulp.src(paths.filesToCopy, { base: '.' })
        .pipe(gulp.dest(paths.dist))
        .on('end', done);
});

gulp.task('build', function(done) {
    if (!fs.existsSync(paths.dist)) {
        fs.mkdirSync(paths.dist);
    }
    runSequence('pack','compress', 'minify-css', 'minify-html', 'listhtml', 'listcss', 'deploy', 'clean');
});
var uglify = require('gulp-uglify');

gulp.task('compress', function() {
    return gulp.src('dist/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

var minifyCss = require('gulp-minify-css');

gulp.task('minify-css', function() {
    return gulp.src('dist/js/**/*.css')
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist'));
});

var minifyHTML = require('gulp-minify-html');

gulp.task('minify-html', function() {
    var opts = {
        conditionals: true,
        spare:true,
        cdata:true,
        comments: true,
        loose: true
    };

    return gulp.src('dist/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    if (fs.existsSync(paths.dist)) {
        deleteFolderRecursive(paths.dist);
    }
});


/** Credit http://stackoverflow.com/a/12761924/2768444 */
function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
gulp.task( 'deploy', function () {

    var conn = gftp.create( {
        host: 'ftp.ask4kapil.xyz',
        user: argv.username,
        pass: argv.password,
        parallel: 3,
        log:      gutil.log
    } );

    var globs = [
        'dist/**'
    ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src( globs, { base: 'dist', buffer: false } )
        .pipe( conn.newer( '/public_html/cssintroduction' ) ) // only upload newer files
        .pipe( conn.dest( '/public_html/cssintroduction' ) );

} );
