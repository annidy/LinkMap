import time
import os
import csv
import json
from data import proc_list
from http.server import BaseHTTPRequestHandler, HTTPServer

HOST_NAME = 'localhost'
PORT_NUMBER = 9000

dirname, _ = os.path.split(os.path.abspath(__file__))

class MyHandler(BaseHTTPRequestHandler):

    def do_HEAD(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

        sub_module = self.path.replace("/", "")
        if sub_module == "favicon.ico":
            response = bytes("", 'UTF-8')
        else:
            response = self.handle_http(sub_module)
        self.wfile.write(response)

    def handle_http(self, sub_module):
        self.load_data_json()
        csv_statics = {}
        with open(os.path.join(dirname, "data.csv")) as fd:
            reader = csv.reader(fd)
            try:
                for row in reader:
                    filename, size, module = row
                    if sub_module == "":
                        if module == "nil":
                            csv_statics[filename] = csv_statics.get(filename, 0) + int(size)
                        else:
                            csv_statics[module] = csv_statics.get(module, 0) + int(size)
                    else:
                        files = self.files_for_module(sub_module)
                        if files.count(filename) > 0:
                            isSub = False
                            for sm in self.modules_for_module(sub_module):
                                sub_files = self.files_for_module(sm)
                                if sub_files.count(filename) > 0:
                                    csv_statics[sm] = csv_statics.get(sm, 0) + int(size)
                                    isSub = True
                            if not isSub:
                                csv_statics[sub_module] = csv_statics.get(sub_module, 0) + int(size)

            except csv.Error as e:
                print(e)
        
        datalist = [[k, v] for k, v in csv_statics.items()]

        # read html file
        index_html = os.path.join(dirname, "index.html")
        with open(index_html) as fd:
            content = fd.read()
        content = content.replace("__datalist__", json.dumps(datalist))

        return bytes(content, 'UTF-8')

    def load_data_json(self):
        with open(os.path.join(dirname, "data.json")) as fd:
            config = json.load(fd)
            self.data_json = proc_list(config)

    def files_for_module(self, m):
        for dict in self.data_json:
            if dict["name"] == m:
                return dict["files"]
        return []

    def modules_for_module(self, m):
        for dict in self.data_json:
            if dict["name"] == m:
                return dict["modules"]
        return []

if __name__ == '__main__':
    server_class = HTTPServer
    httpd = server_class((HOST_NAME, PORT_NUMBER), MyHandler)
    print(time.asctime(), 'Server Starts - %s:%s' % (HOST_NAME, PORT_NUMBER))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print(time.asctime(), 'Server Stops - %s:%s' % (HOST_NAME, PORT_NUMBER))