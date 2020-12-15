const prettyBytes = require('pretty-bytes');
import { inspect } from 'util';
import {LinkMapParser} from './linkmap'


let lp = new LinkMapParser('/Users/annidy/Temp/jiaoz/alpha/AppBrandInHouse-LinkMap.txt')
console.log(prettyBytes(lp.getTotalSize()))
console.log(JSON.stringify(lp.getModuleList()))

let mf = lp.getModuleFileSize(/^libTimor.a/)
let size = 0
for (const it of mf) {
    console.log(it[0], it[1], it[2])
    size += it[1]
}

console.log("总计", size)
