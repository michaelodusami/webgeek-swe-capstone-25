from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from src.core.settings import settings
from src.config.database import get_db
from src.services.user_service import UserService
from src.services.semester_service import SemesterService
from src.services.course_service import CourseService
from src.services.project_service import ProjectService
from src.services.skill_service import SkillService
from src.services.project_skill_service import ProjectSkillService
from src.services.project_user_service import ProjectUserService
from src.services.user_course_service import UserCourseService
from src.services.user_skill_service import UserSkillService

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(api_key: str = Depends(api_key_header)):
    if not api_key or api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return api_key

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency to get UserService instance."""
    return UserService(db)

def get_semester_service(db: Session = Depends(get_db)) -> SemesterService:
    """Dependency to get SemesterService instance."""
    return SemesterService(db)

def get_course_service(db: Session = Depends(get_db)) -> CourseService:
    """Dependency to get CourseService instance."""
    return CourseService(db)

def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    """Dependency to get ProjectService instance."""
    return ProjectService(db)

def get_skill_service(db: Session = Depends(get_db)) -> SkillService:
    return SkillService(db)

def get_project_skill_service(db: Session = Depends(get_db)) -> ProjectSkillService:
    return ProjectSkillService(db)

def get_project_user_service(db: Session = Depends(get_db)) -> ProjectUserService:
    return ProjectUserService(db)

def get_user_course_service(db: Session = Depends(get_db)) -> UserCourseService:
    return UserCourseService(db)

def get_user_skill_service(db: Session = Depends(get_db)) -> UserSkillService:
    return UserSkillService(db)