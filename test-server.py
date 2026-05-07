#!/usr/bin/env python3
"""
Simple HTTP server for local testing of the news-agent dashboard.
Run this script and open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import os

PORT = 8000

print(f"🚀 Starting local server...")
print(f"📊 Dashboard available at: http://localhost:{PORT}")
print(f"📁 Serving files from: {os.getcwd()}")
print(f"🔴 Press Ctrl+C to stop the server")
print()

with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")
