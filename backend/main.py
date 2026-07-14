from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.routers import auth, triage, cases, enrichment, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(
    yield

app = FastAPI(
    title="SOC Copilot API",
    description="AI-powered alert triage and playbook assistant for SOC analysts",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(triage.router)
app.include_router(cases.router)
app.include_router(enrichment.router)
app.include_router(dashboard.router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "SOC Copilot"}
