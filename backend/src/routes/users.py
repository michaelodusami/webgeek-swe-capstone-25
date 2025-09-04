from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.user import UserCreate, UserResponse
from src.services.user_service import UserService
from src.dependencies.dependencies import get_user_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/", status_code=201)
def create_user(
    user: UserCreate, 
    user_service: UserService = Depends(get_user_service)
):
    """Create a new user."""
    try:
        created_user = user_service.create_user(user)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": UserResponse.model_validate(created_user).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"User creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.get("/")
def list_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of users to return"),
    user_service: UserService = Depends(get_user_service)
):
    """List all users with pagination."""
    users = user_service.list_users(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [UserResponse.model_validate(u).model_dump(mode='json') for u in users], "error": None}
    )

@router.get("/count")
def get_users_count(user_service: UserService = Depends(get_user_service)):
    """Get the total number of users."""
    count = user_service.get_users_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_users": count}, "error": None}
    )

@router.get("/search")
def search_users(
    q: str = Query(..., description="Search term for username, UUPID, or edupersonprincipalname"),
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of users to return"),
    user_service: UserService = Depends(get_user_service)
):
    """Search users by username, UUPID, or edupersonprincipalname."""
    users = user_service.search_users(search_term=q, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [UserResponse.model_validate(u).model_dump(mode='json') for u in users], "error": None}
    )

@router.get("/{user_id}")
def get_user(
    user_id: int, 
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a user by ID."""
    user = user_service.get_user_by_id(user_id)
    if not user:
        logger.warning(f"User with ID {user_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "User not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": UserResponse.model_validate(user).model_dump(mode='json'), "error": None}
    )

@router.get("/by-uupid/{uupid}")
def get_user_by_uupid(
    uupid: str, 
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a user by UUPID."""
    user = user_service.get_user_by_uupid(uupid)
    if not user:
        logger.warning(f"User with UUPID {uupid} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "User not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": UserResponse.model_validate(user).model_dump(mode='json'), "error": None}
    )

@router.get("/by-username/{username}")
def get_user_by_username(
    username: str, 
    user_service: UserService = Depends(get_user_service)
):
    """Retrieve a user by username."""
    user = user_service.get_user_by_username(username)
    if not user:
        logger.warning(f"User with username {username} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "User not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": UserResponse.model_validate(user).model_dump(mode='json'), "error": None}
    )

@router.put("/{user_id}")
def update_user(
    user_id: int, 
    user: UserCreate, 
    user_service: UserService = Depends(get_user_service)
):
    """Update an existing user by ID."""
    try:
        updated_user = user_service.update_user(user_id, user)
        if not updated_user:
            logger.warning(f"User with ID {user_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "User not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": UserResponse.model_validate(updated_user).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for user {user_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    user_service: UserService = Depends(get_user_service)
):
    """Delete a user by ID."""
    try:
        deleted = user_service.delete_user(user_id)
        if not deleted:
            logger.warning(f"User with ID {user_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "User not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"User with ID {user_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for user {user_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        )