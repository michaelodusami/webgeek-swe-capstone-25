from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.project_skill import ProjectSkillCreate, ProjectSkillResponse
from src.services.project_skill_service import ProjectSkillService
from src.dependencies.dependencies import get_project_skill_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/project-skills", tags=["project-skills"])

@router.post("/", status_code=201)
def create_project_skill(
    project_skill: ProjectSkillCreate,
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """Create a new project-skill relationship."""
    try:
        created_project_skill = project_skill_service.create_project_skill(project_skill)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": ProjectSkillResponse.model_validate(created_project_skill).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Project-skill relationship creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.get("/")
def list_project_skills(
    skip: int = Query(0, ge=0, description="Number of project-skill relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of project-skill relationships to return"),
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """List all project-skill relationships with pagination."""
    project_skills = project_skill_service.list_project_skills(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectSkillResponse.model_validate(ps).model_dump(mode='json') for ps in project_skills], "error": None}
    )

@router.get("/count")
def get_project_skills_count(project_skill_service: ProjectSkillService = Depends(get_project_skill_service)):
    """Get the total number of project-skill relationships."""
    count = project_skill_service.get_project_skills_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_project_skills": count}, "error": None}
    )

@router.get("/by-project/{project_id}")
def get_project_skills_by_project(
    project_id: int,
    skip: int = Query(0, ge=0, description="Number of project-skill relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of project-skill relationships to return"),
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """Get all project-skill relationships for a specific project."""
    project_skills = project_skill_service.get_project_skills_by_project(project_id=project_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectSkillResponse.model_validate(ps).model_dump(mode='json') for ps in project_skills], "error": None}
    )

@router.get("/by-skill/{skill_id}")
def get_project_skills_by_skill(
    skill_id: int,
    skip: int = Query(0, ge=0, description="Number of project-skill relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of project-skill relationships to return"),
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """Get all project-skill relationships for a specific skill."""
    project_skills = project_skill_service.get_project_skills_by_skill(skill_id=skill_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectSkillResponse.model_validate(ps).model_dump(mode='json') for ps in project_skills], "error": None}
    )

@router.get("/count/by-project/{project_id}")
def get_project_skills_count_by_project(
    project_id: int,
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """Get the total number of project-skill relationships for a specific project."""
    count = project_skill_service.get_project_skills_count_by_project(project_id=project_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_project_skills": count}, "error": None}
    )

@router.get("/count/by-skill/{skill_id}")
def get_project_skills_count_by_skill(
    skill_id: int,
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """Get the total number of project-skill relationships for a specific skill."""
    count = project_skill_service.get_project_skills_count_by_skill(skill_id=skill_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_project_skills": count}, "error": None}
    )

@router.get("/{project_skill_id}")
def get_project_skill(
    project_skill_id: int,
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """Retrieve a project-skill relationship by ID."""
    project_skill = project_skill_service.get_project_skill_by_id(project_skill_id)
    if not project_skill:
        logger.warning(f"Project-skill relationship with ID {project_skill_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Project-skill relationship not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": ProjectSkillResponse.model_validate(project_skill).model_dump(mode='json'), "error": None}
    )

@router.put("/{project_skill_id}")
def update_project_skill(
    project_skill_id: int,
    project_skill: ProjectSkillCreate,
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """Update an existing project-skill relationship by ID."""
    try:
        updated_project_skill = project_skill_service.update_project_skill(project_skill_id, project_skill)
        if not updated_project_skill:
            logger.warning(f"Project-skill relationship with ID {project_skill_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Project-skill relationship not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": ProjectSkillResponse.model_validate(updated_project_skill).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for project-skill relationship {project_skill_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{project_skill_id}")
def delete_project_skill(
    project_skill_id: int,
    project_skill_service: ProjectSkillService = Depends(get_project_skill_service)
):
    """Delete a project-skill relationship by ID."""
    try:
        deleted = project_skill_service.delete_project_skill(project_skill_id)
        if not deleted:
            logger.warning(f"Project-skill relationship with ID {project_skill_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Project-skill relationship not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"Project-skill relationship with ID {project_skill_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for project-skill relationship {project_skill_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        ) 