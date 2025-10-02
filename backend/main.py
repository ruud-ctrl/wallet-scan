import asyncio
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from pydantic import BaseModel

# Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO on FastAPI
app_socket = socketio.ASGIApp(sio, other_asgi_app=app)


# Simple REST endpoint (optional)
class InputData(BaseModel):
    text: str

@app.post("/process")
async def process_text(data: InputData):
    return {"status": "use socket connection instead"}

# Socket.IO event handler
@sio.event
async def connect(sid, environ):
    print(f"🔌 Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ Client disconnected: {sid}")

@sio.on('start_processing')
async def handle_processing(sid, data):
    """
    Expects: { text: "hello world" }
    Sends each processed word back over time
    """
    text = data.get("text", "")
    if not text:
        await sio.emit("error", {"message": "Empty text"}, to=sid)
        return

    words = text.split()
    for word in words:
        await asyncio.sleep(1)  # simulate processing time
        processed = word[::-1].upper()
        await sio.emit("item", {"value": processed}, to=sid)

    await sio.emit("done", {"message": "Processing complete"}, to=sid)
