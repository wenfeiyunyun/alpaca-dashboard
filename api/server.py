#!/usr/bin/env python3
"""Alpaca API Server - No dependencies"""
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request

# Load credentials
with open('credentials.json') as f:
    creds = json.load(f)

API_KEY = creds['key']
API_SECRET = creds['secret']
BASE_URL = 'https://paper-api.alpaca.markets'

headers = {
    'APCA-API-KEY-ID': API_KEY,
    'APCA-API-SECRET-KEY': API_SECRET,
}

def alpaca_request(endpoint, method='GET'):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {'error': str(e)}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/account':
            data = alpaca_request('/v2/account')
        elif self.path == '/api/positions':
            data = alpaca_request('/v2/positions')
        elif self.path == '/api/orders':
            data = alpaca_request('/v2/orders?status=open')
        elif self.path == '/api/clock':
            data = alpaca_request('/v2/clock')
        else:
            data = {'error': 'Not found'}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

server = HTTPServer(('localhost', 3003), Handler)
print("🚀 Alpaca API running on http://localhost:3003")
server.serve_forever()