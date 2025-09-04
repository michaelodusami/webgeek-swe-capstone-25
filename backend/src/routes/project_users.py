from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.project_user import ProjectUserCreate, ProjectUserResponse
from src.services.project_user_service import ProjectUserService
from src.dependencies.dependencies import get_project_user_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/project-users", tags=["project-users"])

@router.post("/", status_code=201)
def create_project_user(
    project_user: ProjectUserCreate,
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """Create a new project-user relationship."""
    try:
        created_project_user = project_user_service.create_project_user(project_user)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": ProjectUserResponse.model_validate(created_project_user).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Project-user relationship creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.get("/")
def list_project_users(
    skip: int = Query(0, ge=0, description="Number of project-user relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of project-user relationships to return"),
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """List all project-user relationships with pagination."""
    project_users = project_user_service.list_project_users(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectUserResponse.model_validate(pu).model_dump(mode='json') for pu in project_users], "error": None}
    )

@router.get("/count")
def get_project_users_count(project_user_service: ProjectUserService = Depends(get_project_user_service)):
    """Get the total number of project-user relationships."""
    count = project_user_service.get_project_users_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_project_users": count}, "error": None}
    )

@router.get("/by-project/{project_id}")
def get_project_users_by_project(
    project_id: int,
    skip: int = Query(0, ge=0, description="Number of project-user relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of project-user relationships to return"),
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """Get all project-user relationships for a specific project."""
    project_users = project_user_service.get_project_users_by_project(project_id=project_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectUserResponse.model_validate(pu).model_dump(mode='json') for pu in project_users], "error": None}
    )

@router.get("/by-user/{user_id}")
def get_project_users_by_user(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of project-user relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of project-user relationships to return"),
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """Get all project-user relationships for a specific user."""
    project_users = project_user_service.get_project_users_by_user(user_id=user_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [ProjectUserResponse.model_validate(pu).model_dump(mode='json') for pu in project_users], "error": None}
    )

@router.get("/count/by-project/{project_id}")
def get_project_users_count_by_project(
    project_id: int,
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """Get the total number of project-user relationships for a specific project."""
    count = project_user_service.get_project_users_count_by_project(project_id=project_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_project_users": count}, "error": None}
    )

@router.get("/count/by-user/{user_id}")
def get_project_users_count_by_user(
    user_id: int,
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """Get the total number of project-user relationships for a specific user."""
    count = project_user_service.get_project_users_count_by_user(user_id=user_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_project_users": count}, "error": None}
    )

@router.get("/{project_user_id}")
def get_project_user(
    project_user_id: int,
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """Retrieve a project-user relationship by ID."""
    project_user = project_user_service.get_project_user_by_id(project_user_id)
    if not project_user:
        logger.warning(f"Project-user relationship with ID {project_user_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Project-user relationship not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": ProjectUserResponse.model_validate(project_user).model_dump(mode='json'), "error": None}
    )

@router.put("/{project_user_id}")
def update_project_user(
    project_user_id: int,
    project_user: ProjectUserCreate,
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """Update an existing project-user relationship by ID."""
    try:
        updated_project_user = project_user_service.update_project_user(project_user_id, project_user)
        if not updated_project_user:
            logger.warning(f"Project-user relationship with ID {project_user_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Project-user relationship not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": ProjectUserResponse.model_validate(updated_project_user).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for project-user relationship {project_user_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{project_user_id}")
def delete_project_user(
    project_user_id: int,
    project_user_service: ProjectUserService = Depends(get_project_user_service)
):
    """Delete a project-user relationship by ID."""
    try:
        deleted = project_user_service.delete_project_user(project_user_id)
        if not deleted:
            logger.warning(f"Project-user relationship with ID {project_user_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Project-user relationship not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"Project-user relationship with ID {project_user_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for project-user relationship {project_user_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        ) 