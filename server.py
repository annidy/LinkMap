import time
import os
import csv
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

HOST_NAME = 'localhost'
PORT_NUMBER = 9000

dirname, _ = os.path.split(os.path.abspath(__file__))

class CSVSource:
    def __init__(self):
        self.data = []
        with open(os.path.join(dirname, "data.csv")) as fd:
            reader = csv.reader(fd)
            try:
                for row in reader:
                    self.data.append(row)
            except csv.Error as e:
                print(e)
            pass
        with open(os.path.join(dirname, "data.json")) as fd:
            self.config = json.load(fd)
            pass
    
    def datalist(self, paths):
        d = {}

        for row in self.data:
            filename, size, module = row
            if module == "nil":
                d[filename] = d.get(filename, 0) + int(size)
            else:
                d[module] = d.get(module, 0) + int(size)


            paths.

        return [[k, v] for k, v in d.items()]

class MyHandler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):

        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

        response = self.handle_http(self.path)
        self.wfile.write(response)

    def handle_http(self, path):
        index_html = os.path.join(dirname, "index.html")
        with open(index_html) as fd:
            content = fd.read()       

        source = CSVSource()
        content = content.replace("__datalist__", json.dumps(source.datalist(path.split('/'))))

        return bytes(content, 'UTF-8')

        


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