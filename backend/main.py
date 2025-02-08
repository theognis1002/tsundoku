from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as upload_router

app = FastAPI(title="EPUB Upload Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(upload_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost")
