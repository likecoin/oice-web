const webpack = require('webpack');   //  for plugin use
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const WebpackStripLoader = require('strip-loader');

const SRV_ENV = process.env.SRV_ENV;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;
const DEBUG = NODE_ENV !== 'production';
const OICE_DEV = process.env.OICE_DEV;

const BUILD_DIR_NAME = 'build';
const SRC_DIR = path.join(__dirname, 'src');
const ADMIN_SRC_DIR = path.join(SRC_DIR, 'admin');
const ASSET_LIBRARY_SRC_DIR = path.join(SRC_DIR, 'asset-library');
const COMMON_DIR = path.join(SRC_DIR, 'common');
const EDITOR_SRC_DIR = path.join(SRC_DIR, 'editor');
const UI_DEMO_SRC_DIR = path.join(SRC_DIR, 'ui-demo');
const WEB_SRC_DIR = path.join(SRC_DIR, 'web');
const DIST_DIR = path.join(__dirname, 'dist');
const BUILD_DIR = path.join(DIST_DIR, BUILD_DIR_NAME);

const AUTOPREFIXER_BROWSERS = [
  'Android >= 4.4',
  'Chrome >= 49',
  'Edge >= 12',
  'Firefox >= 49',
  'ie >= 11',
  'iOS >= 8',
  'Opera >= 42',
  'Safari >= 8',
  'Samsung >= 4',
  'UCAndroid >= 11',
];

const hotMiddlewareScriptEntry = (DEBUG ? [
  'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
  'webpack/hot/dev-server',
] : []);

const editorEntry = {
  web: ['babel-polyfill', path.join(WEB_SRC_DIR, 'index.jsx')].concat(hotMiddlewareScriptEntry),
  editor: ['babel-polyfill', path.join(EDITOR_SRC_DIR, 'index.jsx')].concat(hotMiddlewareScriptEntry),
  'asset-library': ['babel-polyfill', path.join(ASSET_LIBRARY_SRC_DIR, 'index.jsx')].concat(hotMiddlewareScriptEntry),
  'ui-demo': ['babel-polyfill', path.join(SRC_DIR, 'ui-demo/index.jsx')].concat(hotMiddlewareScriptEntry),
}
if (!OICE_DEV) editorEntry['admin-panel'] = ['babel-polyfill', path.join(ADMIN_SRC_DIR, 'index.jsx')].concat(hotMiddlewareScriptEntry);

const stylesLoaders = 'css-loader!postcss-loader!sass-loader';

module.exports = {
  devtool: DEBUG ? 'eval' : null,
  context: SRC_DIR,
  entry: editorEntry,
  output: {
    filename: '[name].js',
    path: BUILD_DIR,
    publicPath: `/${BUILD_DIR_NAME}/`,
  },
  module: {
    preLoaders: DEBUG ? [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
    ] : null,
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel-loader'],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.s?css$/,
        loader: DEBUG ? `style-loader!${stylesLoaders}` : ExtractTextPlugin.extract('style-loader', stylesLoaders),
      },
      {
        test: /\.svg$/,
        loader: 'babel?presets[]=es2015,presets[]=react!svg-react',
      },
      {
        test: /\.(png|jpg|jpeg|gif|woff|woff2)$/,
        loader: 'file?name=[hash].[ext]',
      },
      {
        test: /\.md$/,
        loader: 'html-loader!remarkable',
      },
    ].concat(DEBUG ? [] : [
      {
        test: [/\.js$/, /\.es6$/],
        exclude: /node_modules/,
        loader: WebpackStripLoader.loader('console.log'),
      },
    ]),
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json', '.svg', '.md'],
    alias: {
      admin: ADMIN_SRC_DIR,
      common: COMMON_DIR,
      dist: DIST_DIR,
      editor: EDITOR_SRC_DIR,
      web: WEB_SRC_DIR,
      'asset-library': ASSET_LIBRARY_SRC_DIR,
      'ui-demo': UI_DEMO_SRC_DIR,
      'ui-elements': path.join(COMMON_DIR, 'components'),
      'react/lib/ReactMount': 'react-dom/lib/ReactMount',
    },
  },
  postcss: () => [autoprefixer({ browsers: AUTOPREFIXER_BROWSERS })],
  remarkable: {
    preset: 'full',
    linkify: true,
    typographer: true,
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.DefinePlugin({
      'process.env': {
        SRV_ENV: JSON.stringify(SRV_ENV),
        NODE_ENV: JSON.stringify(NODE_ENV),
        IS_CLIENT: JSON.stringify(true),
      },
    }),
  ].concat(DEBUG ? [
    // Development
    new webpack.ProgressPlugin((percentage, msg) => {
      process.stdout.clearLine(1);
      process.stdout.write(`${msg} [${(percentage * 100).toFixed(1)}%]`);
      process.stdout.cursorTo(0);
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ] : [
    // Production
    // new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        drop_console: true,
      },
    }),
  ]),
  eslint: {
    configFile: './.eslintrc',
  },
};
