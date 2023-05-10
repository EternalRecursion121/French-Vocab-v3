const fs= require('fs');

let rawdata = fs.readFileSync('vocab (copy).json')
var vocab = JSON.parse(rawdata)

rawdata = fs.readFileSync('module_names.json')
var module_names = JSON.parse(rawdata)

var vocab = module_names.map(x => vocab[x]);

fs.writeFileSync('vocab.json', JSON.stringify(vocab, null, 2))