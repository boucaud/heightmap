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
      three: path.resolve('./node_modules/three')
    },
    extensions: [".tsx", ".ts", ".js"],
  },
};
