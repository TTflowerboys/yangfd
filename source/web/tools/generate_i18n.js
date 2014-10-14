/* jshint node:true */
var glob = require('glob')
var fs = require('fs')
var path = require('path')

if (process.argv.length < 4) {
    console.log('node generate_i18n.js srcPattern dest')
    process.exit(1)
}

var pattern = process.argv[2]
var dest = process.argv[3]

glob(pattern, null, function (error, filePaths) {
    var result = {}
    filePaths.forEach(function (filePath) {
        var file = fs.readFileSync(filePath)
        var content = file.toString('utf8')
        var regex = /i18n\(('|")(.+?)\1\)/g
        var match = regex.exec(content)
        while (match) {
            result[match[2]] = true
            match = regex.exec(content)
        }
    })

    var i18nTemplate = ''
    for (var name in result) {
        var escaped= encodeAttr(name)
        i18nTemplate += ['<input type="hidden" id="i18n-', escaped, '" value="', escaped, '">'].join('') + '\n'
    }

    var destPath = path.join('./', dest)
    fs.writeFileSync(destPath, i18nTemplate)
    process.exit(0)

})

function splitByLine(string) {
    return string.split(/\n|\r|\r\n/)
}

function encodeAttr(string) {
    return string.replace(/"/g, '&quot;')
}
