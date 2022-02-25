const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|svg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "assets/"),
      "boucaud-technical-test": path.resolve(__dirname, "src/"),
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  // See: https://github.com/mrdoob/three.js/issues/17482#issuecomment-780920930 TODO: unnecessary if no examples are used. Required for controls right now.
  externals: [
    ({ context, request }, callback) => {
      if (request === "three" || request.endsWith("three.module.js")) {
        return callback(null, {
          commonjs: "three",
          commonjs2: "three",
          amd: "three",
          root: "THREE",
        });
      }
      callback();
    },
  ],
};
