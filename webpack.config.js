var config = {
   entry: './main.js',

   output: {
      path:'./build',
      filename: 'index.js',
   },

   devServer: {
      inline: true,
      port: 8080
  },
  module: {
      loaders: [
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel',

            query: {
               presets: ['es2015', 'react']
            }
        },
        {
          test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
          loader: "file"
        }
      ]
   }
}

module.exports = config;
