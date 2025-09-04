from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.project_skill import ProjectSkill, ProjectSkillCreate, ProjectSkillResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class ProjectSkillService:
    """Service class for handling project-skill relationship business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_project_skill(self, project_skill_data: ProjectSkillCreate) -> ProjectSkillResponse:
        try:
            db_project_skill = ProjectSkill(**project_skill_data.model_dump())
            self.db.add(db_project_skill)
            self.db.commit()
            self.db.refresh(db_project_skill)
            logger.info(f"Created project-skill relationship with ID: {db_project_skill.id}")
            return ProjectSkillResponse.model_validate(db_project_skill)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create project-skill relationship due to integrity error: {e}")
            raise ValueError("Project-skill relationship creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create project-skill relationship: {e}")
            raise ValueError(f"Project-skill relationship creation failed: {str(e)}")
    
    def get_project_skill_by_id(self, project_skill_id: int) -> Optional[ProjectSkillResponse]:
        project_skill = self.db.query(ProjectSkill).filter(ProjectSkill.id == project_skill_id).first()
        if project_skill:
            return ProjectSkillResponse.model_validate(project_skill)
        return None
    
    def get_project_skills_by_project(self, project_id: int, skip: int = 0, limit: int = 10) -> List[ProjectSkillResponse]:
        project_skills = self.db.query(ProjectSkill).filter(
            ProjectSkill.project_id == project_id
        ).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(project_skills)} project-skill relationships for project {project_id}")
        return [ProjectSkillResponse.model_validate(ps) for ps in project_skills]
    
    def get_project_skills_by_skill(self, skill_id: int, skip: int = 0, limit: int = 10) -> List[ProjectSkillResponse]:
        project_skills = self.db.query(ProjectSkill).filter(
            ProjectSkill.skill_id == skill_id
        ).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(project_skills)} project-skill relationships for skill {skill_id}")
        return [ProjectSkillResponse.model_validate(ps) for ps in project_skills]
    
    def list_project_skills(self, skip: int = 0, limit: int = 10) -> List[ProjectSkillResponse]:
        project_skills = self.db.query(ProjectSkill).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(project_skills)} project-skill relationships with skip={skip}, limit={limit}")
        return [ProjectSkillResponse.model_validate(ps) for ps in project_skills]
    
    def update_project_skill(self, project_skill_id: int, project_skill_data: ProjectSkillCreate) -> Optional[ProjectSkillResponse]:
        db_project_skill = self.db.query(ProjectSkill).filter(ProjectSkill.id == project_skill_id).first()
        if not db_project_skill:
            return None
        try:
            for key, value in project_skill_data.model_dump().items():
                setattr(db_project_skill, key, value)
            self.db.commit()
            self.db.refresh(db_project_skill)
            logger.info(f"Updated project-skill relationship with ID: {db_project_skill.id}")
            return ProjectSkillResponse.model_validate(db_project_skill)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update project-skill relationship {project_skill_id} due to integrity error: {e}")
            raise ValueError("Update failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update project-skill relationship {project_skill_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_project_skill(self, project_skill_id: int) -> bool:
        db_project_skill = self.db.query(ProjectSkill).filter(ProjectSkill.id == project_skill_id).first()
        if not db_project_skill:
            return False
        try:
            self.db.delete(db_project_skill)
            self.db.commit()
            logger.info(f"Deleted project-skill relationship with ID: {project_skill_id}")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete project-skill relationship {project_skill_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_project_skills_count(self) -> int:
        return self.db.query(ProjectSkill).count()
    
    def get_project_skills_count_by_project(self, project_id: int) -> int:
        return self.db.query(ProjectSkill).filter(ProjectSkill.project_id == project_id).count()
    
    def get_project_skills_count_by_skill(self, skill_id: int) -> int:
        return self.db.query(ProjectSkill).filter(ProjectSkill.skill_id == skill_id).count() 