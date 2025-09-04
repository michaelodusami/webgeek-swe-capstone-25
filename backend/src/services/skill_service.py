from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.skill import Skill, SkillCreate, SkillResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class SkillService:
    """Service class for handling skill-related business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_skill(self, skill_data: SkillCreate) -> SkillResponse:
        try:
            db_skill = Skill(**skill_data.model_dump())
            self.db.add(db_skill)
            self.db.commit()
            self.db.refresh(db_skill)
            logger.info(f"Created skill with ID: {db_skill.id}")
            return SkillResponse.model_validate(db_skill)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create skill due to integrity error: {e}")
            raise ValueError("Skill creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create skill: {e}")
            raise ValueError(f"Skill creation failed: {str(e)}")
    
    def get_skill_by_id(self, skill_id: int) -> Optional[SkillResponse]:
        skill = self.db.query(Skill).filter(Skill.id == skill_id).first()
        if skill:
            return SkillResponse.model_validate(skill)
        return None
    
    def list_skills(self, skip: int = 0, limit: int = 10) -> List[SkillResponse]:
        skills = self.db.query(Skill).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(skills)} skills with skip={skip}, limit={limit}")
        return [SkillResponse.model_validate(skill) for skill in skills]
    
    def update_skill(self, skill_id: int, skill_data: SkillCreate) -> Optional[SkillResponse]:
        db_skill = self.db.query(Skill).filter(Skill.id == skill_id).first()
        if not db_skill:
            return None
        try:
            for key, value in skill_data.model_dump().items():
                setattr(db_skill, key, value)
            self.db.commit()
            self.db.refresh(db_skill)
            logger.info(f"Updated skill with ID: {db_skill.id}")
            return SkillResponse.model_validate(db_skill)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update skill {skill_id} due to integrity error: {e}")
            raise ValueError("Update failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update skill {skill_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_skill(self, skill_id: int) -> bool:
        db_skill = self.db.query(Skill).filter(Skill.id == skill_id).first()
        if not db_skill:
            return False
        try:
            # Delete related user_skills relationships
            from src.model.user_skill import UserSkill
            user_skills = self.db.query(UserSkill).filter(UserSkill.skill_id == skill_id).all()
            for user_skill in user_skills:
                self.db.delete(user_skill)
            
            # Delete related project_skills relationships
            from src.model.project_skill import ProjectSkill
            project_skills = self.db.query(ProjectSkill).filter(ProjectSkill.skill_id == skill_id).all()
            for project_skill in project_skills:
                self.db.delete(project_skill)
            
            # Delete the skill itself
            self.db.delete(db_skill)
            self.db.commit()
            logger.info(f"Deleted skill with ID {skill_id} and {len(user_skills)} user relationships and {len(project_skills)} project relationships")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete skill {skill_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_skills_count(self) -> int:
        return self.db.query(Skill).count()
    
    def search_skills(self, search_term: str, skip: int = 0, limit: int = 10) -> List[SkillResponse]:
        search_pattern = f"%{search_term}%"
        skills = self.db.query(Skill).filter(
            Skill.name.ilike(search_pattern)
        ).offset(skip).limit(limit).all()
        logger.info(f"Found {len(skills)} skills matching search term: {search_term}")
        return [SkillResponse.model_validate(skill) for skill in skills]
    
    def bulk_create_skills(self, skills_data: List[SkillCreate]) -> List[SkillResponse]:
        """Create multiple skills in a single transaction."""
        created_skills = []
        try:
            for skill_data in skills_data:
                db_skill = Skill(**skill_data.model_dump())
                self.db.add(db_skill)
                created_skills.append(db_skill)
            
            self.db.commit()
            
            # Refresh all created skills
            for skill in created_skills:
                self.db.refresh(skill)
            
            logger.info(f"Bulk created {len(created_skills)} skills")
            return [SkillResponse.model_validate(skill) for skill in created_skills]
            
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to bulk create skills due to integrity error: {e}")
            raise ValueError("Bulk skill creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to bulk create skills: {e}")
            raise ValueError(f"Bulk skill creation failed: {str(e)}") 