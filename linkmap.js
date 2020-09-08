"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkMapParser = void 0;
var lineByLine = require('n-readlines');
var _ = require('lodash');
function basename(path) {
    return path.split('/').reverse()[0];
}
var LinkObject = /** @class */ (function () {
    function LinkObject(line) {
        this.index = 0;
        this.file = null;
        this.module = null;
        this.size = 0;
        var res = line.match(/\[\s*(\d+)\] (.*)/);
        if (!res) {
            return;
        }
        this.index = parseInt(res[1]);
        var path = res[2];
        res = path.match(/\((.*)\)/);
        if (res) {
            this.file = res[1];
            this.module = basename(path.substr(0, res.index));
        }
        else {
            this.file = basename(path);
        }
    }
    return LinkObject;
}());
var SymbolObject = /** @class */ (function () {
    function SymbolObject(line) {
        this.size = 0;
        this.index = 0;
        if (line.match('literal%-cstring') || line.match('literal string')
            || line.match("CFString")
            || line.match('byte%-literal')
            || line.match('objc%-class%-ref')
            || line.match("objc%-cat%-list")) {
            return;
        }
        var res = line.match(/([0-9xA-F]+)\s+([0-9xA-F]+)/);
        if (!res) {
            return;
        }
        this.size = parseInt(res[2]);
        res = line.match(/\[(.*)\]/);
        if (!res) {
            return;
        }
        this.index = parseInt(res[1]);
    }
    return SymbolObject;
}());
var LinkMapParser = /** @class */ (function () {
    function LinkMapParser(path) {
        this.objMap = new Map();
        var liner = new lineByLine(path);
        var line;
        while (line = liner.next()) {
            this.process(line.toString('ascii'));
        }
    }
    LinkMapParser.prototype.process_object = function (line) {
        var lo = new LinkObject(line);
        if (lo) {
            this.objMap.set(lo.index, lo);
        }
    };
    LinkMapParser.prototype.process_symbol = function (line) {
        var so = new SymbolObject(line);
        if (so) {
            var lo = this.objMap.get(so.index);
            if (lo) {
                lo.size += so.size;
            }
        }
    };
    LinkMapParser.prototype.process = function (line) {
        if (line.match("# Object files")) {
            this.innerProc = this.process_object;
        }
        else if (line.match("# Section")) {
            this.innerProc = null;
        }
        else if (line.match("# Symbols")) {
            this.innerProc = this.process_symbol;
        }
        else if (line.match("# Dead Stripped")) {
            this.innerProc = null;
        }
        else if (this.innerProc) {
            this.innerProc(line);
        }
    };
    LinkMapParser.prototype.getModuleSize = function (module) {
        return 0;
    };
    LinkMapParser.prototype.getFileSize = function (file) {
        return 0;
    };
    LinkMapParser.prototype.getTotalSize = function () {
        var e_1, _a;
        var result = 0;
        try {
            for (var _b = __values(this.objMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                result += item[1].size;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    return LinkMapParser;
}());
exports.LinkMapParser = LinkMapParser;
//# sourceMappingURL=linkmap.js.map