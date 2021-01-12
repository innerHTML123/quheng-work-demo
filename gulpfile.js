// 实现这个项目的构建任务
// 实现步骤
/**
 * 1.样式编译  
 *  安装gulp-sass 并引入,sass会默认任务带下划线的被引入
 * outputStyle: 'expanded' 样式完全展开
 * 2.脚本编译
 * 安装 @babel/core @babel/preset-env gulp-babel
 * 3.模板文件编译
 * 安装 yarn add gulp-swig
 * 4.图片和字体的转换(压缩文件)
 * 安装 gulp-imagemin
 * 5.文件清除和其他 文件
 * 6.自动加载插件
 * 最新版的imagemin 无法自动加载
 * 7，热更新开发服务器
 *  安装browser-sync ,使用watch监听文件变化
 * 8.useref插件
 *      gulp-useref差距
 * 9.压缩html js css
 * gulp-htmlmin gulp-uglify gulp-clean-css --dev
 * gulp-if
 */
const { src, dest, parallel, series } = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
    // const plugins.sass = require('gulp-sass')
    // const plugins.babel = require('gulp-babel')
    // const plugins.swig = require('gulp-swig')
    // const plugins.imagemin = require('gulp-imagemin')
const del = require('del')
const browserSync = require('browser-sync')
const bs = browserSync.create()

const data = {
    menus: [{
            name: 'Home',
            icon: 'aperture',
            link: 'index.html'
        },
        {
            name: 'About',
            link: 'about.html'
        },
        {
            name: 'Contact',
            link: '#',
            children: [{
                    name: 'Twitter',
                    link: 'https://twitter.com/w_zce'
                },
                {
                    name: 'About',
                    link: 'https://weibo.com/zceme'
                },
                {
                    name: 'divider'
                },
                {
                    name: 'About',
                    link: 'https://github.com/zce'
                }
            ]
        }
    ],
    pkg: require('./package.json'),
    date: new Date()
}
const style = () => {
    return src('src/assets/styles/*scss', { base: "src" })
        .pipe(plugins.sass({ outputStyle: 'expanded' }))
        .pipe(dest('temp'))
}

const script = () => {
    return src("src/assets/scripts/*js", { base: "src" })
        .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
        .pipe(dest('temp'))
}

const html = () => {
    return src("src/*.html", { base: "src" })
        .pipe(plugins.swig({ data }))
        .pipe(dest('temp'))
}

const image = () => {
    return src("src/assets/images/**", { base: "src" })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

const font = () => {
    return src("src/assets/fonts/**", { base: "src" })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

const extra = () => {
    return src('public/**', { base: 'public' })
        .pipe(dest('dist'))
}

const clean = () => {
    return del(['dist', 'temp'])
}

const serve = () => {
    watch('src/assets/styles/*scss', style)
    watch('src/assets/scripts/*js', script)
    watch('src/*.html', html)
    watch([
        "src/assets/fonts/**",
        "src/assets/images/**",
        'public/**'
    ], bs.reload)
    bs.init({
        notify: false,
        port: 2000,
        files: 'dist/**',
        // open: false,
        server: {
            baseDir: ['temp', 'src', 'public'],
            routes: { //处理请求
                '/node_modules': 'node_modules'
            }
        }
    })
}

const useref = () => {
    return src('temp/*html', { base: 'temp' })
        .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            minifyCss: true,
            minifyJS: true
        })))
        .pipe(dest('dist'))
}

const compile = parallel(style, script, html)

const build = series(clean,
    parallel(series(compile, useref),
        image,
        font,
        extra
    ))

const dev = series(compile, serve)

// const page 
module.exports = {
    compile,
    build,
    dev,
    serve,
    clean
}