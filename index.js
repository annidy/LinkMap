"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prettyBytes = require('pretty-bytes');
var linkmap_1 = require("./linkmap");
var lp = new linkmap_1.LinkMapParser('./NewsLiteInHouse-LinkMap-arm64.txt');
console.log(prettyBytes(lp.getTotalSize()));
//# sourceMappingURL=index.js.map