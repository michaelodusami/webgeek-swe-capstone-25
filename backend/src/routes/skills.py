from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from src.model.skill import SkillCreate, SkillResponse
from src.services.skill_service import SkillService
from src.dependencies.dependencies import get_skill_service
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/skills", tags=["skills"])

@router.post("/", status_code=201)
def create_skill(
    skill: SkillCreate,
    skill_service: SkillService = Depends(get_skill_service)
):
    """Create a new skill."""
    try:
        created_skill = skill_service.create_skill(skill)
        return JSONResponse(
            status_code=201,
            content={"success": True, "data": SkillResponse.model_validate(created_skill).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Skill creation failed: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.post("/bulk", status_code=201)
def create_multiple_skills(
    skills: List[SkillCreate],
    skill_service: SkillService = Depends(get_skill_service)
):
    """Create multiple skills at once."""
    created_skills = []
    errors = []
    
    for i, skill_data in enumerate(skills):
        try:
            created_skill = skill_service.create_skill(skill_data)
            created_skills.append(SkillResponse.model_validate(created_skill).model_dump(mode='json'))
        except ValueError as e:
            error_msg = f"Skill {i+1} ({skill_data.name}): {str(e)}"
            errors.append(error_msg)
            logger.error(error_msg)
    
    if errors:
        return JSONResponse(
            status_code=207,  # Multi-Status
            content={
                "success": True,
                "data": {
                    "created_skills": created_skills,
                    "errors": errors,
                    "total_requested": len(skills),
                    "successfully_created": len(created_skills),
                    "failed": len(errors)
                },
                "error": None
            }
        )
    
    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "data": {
                "created_skills": created_skills,
                "total_created": len(created_skills)
            },
            "error": None
        }
    )

@router.get("/")
def list_skills(
    skip: int = Query(0, ge=0, description="Number of skills to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of skills to return"),
    skill_service: SkillService = Depends(get_skill_service)
):
    """List all skills with pagination."""
    skills = skill_service.list_skills(skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [SkillResponse.model_validate(s).model_dump(mode='json') for s in skills], "error": None}
    )

@router.get("/count")
def get_skills_count(skill_service: SkillService = Depends(get_skill_service)):
    """Get the total number of skills."""
    count = skill_service.get_skills_count()
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"total_skills": count}, "error": None}
    )

@router.get("/search")
def search_skills(
    q: str = Query(..., description="Search term for skill name"),
    skip: int = Query(0, ge=0, description="Number of skills to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of skills to return"),
    skill_service: SkillService = Depends(get_skill_service)
):
    """Search skills by name."""
    skills = skill_service.search_skills(search_term=q, skip=skip, limit=limit)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": [SkillResponse.model_validate(s).model_dump(mode='json') for s in skills], "error": None}
    )

@router.get("/multi-select")
def get_skills_for_multi_select(
    skill_service: SkillService = Depends(get_skill_service)
):
    """Get all skills formatted for multi-select components."""
    skills = skill_service.list_skills(skip=0, limit=1000)  # Get all skills for multi-select
    
    # Format skills for multi-select
    formatted_skills = []
    for skill in skills:
        skill_dict = skill.model_dump(mode='json')
        formatted_skill = {
            "value": skill_dict["id"],
            "label": skill_dict["name"],
            "display": skill_dict["name"]
        }
        formatted_skills.append(formatted_skill)
    
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "skills": formatted_skills,
                "total": len(formatted_skills)
            },
            "error": None
        }
    )

@router.get("/{skill_id}")
def get_skill(
    skill_id: int,
    skill_service: SkillService = Depends(get_skill_service)
):
    """Retrieve a skill by ID."""
    skill = skill_service.get_skill_by_id(skill_id)
    if not skill:
        logger.warning(f"Skill with ID {skill_id} not found")
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Skill not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": SkillResponse.model_validate(skill).model_dump(mode='json'), "error": None}
    )

@router.put("/{skill_id}")
def update_skill(
    skill_id: int,
    skill: SkillCreate,
    skill_service: SkillService = Depends(get_skill_service)
):
    """Update an existing skill by ID."""
    try:
        updated_skill = skill_service.update_skill(skill_id, skill)
        if not updated_skill:
            logger.warning(f"Skill with ID {skill_id} not found for update")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Skill not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": SkillResponse.model_validate(updated_skill).model_dump(mode='json'), "error": None}
        )
    except ValueError as e:
        logger.error(f"Update failed for skill {skill_id}: {e}")
        return JSONResponse(
            status_code=409,
            content={"success": False, "data": None, "error": str(e)}
        )

@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    skill_service: SkillService = Depends(get_skill_service)
):
    """Delete a skill by ID."""
    try:
        deleted = skill_service.delete_skill(skill_id)
        if not deleted:
            logger.warning(f"Skill with ID {skill_id} not found for deletion")
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": "Skill not found"}
            )
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": f"Skill with ID {skill_id} deleted successfully"}, "error": None}
        )
    except ValueError as e:
        logger.error(f"Deletion failed for skill {skill_id}: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(e)}
        ) 