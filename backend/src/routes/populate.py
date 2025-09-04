from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from src.core.settings import settings
from src.dependencies.dependencies import get_user_service, get_semester_service, get_course_service, get_project_service, get_skill_service, get_project_skill_service, get_project_user_service, get_user_course_service, get_user_skill_service
from src.services.user_service import UserService
from src.services.semester_service import SemesterService
from src.services.course_service import CourseService
from src.services.project_service import ProjectService
from src.services.skill_service import SkillService
from src.services.project_skill_service import ProjectSkillService
from src.services.project_user_service import ProjectUserService
from src.services.user_course_service import UserCourseService
from src.services.user_skill_service import UserSkillService
from src.model.user import UserCreate
from src.model.semester import SemesterCreate
from src.model.course import CourseCreate
from src.model.project import ProjectCreate
from src.model.skill import SkillCreate
from src.model.project_skill import ProjectSkillCreate
from src.model.project_user import ProjectUserCreate
from src.model.user_course import UserCourseCreate
from src.model.user_skill import UserSkillCreate
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/populate", tags=["populate"])

@router.post("/", status_code=201)
def populate_database(
    user_service: UserService = Depends(get_user_service),
    semester_service: SemesterService = Depends(get_semester_service),
    course_service: CourseService = Depends(get_course_service),
    project_service: ProjectService = Depends(get_project_service),
    skill_service: SkillService = Depends(get_skill_service),
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service),
    project_user_service: ProjectUserService = Depends(get_project_user_service),
    user_course_service: UserCourseService = Depends(get_user_course_service),
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Populate database with sample data (development only)."""
    if settings.ENVIRONMENT != "development":
        raise HTTPException(status_code=403, detail="This endpoint is only available in development mode")
    
    try:
        # Sample data
        sample_data = {
            "users": [
                UserCreate(username="john_doe", edupersonprimaryaffiliation="student", uupid="john123", edupersonprincipalname="john@vt.edu"),
                UserCreate(username="jane_smith", edupersonprimaryaffiliation="student", uupid="jane456", edupersonprincipalname="jane@vt.edu"),
                UserCreate(username="bob_wilson", edupersonprimaryaffiliation="student", uupid="bob789", edupersonprincipalname="bob@vt.edu"),
                UserCreate(username="alice_jones", edupersonprimaryaffiliation="staff", uupid="alice101", edupersonprincipalname="alice@vt.edu"),
                UserCreate(username="charlie_brown", edupersonprimaryaffiliation="student", uupid="charlie202", edupersonprincipalname="charlie@vt.edu")
            ],
            "semesters": [
                SemesterCreate(displayName="Fall 2024", semesterStartDate=datetime(2024, 8, 26), semesterEndDate=datetime(2024, 12, 13)),
                SemesterCreate(displayName="Spring 2025", semesterStartDate=datetime(2025, 1, 13), semesterEndDate=datetime(2025, 5, 2))
            ],
            "skills": [
                SkillCreate(name="Python"),
                SkillCreate(name="JavaScript"),
                SkillCreate(name="React"),
                SkillCreate(name="Node.js"),
                SkillCreate(name="SQL"),
                SkillCreate(name="Git"),
                SkillCreate(name="Docker"),
                SkillCreate(name="AWS"),
                SkillCreate(name="Machine Learning"),
                SkillCreate(name="Data Analysis")
            ],
            "courses": [
                CourseCreate(semester_id=1, crn="12345", displayName="CS 3704 - Software Engineering"),
                CourseCreate(semester_id=1, crn="12346", displayName="CS 3214 - Computer Systems"),
                CourseCreate(semester_id=2, crn="12347", displayName="CS 4604 - Introduction to Database Management Systems")
            ],
            "projects": [
                ProjectCreate(course_id=1, title="Web Application", description="Build a full-stack web application", maxCapacity=4, teamName="Team Alpha"),
                ProjectCreate(course_id=1, title="Mobile App", description="Develop a mobile application", maxCapacity=3, teamName="Team Beta"),
                ProjectCreate(course_id=2, title="System Optimization", description="Optimize system performance", maxCapacity=2, teamName="Team Gamma"),
                ProjectCreate(course_id=3, title="Database Design", description="Design and implement a database", maxCapacity=4, teamName="Team Delta")
            ]
        }
        
        created_data = {
            "users": [],
            "semesters": [],
            "skills": [],
            "courses": [],
            "projects": [],
            "project_skills": [],
            "project_users": [],
            "user_courses": [],
            "user_skills": []
        }
        
        # Create users
        logger.info("Creating users...")
        for user_data in sample_data["users"]:
            try:
                created_user = user_service.create_user(user_data)
                created_data["users"].append(created_user)
            except Exception as e:
                logger.warning(f"Failed to create user {user_data.username}: {e}")
        
        # Create semesters
        logger.info("Creating semesters...")
        for semester_data in sample_data["semesters"]:
            try:
                created_semester = semester_service.create_semester(semester_data)
                created_data["semesters"].append(created_semester)
            except Exception as e:
                logger.warning(f"Failed to create semester {semester_data.name}: {e}")
        
        # Create skills
        logger.info("Creating skills...")
        for skill_data in sample_data["skills"]:
            try:
                created_skill = skill_service.create_skill(skill_data)
                created_data["skills"].append(created_skill)
            except Exception as e:
                logger.warning(f"Failed to create skill {skill_data.name}: {e}")
        
        # Create courses
        logger.info("Creating courses...")
        for course_data in sample_data["courses"]:
            try:
                created_course = course_service.create_course(course_data)
                created_data["courses"].append(created_course)
            except Exception as e:
                logger.warning(f"Failed to create course {course_data.displayName}: {e}")
        
        # Create projects
        logger.info("Creating projects...")
        for project_data in sample_data["projects"]:
            try:
                created_project = project_service.create_project(project_data)
                created_data["projects"].append(created_project)
            except Exception as e:
                logger.warning(f"Failed to create project {project_data.title}: {e}")
        
        # Create relationships
        logger.info("Creating relationships...")
        
        # Assign skills to projects
        if created_data["projects"] and created_data["skills"]:
            for i, project in enumerate(created_data["projects"]):
                for j, skill in enumerate(created_data["skills"]):
                    if (i + j) % 3 == 0:  # Assign some skills to projects
                        try:
                            project_skill_data = ProjectSkillCreate(project_id=project.id, skill_id=skill.id)
                            created_project_skill = project_skill_service.create_project_skill(project_skill_data)
                            created_data["project_skills"].append(created_project_skill)
                        except Exception as e:
                            logger.warning(f"Failed to create project-skill relationship: {e}")
        
        # Assign users to projects
        if created_data["projects"] and created_data["users"]:
            for i, project in enumerate(created_data["projects"]):
                for j, user in enumerate(created_data["users"]):
                    if (i + j) % 2 == 0:  # Assign some users to projects
                        try:
                            project_user_data = ProjectUserCreate(project_id=project.id, user_id=user.id)
                            created_project_user = project_user_service.create_project_user(project_user_data)
                            created_data["project_users"].append(created_project_user)
                        except Exception as e:
                            logger.warning(f"Failed to create project-user relationship: {e}")
        
        # Assign users to courses
        if created_data["courses"] and created_data["users"]:
            for i, course in enumerate(created_data["courses"]):
                for j, user in enumerate(created_data["users"]):
                    if (i + j) % 2 == 0:  # Assign some users to courses
                        try:
                            user_course_data = UserCourseCreate(user_id=user.id, course_id=course.id)
                            created_user_course = user_course_service.create_user_course(user_course_data)
                            created_data["user_courses"].append(created_user_course)
                        except Exception as e:
                            logger.warning(f"Failed to create user-course relationship: {e}")
        
        # Assign skills to users
        if created_data["users"] and created_data["skills"]:
            for i, user in enumerate(created_data["users"]):
                for j, skill in enumerate(created_data["skills"]):
                    if (i + j) % 2 == 0:  # Assign some skills to users
                        try:
                            user_skill_data = UserSkillCreate(user_id=user.id, skill_id=skill.id)
                            created_user_skill = user_skill_service.create_user_skill(user_skill_data)
                            created_data["user_skills"].append(created_user_skill)
                        except Exception as e:
                            logger.warning(f"Failed to create user-skill relationship: {e}")
        
        # Count created items
        counts = {
            "users": len(created_data["users"]),
            "semesters": len(created_data["semesters"]),
            "skills": len(created_data["skills"]),
            "courses": len(created_data["courses"]),
            "projects": len(created_data["projects"]),
            "project_skills": len(created_data["project_skills"]),
            "project_users": len(created_data["project_users"]),
            "user_courses": len(created_data["user_courses"]),
            "user_skills": len(created_data["user_skills"])
        }
        
        logger.info(f"Database populated successfully with {sum(counts.values())} total items")
        
        return JSONResponse(
            status_code=201,
            content={
                "success": True,
                "data": {
                    "message": "Database populated successfully",
                    "counts": counts,
                    "details": {
                        "users_created": len(created_data["users"]),
                        "semesters_created": len(created_data["semesters"]),
                        "skills_created": len(created_data["skills"]),
                        "courses_created": len(created_data["courses"]),
                        "projects_created": len(created_data["projects"]),
                        "relationships_created": len(created_data["project_skills"]) + len(created_data["project_users"]) + len(created_data["user_courses"]) + len(created_data["user_skills"])
                    }
                },
                "error": None
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to populate database: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "data": None,
                "error": f"Failed to populate database: {str(e)}"
            }
        ) 