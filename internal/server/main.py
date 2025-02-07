from fastapi import FastAPI

from .routes import router as upload_router

app = FastAPI(title="EPUB Upload Service")

# Include routes
app.include_router(upload_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8080)
