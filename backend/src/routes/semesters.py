from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.semester import SemesterCreate, SemesterResponse
from src.services.semester_service import SemesterService
from src.dependencies.dependencies import get_semester_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/semesters", tags=["semesters"])

@router.post("/", status_code=201)
def create_semester(
    semester: SemesterCreate, 
    semester_service: SemesterService = Depends(get_semester_service)
):
    """Create a new semester."""
    try:
        created_semester = semester_service.create_semester(semester)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": SemesterResponse.model_validate(created_semester).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Semester creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.get("/")
def list_semesters(
    skip: int = Query(0, ge=0, description="Number of semesters to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of semesters to return"),
    semester_service: SemesterService = Depends(get_semester_service)
):
    """List all semesters with pagination."""
    semesters = semester_service.list_semesters(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [SemesterResponse.model_validate(s).model_dump(mode='json') for s in semesters], "error": None}
    )

@router.get("/count")
def get_semesters_count(semester_service: SemesterService = Depends(get_semester_service)):
    """Get the total number of semesters."""
    count = semester_service.get_semesters_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_semesters": count}, "error": None}
    )

@router.get("/search")
def search_semesters(
    q: str = Query(..., description="Search term for semester display name"),
    skip: int = Query(0, ge=0, description="Number of semesters to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of semesters to return"),
    semester_service: SemesterService = Depends(get_semester_service)
):
    """Search semesters by display name."""
    semesters = semester_service.search_semesters(search_term=q, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [SemesterResponse.model_validate(s).model_dump(mode='json') for s in semesters], "error": None}
    )

@router.get("/current")
def get_current_semester(semester_service: SemesterService = Depends(get_semester_service)):
    """Get the current semester based on current date."""
    semester = semester_service.get_current_semester()
    if not semester:
        logger.warning("No current semester found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "No current semester found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": SemesterResponse.model_validate(semester).model_dump(mode='json'), "error": None}
    )

@router.get("/{semester_id}")
def get_semester(
    semester_id: int, 
    semester_service: SemesterService = Depends(get_semester_service)
):
    """Retrieve a semester by ID."""
    semester = semester_service.get_semester_by_id(semester_id)
    if not semester:
        logger.warning(f"Semester with ID {semester_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Semester not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": SemesterResponse.model_validate(semester).model_dump(mode='json'), "error": None}
    )

@router.get("/by-display-name/{display_name}")
def get_semester_by_display_name(
    display_name: str, 
    semester_service: SemesterService = Depends(get_semester_service)
):
    """Retrieve a semester by display name."""
    semester = semester_service.get_semester_by_display_name(display_name)
    if not semester:
        logger.warning(f"Semester with display name {display_name} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Semester not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": SemesterResponse.model_validate(semester).model_dump(mode='json'), "error": None}
    )

@router.put("/{semester_id}")
def update_semester(
    semester_id: int, 
    semester: SemesterCreate, 
    semester_service: SemesterService = Depends(get_semester_service)
):
    """Update an existing semester by ID."""
    try:
        updated_semester = semester_service.update_semester(semester_id, semester)
        if not updated_semester:
            logger.warning(f"Semester with ID {semester_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Semester not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": SemesterResponse.model_validate(updated_semester).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for semester {semester_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{semester_id}")
def delete_semester(
    semester_id: int, 
    semester_service: SemesterService = Depends(get_semester_service)
):
    """Delete a semester by ID."""
    try:
        deleted = semester_service.delete_semester(semester_id)
        if not deleted:
            logger.warning(f"Semester with ID {semester_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Semester not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"Semester with ID {semester_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for semester {semester_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        ) 