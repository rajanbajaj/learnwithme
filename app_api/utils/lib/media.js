const base_dir = "storage";

module.exports = {
	getFinalDirectoryPath:function(path) {
        // note path should start with '/'

		return base_dir + path;
	}
}