from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.project import ProjectCreate, ProjectResponse
from src.services.project_service import ProjectService
from src.dependencies.dependencies import get_project_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/", status_code=201)
def create_project(
    project: ProjectCreate,
    project_service: ProjectService = Depends(get_project_service)
):
    """Create a new project."""
    try:
        created_project = project_service.create_project(project)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": ProjectResponse.model_validate(created_project).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Project creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.get("/")
def list_projects(
    skip: int = Query(0, ge=0, description="Number of projects to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of projects to return"),
    project_service: ProjectService = Depends(get_project_service)
):
    """List all projects with pagination."""
    projects = project_service.list_projects(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectResponse.model_validate(p).model_dump(mode='json') for p in projects], "error": None}
    )

@router.get("/count")
def get_projects_count(project_service: ProjectService = Depends(get_project_service)):
    """Get the total number of projects."""
    count = project_service.get_projects_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_projects": count}, "error": None}
    )

@router.get("/search")
def search_projects(
    q: str = Query(..., description="Search term for title, description, or team name"),
    skip: int = Query(0, ge=0, description="Number of projects to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of projects to return"),
    project_service: ProjectService = Depends(get_project_service)
):
    """Search projects by title, description, or team name."""
    projects = project_service.search_projects(search_term=q, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectResponse.model_validate(p).model_dump(mode='json') for p in projects], "error": None}
    )

@router.get("/by-course/{course_id}")
def get_projects_by_course(
    course_id: int,
    skip: int = Query(0, ge=0, description="Number of projects to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of projects to return"),
    project_service: ProjectService = Depends(get_project_service)
):
    """Get all projects for a specific course."""
    projects = project_service.get_projects_by_course(course_id=course_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectResponse.model_validate(p).model_dump(mode='json') for p in projects], "error": None}
    )

@router.get("/by-team/{team_name}")
def get_projects_by_team_name(
    team_name: str,
    skip: int = Query(0, ge=0, description="Number of projects to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of projects to return"),
    project_service: ProjectService = Depends(get_project_service)
):
    """Get projects by team name."""
    projects = project_service.get_projects_by_team_name(team_name=team_name, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectResponse.model_validate(p).model_dump(mode='json') for p in projects], "error": None}
    )

@router.get("/by-capacity")
def get_projects_by_capacity(
    min_capacity: Optional[int] = Query(None, ge=0, description="Minimum capacity filter"),
    max_capacity: Optional[int] = Query(None, ge=0, description="Maximum capacity filter"),
    skip: int = Query(0, ge=0, description="Number of projects to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of projects to return"),
    project_service: ProjectService = Depends(get_project_service)
):
    """Get projects filtered by capacity range."""
    projects = project_service.get_projects_by_capacity(min_capacity=min_capacity, max_capacity=max_capacity, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectResponse.model_validate(p).model_dump(mode='json') for p in projects], "error": None}
    )

@router.get("/without-course")
def get_projects_without_course(
    skip: int = Query(0, ge=0, description="Number of projects to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of projects to return"),
    project_service: ProjectService = Depends(get_project_service)
):
    """Get projects that are not assigned to any course."""
    projects = project_service.get_projects_without_course(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectResponse.model_validate(p).model_dump(mode='json') for p in projects], "error": None}
    )

@router.get("/count/by-course/{course_id}")
def get_projects_count_by_course(
    course_id: int,
    project_service: ProjectService = Depends(get_project_service)
):
    """Get the total number of projects for a specific course."""
    count = project_service.get_projects_count_by_course(course_id=course_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_projects": count}, "error": None}
    )

@router.get("/{project_id}")
def get_project(
    project_id: int,
    project_service: ProjectService = Depends(get_project_service)
):
    """Retrieve a project by ID."""
    project = project_service.get_project_by_id(project_id)
    if not project:
        logger.warning(f"Project with ID {project_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Project not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": ProjectResponse.model_validate(project).model_dump(mode='json'), "error": None}
    )

@router.put("/{project_id}")
def update_project(
    project_id: int,
    project: ProjectCreate,
    project_service: ProjectService = Depends(get_project_service)
):
    """Update an existing project by ID."""
    try:
        updated_project = project_service.update_project(project_id, project)
        if not updated_project:
            logger.warning(f"Project with ID {project_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Project not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": ProjectResponse.model_validate(updated_project).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for project {project_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    project_service: ProjectService = Depends(get_project_service)
):
    """Delete a project by ID."""
    try:
        deleted = project_service.delete_project(project_id)
        if not deleted:
            logger.warning(f"Project with ID {project_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Project not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"Project with ID {project_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for project {project_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        ) 