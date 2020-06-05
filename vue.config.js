/* eslint-disable */
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const PrerenderSPAPlugin = require('prerender-spa-plugin');

const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
require('babel-polyfill');

module.exports = {
  publicPath: './',
  css: {
    loaderOptions: {
      sass: {
        // prependData: '@import "~@/sass/variables.sass";',
      },
    },
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV !== 'production') return;
    return {
      plugins: [
        new PrerenderSPAPlugin({
          // 生成文件的路径，也可以与webpakc打包的一致。
          // 下面这句话非常重要！！！
          // 这个目录只能有一级，如果目录层次大于一级，在生成的时候不会有任何错误提示，在预渲染的时候只会卡着不动。
          staticDir: path.join(__dirname, 'dist'),
          // 对应自己的路由文件，比如a有参数，就需要写成 /a/param1。
          routes: ['/'],
          // 这个很重要，如果没有配置这段，也不会进行预编译
          renderer: new Renderer({
            inject: {
              foo: 'bar',
            },
            headless: false,
            // 在 main.js 中 document.dispatchEvent(new Event('render-event'))，两者的事件名称要对应上。
            renderAfterDocumentEvent: 'render-event',
          }),
        }),
      ],
    };
  },
  chainWebpack: (config) => {
    // 解决ie11兼容ES6
    config.entry('main').add('babel-polyfill');
    // 开启图片压缩
    config.module.rule('images')
      .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        bypassOnDebug: true,
      });
    // 开启js、css压缩
    if (process.env.NODE_ENV === 'production') {
      config.plugin('compressionPlugin')
        .use(new CompressionPlugin({
          test: /\.js$|\.html$|.\css/, // 匹配文件名
          threshold: 10240, // 对超过10k的数据压缩
          deleteOriginalAssets: false, // 不删除源文件
        }));
    }
    config.plugin('html')
      .tap((args) => {
        args[0].minify = false;
        return args;
      });
  },
  transpileDependencies: [
    'biyi-admin', // 指定对第三方依赖包进行babel-polyfill处理
  ],
};
