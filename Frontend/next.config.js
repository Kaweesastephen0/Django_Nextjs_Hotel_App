const { hostname } = require("os");

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
  
      },
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost:8080',
      
  }]
  },
}