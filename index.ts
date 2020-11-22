const prettyBytes = require('pretty-bytes');
import {LinkMapParser} from './linkmap'


let lp = new LinkMapParser('/Users/annidy/Library/Developer/Xcode/DerivedData/mb-appbrand-cejmwzfuecepfecqtijdtmgdpsmi/Build/Intermediates.noindex/AppBrand.build/Release-iphoneos/AppBrandInHouse.build/AppBrandInHouse-LinkMap-normal-arm64.txt')
console.log(prettyBytes(lp.getTotalSize()))


let mf = lp.getModuleFileSize(/^libTimor.a/)
let size = 0
for (const it of mf) {
    console.log(it[0], prettyBytes(it[1]), it[2])
    size += it[1]
}

console.log("总计", prettyBytes(size))
