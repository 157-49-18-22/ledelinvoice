module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable source maps for html2pdf.js
      webpackConfig.module.rules.push({
        test: /html2pdf\.js/,
        use: {
          loader: 'ignore-loader'
        }
      });
      return webpackConfig;
    }
  }
}; 