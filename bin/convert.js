#!/usr/local/bin/node

var commander = require('commander');
var fs = require('fs');
var path = require('path');
var serializer = require('bs-serializer');
var packageJson = require('../package.json');

commander
    .version(packageJson.version)
    .usage('<source path> [<target path>]')
    .option('-s, --sourceType [' + serializer.types().join('|') + ']')
    .option('-t, --targetType [' + serializer.types().join('|') + ']')
    .option('-i, --indent [indent string or space count]')
    .parse(process.argv);

if (commander.args.length < 1) {
    console.error('missing argument: <source path>');
    commander.outputHelp();
    process.exit(-1);
}

function getType(filePath) {
    var extName = path.extname(filePath);
    if (extName.length > 0 && extName.indexOf('.') == 0) {
        return extName.substr(1).toLowerCase();
    }
    return null;
}

var sourcePath = commander.args[0];
var targetPath = commander.args[1];
var sourceType = commander.sourceType || getType(sourcePath) || 'json';
var targetType = commander.targetType || (targetPath ? (getType(targetPath) || sourceType) : sourceType);
var indent = commander.indent || 4;

if (typeof indent == 'string') {
    if (indent.match(/^\d+$/)) {
        indent = Number(indent);
    }
    else {
        indent = indent.replace(/\\t/g, '\t').replace(/\\n/g, '\n');
    }
}

var obj = serializer.parse(sourceType, fs.readFileSync(sourcePath, 'utf8'));
var text = serializer.stringify(targetType, obj, null, indent);
if (targetPath) {
    fs.writeFileSync(targetPath, text);
}
else {
    console.log(text);
}
