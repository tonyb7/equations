const path = require('path');

module.exports = {
  entry: {
  	game: './src/client/index.js',
  },
  output: {
	filename: "[name].bundle.js",
	path: path.join(__dirname, '/equations/static/js/'),
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
    aggregateTimeout:500,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
}

