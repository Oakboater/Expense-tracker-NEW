from fastapi import FastAPI

app = FastAPI()

@app.get("/")

def read_roots():
    return {"boot up complete": "Tracker API is running!"}
