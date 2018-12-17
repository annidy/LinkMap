import subprocess
import os
import pprint
def get_ar_file(path=None, arch=None, files=None, **kwargs):
    if files != None:
        return files
    if path == None:
        return []
    opath = path
    if arch != None:
        opath = path+"~"
        subprocess.run(["lipo", "-thin", arch, path, "-output", opath])

    files = []
    with subprocess.Popen(["ar", "-t", opath], stdout=subprocess.PIPE) as proc:
        for f in proc.stdout.readlines():
            files.append(f.decode().replace('\n',''))
    if opath != path:
        os.remove(opath)
    return files

def proc_list(lists):
    for dict in lists:
        dict['files'] = get_ar_file(**dict)
    return lists

if __name__ == '__main__':
    a = [{
        "name": "libavcodec",
        "path": '/usr/local/lib/libavcodec.a',
        "modules": ["libavfilter"]
        }, 
        {
        "name": "libavfilter",
        "path": "/usr/local/lib/libavfilter.a",
        "modules": []
        }
    ]
    pprint.pprint(proc_list(a))