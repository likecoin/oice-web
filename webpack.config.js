const webpack = require('webpack'); // for plugin use
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const RemarkHTML = require('remark-html');

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

const hotMiddlewareScriptEntry = (DEBUG ? [
  'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
  'webpack/hot/dev-server',
] : []);

const editorEntry = {
  web: ['babel-polyfill', path.join(WEB_SRC_DIR, 'index.jsx')].concat(hotMiddlewareScriptEntry),
  editor: ['babel-polyfill', path.join(EDITOR_SRC_DIR, 'index.jsx')].concat(hotMiddlewareScriptEntry),
  'asset-library': ['babel-polyfill', path.join(ASSET_LIBRARY_SRC_DIR, 'index.jsx')].concat(hotMiddlewareScriptEntry),
  'ui-demo': ['babel-polyfill', path.join(SRC_DIR, 'ui-demo/index.jsx')].concat(hotMiddlewareScriptEntry),
};
if (!OICE_DEV) editorEntry['admin-panel'] = ['babel-polyfill', path.join(ADMIN_SRC_DIR, 'index.jsx')].concat(hotMiddlewareScriptEntry);

const stylesLoaders = [
  {
    loader: 'css-loader',
    options: {
      importLoaders: 2,
      minimize: true,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      plugins: () => [
        autoprefixer(),
      ],
    },
  },
  'sass-loader',
];

module.exports = {
  devtool: DEBUG ? 'eval' : false,
  mode: DEBUG ? 'development' : 'production',
  context: SRC_DIR,
  entry: editorEntry,
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: BUILD_DIR,
    publicPath: `/${BUILD_DIR_NAME}/`,
  },
  optimization: {
    minimize: !DEBUG,
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
        common: {
          chunks: 'all',
          name: 'common',
          minChunks: 2,
        },
      },
    },
    runtimeChunk: false,
  },
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize: 300000,
    hints: DEBUG ? false : 'warning',
  },
  stats: { children: false },
  module: {
    noParse: /es6-promise\.js$/, // Avoid webpack shimming process
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['react-hot-loader', 'babel-loader'],
      },
      {
        test: /\.s?css$/,
        use: DEBUG ? ['style-loader'].concat(stylesLoaders)
          : [MiniCssExtractPlugin.loader].concat(stylesLoaders),
      },
      {
        test: /\.svg$/,
        use: ['babel-loader?presets[]=es2015,presets[]=react', 'svg-react-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]-[hash].[ext]',
            },
          },
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'remark-loader',
            options: {
              remarkOptions: {
                plugins: [RemarkHTML],
              },
            },
          },
        ],
      },
    ].concat(DEBUG ? [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'eslint-loader',
      },
    ] : []),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.svg', '.md'],
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
      'bn.js': path.join(__dirname, './node_modules/bn.js'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
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
    new webpack.HotModuleReplacementPlugin(),
  ] : [
    // Production
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
  ]),
};
