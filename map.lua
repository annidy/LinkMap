#!/usr/bin/env lua

-- http://www.jianshu.com/p/92a041b1b825

obj_tbl = {}   		-- {[3]={file, module}}
syb_tbl = {}   		-- {[3]=47}
filter_tbl = nil	-- {'Test.o'}
appname = nil

function process_object(line)
	local k, v = string.match(line, '%[%s*(%d*)%] (.*)')
	if k == 0 or k == nil or v == nil then
		return
	end
	local m, f = string.match(v, '([^/]*)%((.*)%)')
	if m == nil then
		f = string.match(v, '([^/]*)$')
	end
	if f == nil then
		return
	end
	obj_tbl[k] = {f, m}
end

function process_symbol(line)
	local s, i = string.match(line, '%s0x(%x+)%s%[%s*(%d*)%]')
	if s == nil or i == nil then
		return
	end
	if syb_tbl[i] == nil then
		syb_tbl[i] = tonumber(s, 16)
	else
		syb_tbl[i] = syb_tbl[i] + tonumber(s, 16)
	end
	-- print(i)
end

-------------------------------------------------------------

function process(path)
	local fun = nil
	for line in io.lines(path) do 
		if line:match("# Object files") ~= nil then
			fun = process_object
		elseif line:match("# Section") ~= nil then
			fun = nil
		elseif line:match("# Symbols") ~= nil then
			fun = process_symbol
		elseif fun ~= nil then
			fun(line)
		end
	end
end

function feed_filter(filter_txt)
    if filter_tbl == nil then
        filter_tbl = {}
    end
    local ext = filter_txt:match('[^.]+$')
    if ext == "h" then
        -- header file ignore
    elseif ext == "a" then
        filter_tbl[filter_txt] = true
    elseif ext == "framework" then   -- framework
        local symb = filter_txt:sub(1, -2-(ext:len()))
        filter_tbl[symb] = true
    elseif ext == "app" then  
        appname = filter_txt
    elseif ext == nil then
        -- ignore
    else
        local symb = filter_txt:sub(1, -1-(ext:len())).."o"
        filter_tbl[symb] = true
    end
end

function summy()
	for i, s in pairs(syb_tbl) do
		local file, module_ = unpack(obj_tbl[i])
		if filter_tbl then
			if filter_tbl[file] or filter_tbl[module_] then
				print(string.format("%s,%d,%s",file, s, module_))
			end
			if module_ == nil and appname ~= nil then
				print(string.format("%s,%d,%s",file, s, appname))
			end
		else
			print(string.format("%s,%d,%s",file, s, module_))
		end
	end
end

function file_exists(name)
   local f=io.open(name,"r")
   if f~=nil then io.close(f) return true else return false end
end

-------------------------- main -----------------------

if arg[1] == nil then
	print(string.format([[
Usage: %s linkmap [filter]
	linkmap depends on your project setting.
	usually at ~/Library/Developer/Xcode/DerivedData/xxx/Build/Intermediates/xxx.build/Debug-iphoneos/xx.build/xxx-LinkMap-normal-arm64.txt
	
	filter is (a file contans) file|lib|framework|app names, default to print all.
	`find . -type f | xargs basename > filter.txt`, simple way to generate filter for current directory.

    `awk -F, '{sum+=$2} END {print sum}'` is the fast way to calc total
    
    or better print format

    `awk -F, 'function human(x) {CONVFMT="%.1f"; if (x<1000) {return x} else {x/=1024} s="kMGTEPZY"; while (x>=1000 && length(s)>1) {x/=1024; s=substr(s,2)} return (x) substr(s,1,1) } {sum+=$2} END { print human(sum)}'`

	]], arg[0]))
	return
end

if arg[2] ~= nil then
    if file_exists(arg[2]) then
        for line in io.lines(arg[2]) do 
            feed_filter(line)
        end
    else
        feed_filter(arg[2])
    end
end

process(arg[1])
summy()