const baseDir = 'storage';

module.exports = {
  getFinalDirectoryPath: function(path) {
    // note path should start with '/'

    return baseDir + path;
  },
};
