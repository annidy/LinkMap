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
        this.file = null;
        this.module = null;
        this.size = 0;
        var res = line.match(']');
        if (!res) {
            throw line + ": synax error";
        }
        this.index = line.substr(0, res.index + 1);
        var path = line.substr(res.index + 2);
        res = path.match(/\((.*)\)$/);
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
        var res = line.split('\t');
        if (!res || res.length != 3) {
            throw line + ": synax error";
        }
        this.size = parseInt(res[1]);
        var path_range = res[2].match(']');
        if (!path_range) {
            throw line + ": synax error";
        }
        this.index = res[2].substr(0, path_range.index + 1);
    }
    return SymbolObject;
}());
var LinkMapParser = /** @class */ (function () {
    function LinkMapParser(path) {
        this.objMap = new Map();
        var liner = new lineByLine(path);
        var line;
        var reachFiles = false;
        var reachSymbols = false;
        var reachSections = false;
        var reachDeadStrippedSymbols = false;
        while (line = liner.next()) {
            line = line.toString('ascii');
            if (line.match(/^#/)) {
                if (line.match("# Object files")) {
                    reachFiles = true;
                }
                else if (line.match("# Section")) {
                    reachSections = true;
                }
                else if (line.match("# Symbols")) {
                    reachSymbols = true;
                }
                else if (line.match("# Dead Stripped Symbols")) {
                    reachDeadStrippedSymbols = true;
                }
            }
            else {
                if (reachFiles && !reachSections && !reachSymbols && !reachDeadStrippedSymbols) {
                    this.process_object(line);
                }
                else if (reachFiles && reachSections && reachSymbols && !reachDeadStrippedSymbols) {
                    this.process_symbol(line);
                }
            }
        }
    }
    LinkMapParser.prototype.process_object = function (line) {
        try {
            var lo = new LinkObject(line);
            this.objMap.set(lo.index, lo);
        }
        catch (error) {
            console.error(error);
        }
    };
    LinkMapParser.prototype.process_symbol = function (line) {
        try {
            var so = new SymbolObject(line);
            var lo = this.objMap.get(so.index);
            lo.size += so.size;
        }
        catch (error) {
            console.error(error);
        }
    };
    LinkMapParser.prototype.getModuleFileSize = function (module) {
        var e_1, _a;
        var result = new Array();
        try {
            for (var _b = __values(this.objMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                if (item[1].module) {
                    if (item[1].module.match(module)) {
                        result.push([item[1].file || "unknown", item[1].size, item[1].module]);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result.sort(function (a, b) { return b[1] - a[1]; });
    };
    LinkMapParser.prototype.getModuleList = function () {
        var e_2, _a;
        var result = new Array();
        var moduleset = new Set;
        try {
            for (var _b = __values(this.objMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                if (item[1].module) {
                    moduleset.add(item[1].module);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        moduleset.forEach(function (value, key) {
            result.push(value);
        });
        return result;
    };
    LinkMapParser.prototype.getFileSize = function (file) {
        return 0;
    };
    LinkMapParser.prototype.getTotalSize = function () {
        var e_3, _a;
        var result = 0;
        try {
            for (var _b = __values(this.objMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                result += item[1].size;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
    };
    return LinkMapParser;
}());
exports.LinkMapParser = LinkMapParser;
//# sourceMappingURL=linkmap.js.map