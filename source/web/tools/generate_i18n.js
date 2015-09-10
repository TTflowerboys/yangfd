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
        var regex = /i18n\(('|")(.+?)\1(,|\))/g
        var match = regex.exec(content)
        while (match) {
            result[match[2]] = true
            match = regex.exec(content)
        }
    })

    var i18nTemplate = ''
    for (var name in result) {
        var attr = encodeAttr(name)
        var template = encodeTemplate(name)
        i18nTemplate += ['<input type="hidden" id="i18n-str-', attr, '" value="{{_(', template, ')}}">'].join('') + '\n'
    }

    i18nTemplate += [
        '<script>',
            'if(!window.i18n){',
                'window.i18n = function (name) {',
                    'var input = document.getElementById(\'i18n-str-\' + name)',
                    'if (!input) { return name }',
                    'var value = input.value',
                    'var i = 0',
                    'while(value.indexOf(\'%s\') >= 0) {',
                        'value = value.replace(\'%s\', arguments[++i])',
                    '}',
                    'return value',
                '}',
            '}',
        '</script>'
    ].join('\n')

    var destPath = path.join('./', dest)
    fs.writeFileSync(destPath, i18nTemplate)
    process.exit(0)

})

/**
 * Encode html attribute
 * @param {string} input
 * @returns {string} escaped
 */
function encodeAttr(string) {
    return string.replace(/"/g, '&#34;')
        .replace(/'/g, '&#39;')
}

/**
 * Encode bottle template string
 * @param {string} input
 * @returns {string} escaped
 */
function encodeTemplate(string) {
    if (string.indexOf('\'') >= 0) {
        return ['"', string, '"'].join('')
    } else {
        return ['\'', string, '\''].join('')
    }
}
