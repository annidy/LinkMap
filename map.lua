#!/usr/bin/env lua

-- introduce: http://blog.cnbang.net/tech/2296/

obj_tbl = {}   		-- {[3]={file, module}}
syb_tbl = {}   		-- {[3]=47}
filter_tbl = nil	-- {'Test.o'}

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

function summy(filter)
	local filter_app = false
	local appname
	if filter ~= nil then
		filter_tbl = {}
		for line in io.lines(filter) do 
			local ext = line:match('[^.]+$')
			if ext == "h" then
				-- header file ignore
			elseif ext == "a" then
				filter_tbl[line] = true
			elseif ext == "framework" then   -- framework
				local symb = line:sub(1, -2-(ext:len()))
				filter_tbl[symb] = true
			elseif ext == "app" then  
				filter_app = true
				appname = line
			elseif ext == nil then
				-- ignore
			else
				local symb = line:sub(1, -1-(ext:len())).."o"
				filter_tbl[symb] = true
			end
		end
	end
	for i, s in pairs(syb_tbl) do
		local file, module_ = unpack(obj_tbl[i])
		if filter_tbl then
			if filter_tbl[file] or filter_tbl[module_] then
				print(string.format("%s,%d,%s",file, s, module_))
			end
			if module_ == nil and filter_app then
				print(string.format("%s,%d,%s",file, s, appname))
			end
		else
			print(string.format("%s,%d,%s",file, s, module_))
		end
	end
end

if arg[1] == nil then
	print(string.format([[
Usage: %s linkmap [filter]
	linkmap depends on your project setting.
	usually at ~/Library/Developer/Xcode/DerivedData/xxx/Build/Intermediates/xxx.build/Debug-iphoneos/xx.build
	
	filter is a file contans file|lib|framework|app names, default to print all.
	`find . -type f | xargs basename > filter.txt`, simple way to generate filter for current directory.

	`awk -F, '{sum+=$2} END {print sum}'` is the fast way to calc total
	]], arg[0]))
	return
end

process(arg[1])
summy(arg[2])