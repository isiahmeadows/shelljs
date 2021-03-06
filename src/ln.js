var fs = require('fs');
var path = require('path');
var common = require('./common');
var os = require('os');

//@
//@ ### ln([options,] source, dest)
//@ Available options:
//@
//@ + `-s`: symlink
//@ + `-f`: force
//@
//@ Examples:
//@
//@ ```javascript
//@ ln('file', 'newlink');
//@ ln('-sf', 'file', 'existing');
//@ ```
//@
//@ Links source to dest. Use -f to force the link, should dest already exist.
function _ln(options, source, dest) {
  options = common.parseOptions(options, {
    's': 'symlink',
    'f': 'force'
  });

  if (!source || !dest) {
    common.error('Missing <source> and/or <dest>');
  }

  source = String(source);
  var sourcePath = path.normalize(source).replace(RegExp(path.sep + '$'), '');
  var isAbsolute = (path.resolve(source) === sourcePath);
  dest = path.resolve(process.cwd(), String(dest));

  if (fs.existsSync(dest)) {
    if (!options.force) {
      common.error('Destination file exists', true);
    }

    fs.unlinkSync(dest);
  }

  if (options.symlink) {
    if ((isAbsolute && !fs.existsSync(sourcePath)) || !fs.existsSync(path.resolve(process.cwd(), path.dirname(dest), source))) {
      common.error('Source file does not exist', true);
    }
    fs.symlinkSync(source, dest, os.platform() === "win32" ? "junction" : null);
  } else {
    if (!fs.existsSync(source)) {
      common.error('Source file does not exist', true);
    }
    fs.linkSync(source, dest);
  }
}
module.exports = _ln;
