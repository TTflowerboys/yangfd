/* jshint node:true */

var fs = require('fs')
var path = require('path')
var md = require('marked')

md.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
})

if (process.argv.length < 4) {
    console.log('node generate_i18n.js srcPattern dest')
    process.exit(1)
}

var src = process.argv[2]
var dest = process.argv[3]

var srcContent = fs.readFileSync(path.join('./', src)).toString()
var html = md(srcContent)
fs.writeFileSync(path.join('./', dest), html)
process.exit(0)

