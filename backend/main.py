from fastapi import Depends, FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from src.core.settings import settings
import logging
from src.config.database import engine
from src.dependencies.dependencies import get_api_key
from src.routes.users import router as users_router
from src.routes.auth import router as auth_router
from src.routes.semesters import router as semesters_router
from src.routes.courses import router as courses_router
from src.routes.projects import router as projects_router
from src.routes.skills import router as skills_router
from src.routes.project_skills import router as project_skills_router
from src.routes.project_users import router as project_users_router
from src.routes.user_courses import router as user_courses_router
from src.routes.user_skills import router as user_skills_router
from src.routes.populate import router as populate_router

import src.model.user_skill
from src.config.base import Base
from src.config.database import engine
# Configure logging
logging.basicConfig(level=logging.DEBUG if settings.DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

print(f"DEBUG: DATABASE_URL = {settings.database_url}")

app = FastAPI(debug=settings.DEBUG, docs_url="/api/docs", openapi_url="/api/openapi.json")
# app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"] if settings.ENVIRONMENT == "development" else ["https://webgeek.discovery.cs.vt.edu", 'https://login.vt.edu', "https://webgeek.discovery.cs.vt.edu/"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
)
# # Create tables
import src.model.user 
import src.model.semester
import src.model.course
import src.model.project
import src.model.skill
import src.model.project_skill
import src.model.project_user
import src.model.user_course
import src.model.user_skill
from src.config.base import Base
from src.config.database import engine

logger.info("Creating database tables...")
Base.metadata.create_all(bind=engine)
logger.info("Database tables created successfully")

# Include router
app.include_router(auth_router)
app.include_router(users_router, dependencies=[Depends(get_api_key)])
app.include_router(semesters_router, dependencies=[Depends(get_api_key)])
app.include_router(courses_router, dependencies=[Depends(get_api_key)])
app.include_router(projects_router, dependencies=[Depends(get_api_key)])
app.include_router(skills_router, dependencies=[Depends(get_api_key)])
app.include_router(project_skills_router, dependencies=[Depends(get_api_key)])
app.include_router(project_users_router, dependencies=[Depends(get_api_key)])
app.include_router(user_courses_router, dependencies=[Depends(get_api_key)])
app.include_router(user_skills_router, dependencies=[Depends(get_api_key)])


# Include populate router only in development mode
if settings.ENVIRONMENT == "development":
    app.include_router(populate_router, dependencies=[Depends(get_api_key)])

@app.get("/api")
def welcomeToWebGeekBackend():
    logger.info(f"Running in {settings.ENVIRONMENT} mode")
    return {"Welcome To The Backend": f"FASTAPI v0.0 in {settings.ENVIRONMENT} mode"}

@app.get("/api/test")
def test():
    return {"Welcome To The TEST ENDPOINT Backend": "FASTAPI v0.0 in test mode"}