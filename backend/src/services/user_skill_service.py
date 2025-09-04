from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.user_skill import UserSkill, UserSkillCreate, UserSkillResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class UserSkillService:
    """Service class for handling user-skill relationship business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user_skill(self, user_skill_data: UserSkillCreate) -> UserSkillResponse:
        try:
            db_user_skill = UserSkill(**user_skill_data.model_dump())
            self.db.add(db_user_skill)
            self.db.commit()
            self.db.refresh(db_user_skill)
            logger.info(f"Created user-skill relationship with ID: {db_user_skill.id}")
            return UserSkillResponse.model_validate(db_user_skill)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create user-skill relationship due to integrity error: {e}")
            raise ValueError("User-skill relationship creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create user-skill relationship: {e}")
            raise ValueError(f"User-skill relationship creation failed: {str(e)}")
    
    def get_user_skill_by_id(self, user_skill_id: int) -> Optional[UserSkillResponse]:
        user_skill = self.db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
        if user_skill:
            return UserSkillResponse.model_validate(user_skill)
        return None
    
    def get_user_skills_by_user(self, user_id: int, skip: int = 0, limit: int = 10) -> List[UserSkillResponse]:
        user_skills = self.db.query(UserSkill).filter(
            UserSkill.user_id == user_id
        ).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(user_skills)} user-skill relationships for user {user_id}")
        return [UserSkillResponse.model_validate(us) for us in user_skills]
    
    def get_user_skills_by_skill(self, skill_id: int, skip: int = 0, limit: int = 10) -> List[UserSkillResponse]:
        user_skills = self.db.query(UserSkill).filter(
            UserSkill.skill_id == skill_id
        ).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(user_skills)} user-skill relationships for skill {skill_id}")
        return [UserSkillResponse.model_validate(us) for us in user_skills]
    
    def list_user_skills(self, skip: int = 0, limit: int = 10) -> List[UserSkillResponse]:
        user_skills = self.db.query(UserSkill).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(user_skills)} user-skill relationships with skip={skip}, limit={limit}")
        return [UserSkillResponse.model_validate(us) for us in user_skills]
    
    def update_user_skill(self, user_skill_id: int, user_skill_data: UserSkillCreate) -> Optional[UserSkillResponse]:
        db_user_skill = self.db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
        if not db_user_skill:
            return None
        try:
            for key, value in user_skill_data.model_dump().items():
                setattr(db_user_skill, key, value)
            self.db.commit()
            self.db.refresh(db_user_skill)
            logger.info(f"Updated user-skill relationship with ID: {db_user_skill.id}")
            return UserSkillResponse.model_validate(db_user_skill)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update user-skill relationship {user_skill_id} due to integrity error: {e}")
            raise ValueError("Update failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update user-skill relationship {user_skill_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_user_skill(self, user_skill_id: int) -> bool:
        db_user_skill = self.db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
        if not db_user_skill:
            return False
        try:
            self.db.delete(db_user_skill)
            self.db.commit()
            logger.info(f"Deleted user-skill relationship with ID: {user_skill_id}")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete user-skill relationship {user_skill_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_user_skills_count(self) -> int:
        return self.db.query(UserSkill).count()
    
    def get_user_skills_count_by_user(self, user_id: int) -> int:
        return self.db.query(UserSkill).filter(UserSkill.user_id == user_id).count()
    
    def get_user_skills_count_by_skill(self, skill_id: int) -> int:
        return self.db.query(UserSkill).filter(UserSkill.skill_id == skill_id).count() 