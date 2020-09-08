const prettyBytes = require('pretty-bytes');
import {LinkMapParser} from './linkmap'


let lp = new LinkMapParser('./NewsLiteInHouse-LinkMap-arm64.txt')
console.log(prettyBytes(lp.getTotalSize()))
