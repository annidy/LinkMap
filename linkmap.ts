import { readFile } from "fs";

const lineByLine = require('n-readlines');
const _ = require('lodash')

function basename(path: string) {
    return path.split('/').reverse()[0];
 }

class LinkObject {
    index: string
    file: string | null = null
    module: string | null = null
    size = 0
    constructor(line: string) {
        var res = line.match(']')
        if (!res) {
            throw `${line}: synax error`
        }
        this.index = line.substr(0, res.index+1)
        let path = line.substr(res.index+2)
        res = path.match(/\((.*)\)$/)
        if (res) {
            this.file = res[1]
            this.module = basename(path.substr(0, res.index))
        } else {
            this.file = basename(path)
        }
    }
}

class SymbolObject {
    size: number
    index: string

    constructor(line: string) {
        var res = line.split('\t')
        if (!res || res.length != 3) {
            throw `${line}: synax error`
        }
        this.size = parseInt(res[1])
        var path_range = res[2].match(']')
        if (!path_range) {
            throw `${line}: synax error`
        }
        this.index = res[2].substr(0, path_range.index+1)
    }
}

export class LinkMapParser {
    objMap = new Map<string, LinkObject>()

    innerProc: any | null

    constructor(path: string) {
        const liner = new lineByLine(path);
        let line;
        var reachFiles = false
        var reachSymbols = false
        var reachSections = false
        var reachDeadStrippedSymbols = false
        while (line = liner.next()) {
            line = line.toString('ascii')
            if (line.match(/^#/)) {
                if (line.match("# Object files")) {
                    reachFiles = true
                } else if (line.match("# Section")) {
                    reachSections = true
                } else if (line.match("# Symbols")) {
                    reachSymbols = true
                } else if (line.match("# Dead Stripped Symbols")) {
                    reachDeadStrippedSymbols = true
                }
            } else {
                if (reachFiles && !reachSections && !reachSymbols && !reachDeadStrippedSymbols) {
                    this.process_object(line)
                } else if (reachFiles && reachSections && reachSymbols && !reachDeadStrippedSymbols) {
                    this.process_symbol(line)
                }
            }
        }
    }

    process_object(line: string) {
        try {
            let lo = new LinkObject(line)
            this.objMap.set(lo.index, lo)
        } catch (error) {
            console.error(error)
        }
    }

    process_symbol(line: string) {
        try {
            let so = new SymbolObject(line) 
            let lo = this.objMap.get(so.index)
            lo.size += so.size
        } catch (error) {
            console.error(error)
        }
    }

    getModuleFileSize(module: string | RegExp): Array<[string, number, string]> {
        let result = new Array<[string, number, string]>()
        for (const item of this.objMap) {
            if (item[1].module) {
                if (item[1].module.match(module)) {
                    result.push([item[1].file || "unknown", item[1].size, item[1].module])
                }
            }
        }
        return result.sort((a, b) => b[1] - a[1])
    }

    getModuleList(): Array<string> {
        let result = new Array<string>()

        let moduleset = new Set
        for (const item of this.objMap) {
            if (item[1].module) {
                moduleset.add(item[1].module)
            }
        }

        moduleset.forEach((value: string, key) => {
            result.push(value)
        })

        return result
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