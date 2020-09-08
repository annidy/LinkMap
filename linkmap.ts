
const lineByLine = require('n-readlines');
const _ = require('lodash')

function basename(path: string) {
    return path.split('/').reverse()[0];
 }

class LinkObject {
    index = 0
    file: string | null = null
    module: string | null = null
    size = 0
    constructor(line: string) {
        var res = line.match(/\[\s*(\d+)\] (.*)/)
        if (!res) {
            return
        }
        this.index = parseInt(res[1])
        let path = res[2]
        res = path.match(/\((.*)\)/)
        if (res) {
            this.file = res[1]
            this.module = basename(path.substr(0, res.index))
        } else {
            this.file = basename(path)
        }
    }
}

class SymbolObject {
    size = 0
    index = 0

    constructor(line: string) {
        if (line.match('literal%-cstring') || line.match('literal string')
        || line.match("CFString")
        || line.match('byte%-literal')
        || line.match('objc%-class%-ref')
        || line.match("objc%-cat%-list")) {
            return
        }

        var res = line.match(/([0-9xA-F]+)\s+([0-9xA-F]+)/)
        if (!res) {
            return
        }
        this.size = parseInt(res[2])
        res = line.match(/\[(.*)\]/)
        if (!res) {
            return
        }
        this.index = parseInt(res[1])
    }
}

export class LinkMapParser {
    objMap = new Map<number, LinkObject>()

    innerProc: any | null

    constructor(path: string) {
        const liner = new lineByLine(path);
        let line;
        while (line = liner.next()) {
            this.process(line.toString('ascii'))
        }
    }

    process_object(line: string) {
        let lo = new LinkObject(line)
        if (lo) {
            this.objMap.set(lo.index, lo)
        }
    }

    process_symbol(line: string) {
        let so = new SymbolObject(line) 
        if (so) {
            let lo = this.objMap.get(so.index)
            if (lo) {
                lo.size += so.size
            }
        }
    }

    process(line: string) {
        if (line.match("# Object files")) {
            this.innerProc = this.process_object
        } else if (line.match("# Section")) {
            this.innerProc = null
        } else if (line.match("# Symbols")) {
            this.innerProc = this.process_symbol
        } else if (line.match("# Dead Stripped")) {
            this.innerProc = null
        } else if (this.innerProc) {
            this.innerProc(line)
        }
    }

    getModuleSize(module: string): number {
        return 0
    }

    getFileSize(file: string): number {
        return 0
    }

    getTotalSize(): number {
        let result = 0
        for (const item of this.objMap) {
            result += item[1].size
        }
        return result
    }
}