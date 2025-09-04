from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.project_user import ProjectUser, ProjectUserCreate, ProjectUserResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class ProjectUserService:
    """Service class for handling project-user relationship business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_project_user(self, project_user_data: ProjectUserCreate) -> ProjectUserResponse:
        try:
            db_project_user = ProjectUser(**project_user_data.model_dump())
            self.db.add(db_project_user)
            self.db.commit()
            self.db.refresh(db_project_user)
            logger.info(f"Created project-user relationship with ID: {db_project_user.id}")
            return ProjectUserResponse.model_validate(db_project_user)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create project-user relationship due to integrity error: {e}")
            raise ValueError("Project-user relationship creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create project-user relationship: {e}")
            raise ValueError(f"Project-user relationship creation failed: {str(e)}")
    
    def get_project_user_by_id(self, project_user_id: int) -> Optional[ProjectUserResponse]:
        project_user = self.db.query(ProjectUser).filter(ProjectUser.id == project_user_id).first()
        if project_user:
            return ProjectUserResponse.model_validate(project_user)
        return None
    
    def get_project_users_by_project(self, project_id: int, skip: int = 0, limit: int = 10) -> List[ProjectUserResponse]:
        project_users = self.db.query(ProjectUser).filter(
            ProjectUser.project_id == project_id
        ).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(project_users)} project-user relationships for project {project_id}")
        return [ProjectUserResponse.model_validate(pu) for pu in project_users]
    
    def get_project_users_by_user(self, user_id: int, skip: int = 0, limit: int = 10) -> List[ProjectUserResponse]:
        project_users = self.db.query(ProjectUser).filter(
            ProjectUser.user_id == user_id
        ).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(project_users)} project-user relationships for user {user_id}")
        return [ProjectUserResponse.model_validate(pu) for pu in project_users]
    
    def list_project_users(self, skip: int = 0, limit: int = 10) -> List[ProjectUserResponse]:
        project_users = self.db.query(ProjectUser).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(project_users)} project-user relationships with skip={skip}, limit={limit}")
        return [ProjectUserResponse.model_validate(pu) for pu in project_users]
    
    def update_project_user(self, project_user_id: int, project_user_data: ProjectUserCreate) -> Optional[ProjectUserResponse]:
        db_project_user = self.db.query(ProjectUser).filter(ProjectUser.id == project_user_id).first()
        if not db_project_user:
            return None
        try:
            for key, value in project_user_data.model_dump().items():
                setattr(db_project_user, key, value)
            self.db.commit()
            self.db.refresh(db_project_user)
            logger.info(f"Updated project-user relationship with ID: {db_project_user.id}")
            return ProjectUserResponse.model_validate(db_project_user)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update project-user relationship {project_user_id} due to integrity error: {e}")
            raise ValueError("Update failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update project-user relationship {project_user_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_project_user(self, project_user_id: int) -> bool:
        db_project_user = self.db.query(ProjectUser).filter(ProjectUser.id == project_user_id).first()
        if not db_project_user:
            return False
        try:
            self.db.delete(db_project_user)
            self.db.commit()
            logger.info(f"Deleted project-user relationship with ID: {project_user_id}")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete project-user relationship {project_user_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_project_users_count(self) -> int:
        return self.db.query(ProjectUser).count()
    
    def get_project_users_count_by_project(self, project_id: int) -> int:
        return self.db.query(ProjectUser).filter(ProjectUser.project_id == project_id).count()
    
    def get_project_users_count_by_user(self, user_id: int) -> int:
        return self.db.query(ProjectUser).filter(ProjectUser.user_id == user_id).count() 