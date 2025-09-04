from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.course import CourseCreate, CourseResponse
from src.services.course_service import CourseService
from src.dependencies.dependencies import get_course_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.post("/", status_code=201)
def create_course(
    course: CourseCreate, 
    course_service: CourseService = Depends(get_course_service)
):
    """Create a new course."""
    try:
        created_course = course_service.create_course(course)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": CourseResponse.model_validate(created_course).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Course creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.get("/")
def list_courses(
    skip: int = Query(0, ge=0, description="Number of courses to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of courses to return"),
    course_service: CourseService = Depends(get_course_service)
):
    """List all courses with pagination."""
    courses = course_service.list_courses(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [CourseResponse.model_validate(c).model_dump(mode='json') for c in courses], "error": None}
    )

@router.get("/count")
def get_courses_count(course_service: CourseService = Depends(get_course_service)):
    """Get the total number of courses."""
    count = course_service.get_courses_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_courses": count}, "error": None}
    )

@router.get("/search")
def search_courses(
    q: str = Query(..., description="Search term for course display name or CRN"),
    skip: int = Query(0, ge=0, description="Number of courses to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of courses to return"),
    course_service: CourseService = Depends(get_course_service)
):
    """Search courses by display name or CRN."""
    courses = course_service.search_courses(search_term=q, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [CourseResponse.model_validate(c).model_dump(mode='json') for c in courses], "error": None}
    )

@router.get("/by-semester/{semester_id}")
def get_courses_by_semester(
    semester_id: int,
    skip: int = Query(0, ge=0, description="Number of courses to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of courses to return"),
    course_service: CourseService = Depends(get_course_service)
):
    """Get all courses for a specific semester."""
    courses = course_service.get_courses_by_semester(semester_id=semester_id, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [CourseResponse.model_validate(c).model_dump(mode='json') for c in courses], "error": None}
    )

@router.get("/by-semester/{semester_id}/count")
def get_courses_count_by_semester(
    semester_id: int,
    course_service: CourseService = Depends(get_course_service)
):
    """Get the total number of courses for a specific semester."""
    count = course_service.get_courses_count_by_semester(semester_id)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_courses": count, "semester_id": semester_id}, "error": None}
    )

@router.get("/without-semester")
def get_courses_without_semester(
    skip: int = Query(0, ge=0, description="Number of courses to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of courses to return"),
    course_service: CourseService = Depends(get_course_service)
):
    """Get courses that are not assigned to any semester."""
    courses = course_service.get_courses_without_semester(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [CourseResponse.model_validate(c).model_dump(mode='json') for c in courses], "error": None}
    )

@router.get("/{course_id}")
def get_course(
    course_id: int, 
    course_service: CourseService = Depends(get_course_service)
):
    """Retrieve a course by ID."""
    course = course_service.get_course_by_id(course_id)
    if not course:
        logger.warning(f"Course with ID {course_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Course not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": CourseResponse.model_validate(course).model_dump(mode='json'), "error": None}
    )

@router.get("/by-crn/{crn}")
def get_course_by_crn(
    crn: str, 
    course_service: CourseService = Depends(get_course_service)
):
    """Retrieve a course by CRN."""
    course = course_service.get_course_by_crn(crn)
    if not course:
        logger.warning(f"Course with CRN {crn} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Course not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": CourseResponse.model_validate(course).model_dump(mode='json'), "error": None}
    )

@router.put("/{course_id}")
def update_course(
    course_id: int, 
    course: CourseCreate, 
    course_service: CourseService = Depends(get_course_service)
):
    """Update an existing course by ID."""
    try:
        updated_course = course_service.update_course(course_id, course)
        if not updated_course:
            logger.warning(f"Course with ID {course_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Course not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": CourseResponse.model_validate(updated_course).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for course {course_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{course_id}")
def delete_course(
    course_id: int, 
    course_service: CourseService = Depends(get_course_service)
):
    """Delete a course by ID."""
    try:
        deleted = course_service.delete_course(course_id)
        if not deleted:
            logger.warning(f"Course with ID {course_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Course not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"Course with ID {course_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for course {course_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        ) 