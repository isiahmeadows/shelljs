var common = require('./common');
var fs = require('fs');
var path = require('path');

// Cross-platform method for splitting environment PATH variables
function splitPath(p) {
  if (!p)
    return [];

  if (common.platform === 'win')
    return p.split(';');
  else
    return p.split(':');
}

function checkPath(path) {
  return fs.existsSync(path) && !fs.statSync(path).isDirectory();
}

//@
//@ ### which(command)
//@
//@ Examples:
//@
//@ ```javascript
//@ var nodeExec = which('node');
//@ ```
//@
//@ Searches for `command` in the system's PATH. On Windows looks for `.exe`, `.cmd`, and `.bat` extensions.
//@ Returns string containing the absolute path to the command.
function _which(options, cmd) {
  if (!cmd)
    common.error('must specify command');

  var pathEnv = process.env.path || process.env.Path || process.env.PATH,
      pathArray = splitPath(pathEnv),
      where = null;

  // No relative/absolute paths provided?
  if (cmd.search(/\//) === -1) {
    // Search for command in PATH
    pathArray.forEach(function(dir) {
      if (where)
        return; // already found it

      var attempt = path.resolve(dir + '/' + cmd);

      if (common.platform === 'win') {
        var baseAttempt = attempt;
        attempt = baseAttempt + '.exe';
        if (checkPath(attempt)) {
          where = attempt;
          return;
        }
        attempt = baseAttempt + '.bat';
        if (checkPath(attempt)) {
          where = attempt;
          return;
        }
        attempt = baseAttempt + '.cmd';
        if (checkPath(attempt)) {
          where = attempt;
          return;
        }
      } else {
        if (checkPath(attempt)) {
          where = attempt;
          return;
        }
      }
    });
  }

  // Command not found anywhere?
  if (!checkPath(cmd) && !where)
    return null;

  where = where || path.resolve(cmd);

  return common.ShellString(where);
}
module.exports = _which;
