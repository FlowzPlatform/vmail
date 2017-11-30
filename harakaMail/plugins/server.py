import sys
import talon
from talon import quotations
from aiohttp import web
import socketio
import json

if sys.argv[1] != '' and 1023 > int(sys.argv[1]) < 65535:
    portNo = sys.argv[1]
else:
    portNo = 6000

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

# async def index(request):
#     """Serve the client-side application."""
#     with open('index.html') as f:
#         return web.Response(text=f.read(), content_type='text/html')

@sio.on('connect', namespace='/')
def connect(sid, environ):
    print("connect ", sid)

@sio.on('html', namespace='/')
async def message(sid, data):
    reply = quotations.extract_from_html(data)
    await sio.emit('reply', reply)

@sio.on('text', namespace='/')
async def message(sid, data):
    reply = quotations.extract_from(data, 'type/plain')
    await sio.emit('reply', reply)

@sio.on('disconnect', namespace='/')
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    web.run_app(app, host='127.0.0.1', port=portNo)
