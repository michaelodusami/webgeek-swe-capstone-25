from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.user_course import UserCourseCreate, UserCourseResponse
from src.services.user_course_service import UserCourseService
from src.dependencies.dependencies import get_user_course_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user-courses", tags=["user-courses"])

@router.post("/", status_code=201)
def create_user_course(
    user_course: UserCourseCreate,
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """Create a new user-course relationship."""
    try:
        created_user_course = user_course_service.create_user_course(user_course)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": UserCourseResponse.model_validate(created_user_course).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"User-course relationship creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.get("/")
def list_user_courses(
    skip: int = Query(0, ge=0, description="Number of user-course relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of user-course relationships to return"),
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """List all user-course relationships with pagination."""
    user_courses = user_course_service.list_user_courses(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [UserCourseResponse.model_validate(uc).model_dump(mode='json') for uc in user_courses], "error": None}
    )

@router.get("/count")
def get_user_courses_count(user_course_service: UserCourseService = Depends(get_user_course_service)):
    """Get the total number of user-course relationships."""
    count = user_course_service.get_user_courses_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_user_courses": count}, "error": None}
    )

@router.get("/by-user/{user_id}")
def get_user_courses_by_user(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of user-course relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of user-course relationships to return"),
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """Get all user-course relationships for a specific user."""
    user_courses = user_course_service.get_user_courses_by_user(user_id=user_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [UserCourseResponse.model_validate(uc).model_dump(mode='json') for uc in user_courses], "error": None}
    )

@router.get("/by-course/{course_id}")
def get_user_courses_by_course(
    course_id: int,
    skip: int = Query(0, ge=0, description="Number of user-course relationships to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of user-course relationships to return"),
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """Get all user-course relationships for a specific course."""
    user_courses = user_course_service.get_user_courses_by_course(course_id=course_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [UserCourseResponse.model_validate(uc).model_dump(mode='json') for uc in user_courses], "error": None}
    )

@router.get("/count/by-user/{user_id}")
def get_user_courses_count_by_user(
    user_id: int,
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """Get the total number of user-course relationships for a specific user."""
    count = user_course_service.get_user_courses_count_by_user(user_id=user_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_user_courses": count}, "error": None}
    )

@router.get("/count/by-course/{course_id}")
def get_user_courses_count_by_course(
    course_id: int,
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """Get the total number of user-course relationships for a specific course."""
    count = user_course_service.get_user_courses_count_by_course(course_id=course_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_user_courses": count}, "error": None}
    )

@router.get("/{user_course_id}")
def get_user_course(
    user_course_id: int,
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """Retrieve a user-course relationship by ID."""
    user_course = user_course_service.get_user_course_by_id(user_course_id)
    if not user_course:
        logger.warning(f"User-course relationship with ID {user_course_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "User-course relationship not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": UserCourseResponse.model_validate(user_course).model_dump(mode='json'), "error": None}
    )

@router.put("/{user_course_id}")
def update_user_course(
    user_course_id: int,
    user_course: UserCourseCreate,
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """Update an existing user-course relationship by ID."""
    try:
        updated_user_course = user_course_service.update_user_course(user_course_id, user_course)
        if not updated_user_course:
            logger.warning(f"User-course relationship with ID {user_course_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "User-course relationship not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": UserCourseResponse.model_validate(updated_user_course).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for user-course relationship {user_course_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{user_course_id}")
def delete_user_course(
    user_course_id: int,
    user_course_service: UserCourseService = Depends(get_user_course_service)
):
    """Delete a user-course relationship by ID."""
    try:
        deleted = user_course_service.delete_user_course(user_course_id)
        if not deleted:
            logger.warning(f"User-course relationship with ID {user_course_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "User-course relationship not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"User-course relationship with ID {user_course_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for user-course relationship {user_course_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        ) 