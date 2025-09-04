from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.user_skill import UserSkillCreate, UserSkillResponse
from src.services.user_skill_service import UserSkillService
from src.dependencies.dependencies import get_user_skill_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user-skills", tags=["user-skills"])

@router.post("/", status_code=201)
def create_user_skill(
    user_skill: UserSkillCreate,
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Create a new user-skill relationship."""
    try:
        created_user_skill = user_skill_service.create_user_skill(user_skill)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": UserSkillResponse.model_validate(created_user_skill).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"User-skill relationship creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.get("/")
def list_user_skills(
    skip: int = Query(0, ge=0, description="Number of user-skill relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of user-skill relationships to return"),
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """List all user-skill relationships with pagination."""
    user_skills = user_skill_service.list_user_skills(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [UserSkillResponse.model_validate(us).model_dump(mode='json') for us in user_skills], "error": None}
    )

@router.get("/count")
def get_user_skills_count(user_skill_service: UserSkillService = Depends(get_user_skill_service)):
    """Get the total number of user-skill relationships."""
    count = user_skill_service.get_user_skills_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_user_skills": count}, "error": None}
    )

@router.get("/by-user/{user_id}")
def get_user_skills_by_user(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of user-skill relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of user-skill relationships to return"),
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Get all user-skill relationships for a specific user."""
    user_skills = user_skill_service.get_user_skills_by_user(user_id=user_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [UserSkillResponse.model_validate(us).model_dump(mode='json') for us in user_skills], "error": None}
    )

@router.get("/by-skill/{skill_id}")
def get_user_skills_by_skill(
    skill_id: int,
    skip: int = Query(0, ge=0, description="Number of user-skill relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of user-skill relationships to return"),
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Get all user-skill relationships for a specific skill."""
    user_skills = user_skill_service.get_user_skills_by_skill(skill_id=skill_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [UserSkillResponse.model_validate(us).model_dump(mode='json') for us in user_skills], "error": None}
    )

@router.get("/count/by-user/{user_id}")
def get_user_skills_count_by_user(
    user_id: int,
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Get the total number of user-skill relationships for a specific user."""
    count = user_skill_service.get_user_skills_count_by_user(user_id=user_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_user_skills": count}, "error": None}
    )

@router.get("/count/by-skill/{skill_id}")
def get_user_skills_count_by_skill(
    skill_id: int,
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Get the total number of user-skill relationships for a specific skill."""
    count = user_skill_service.get_user_skills_count_by_skill(skill_id=skill_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_user_skills": count}, "error": None}
    )

@router.get("/{user_skill_id}")
def get_user_skill(
    user_skill_id: int,
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Retrieve a user-skill relationship by ID."""
    user_skill = user_skill_service.get_user_skill_by_id(user_skill_id)
    if not user_skill:
        logger.warning(f"User-skill relationship with ID {user_skill_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "User-skill relationship not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": UserSkillResponse.model_validate(user_skill).model_dump(mode='json'), "error": None}
    )

@router.put("/{user_skill_id}")
def update_user_skill(
    user_skill_id: int,
    user_skill: UserSkillCreate,
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Update an existing user-skill relationship by ID."""
    try:
        updated_user_skill = user_skill_service.update_user_skill(user_skill_id, user_skill)
        if not updated_user_skill:
            logger.warning(f"User-skill relationship with ID {user_skill_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "User-skill relationship not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": UserSkillResponse.model_validate(updated_user_skill).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for user-skill relationship {user_skill_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{user_skill_id}")
def delete_user_skill(
    user_skill_id: int,
    user_skill_service: UserSkillService = Depends(get_user_skill_service)
):
    """Delete a user-skill relationship by ID."""
    try:
        deleted = user_skill_service.delete_user_skill(user_skill_id)
        if not deleted:
            logger.warning(f"User-skill relationship with ID {user_skill_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "User-skill relationship not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"User-skill relationship with ID {user_skill_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for user-skill relationship {user_skill_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        ) 