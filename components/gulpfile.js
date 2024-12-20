'use strict';

import autoprefixer  from 'autoprefixer';
import browser       from 'browser-sync';
import fs            from 'fs';
import gulp          from 'gulp';
import gulpSass      from 'gulp-sass';
import { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import plugins       from 'gulp-load-plugins';
import gulpSass      from 'gulp-sass';
import yaml          from 'js-yaml';
import panini        from 'panini';
import { rimraf }    from 'rimraf';
import * as dartSass from 'sass';
import uncss         from 'uncss';
import named         from 'vinyl-named';
import webpack2      from 'webpack';
import webpackStream from 'webpack-stream';
import yargs         from 'yargs';

const localtunnel = require('localtunnel');
const sass = gulpSass(dartSass);

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from config.yml
const config = loadConfig();

function loadConfig() {
    const unsafe = require('js-yaml-js-types').all;
    const schema = yaml.DEFAULT_SCHEMA.extend(unsafe);
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile, { schema });
}

// Build the "dist" folder by running all of the below tasks
// Sass must be run later so UnCSS can search for used classes in the others assets.
gulp.task('build',
    gulp.series(clean, gulp.parallel(pages, javascript, images, copy), compileSass));

// Build the site, run the server, and watch for file changes
gulp.task('default',
    gulp.series('build', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
    rimraf.rimrafSync(config.paths.dist);
    done();
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
    return gulp.src(config.paths.assets)
        .pipe(gulp.dest(config.paths.dist + '/assets'));
}

// Copy page templates into finished HTML files
function pages() {
    return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
        .pipe(panini({
            root: 'src/pages/',
            layouts: 'src/layouts/',
            partials: 'src/partials/',
            data: 'src/data/',
            helpers: 'src/helpers/'
        }))
        .pipe(gulp.dest(config.paths.dist));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
    panini.refresh();
    done();
}

// Compile Sass into CSS
// In production, the CSS is compressed
function compileSass() {

    const postCssPlugins = [
        autoprefixer(),
        PRODUCTION && uncss.postcssPlugin(config.tasks.uncss),
    ].filter(Boolean);

    return gulp.src('src/assets/scss/app.scss')
        .pipe($.sourcemaps.init())
        .pipe(sass({
            includePaths: config.paths.sass
        })
            .on('error', sass.logError))
        .pipe($.postcss(postCssPlugins))
        .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(config.paths.dist + '/assets/css'))
        .pipe(browser.reload({ stream: true }));
}

let webpackConfig = {
    mode: (PRODUCTION ? 'production' : 'development'),
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [ "@babel/preset-env" ],
                        compact: false
                    }
                }
            }
        ]
    },
    devtool: !PRODUCTION && 'source-map'
}

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
    return gulp.src(config.paths.entries)
        .pipe(named())
        .pipe($.sourcemaps.init())
        .pipe(webpackStream(webpackConfig, webpack2))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => { console.log(e); })
        ))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(config.paths.dist + '/assets/js'));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
    return gulp.src('src/assets/img/**/*')
        .pipe($.if(PRODUCTION, imagemin([
            gifsicle({interlaced: true}),
            mozjpeg({quality: 85, progressive: true}),
            optipng({optimizationLevel: 5}),
            svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ])))
        .pipe(gulp.dest(config.paths.dist + '/assets/img'));
}

// Start a server with BrowserSync to preview the site
function server(done) {
    browser.init({
        server: config.paths.dist,
        port: config.dev.port,
    });

    if (tunnel in config.dev && config.dev.tunnel.enabled) {
        setupTunnel().then(() => {
            done();
        });
    } else {
        done();
    }
}

// Reload the browser with BrowserSync
function reload(done) {
    browser.reload();
    done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
    gulp.watch(config.paths.assets, copy);
    gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
    gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
    gulp.watch('src/data/**/*.{js,json,yml}').on('all', gulp.series(resetPages, pages, browser.reload));
    gulp.watch('src/helpers/**/*.js').on('all', gulp.series(resetPages, pages, browser.reload));
    gulp.watch('src/assets/scss/**/*.scss').on('all', compileSass);
    gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, browser.reload));
    gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
}

async function setupTunnel() {
    try {
        const tunnelOptions = { port: config.dev.port };

        if (subdomain in config.dev.tunnel) {
            tunnelOptions.subdomain = config.dev.tunnel.subdomain;
        }
        const tunnel = await localtunnel(tunnelOptions);

        console.log('Tunnel URL:', tunnel.url);

        tunnel.on('close', () => {
            console.log('Localtunnel closed');
        });
    } catch (err) {
        console.error('Localtunnel setup failed:', err);
        throw err;
    }
}
