module.exports = function(config) {

  // Output directory
  config.dest = 'www';

  // Images minification
  config.minify_images = true;

  // Development web server

  config.server.host = '0.0.0.0';
  config.server.port = '8000';



};
