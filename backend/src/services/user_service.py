from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.user import User, UserCreate, UserResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class UserService:
    """Service class for handling user-related business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user.
        
        Args:
            user_data (UserCreate): The user data to create.
            
        Returns:
            UserResponse: The created user details.
            
        Raises:
            ValueError: If user creation fails due to unique constraint violation.
        """
        try:
            db_user = User(**user_data.model_dump())
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            logger.info(f"Created user with ID: {db_user.id}")
            return UserResponse.model_validate(db_user)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create user due to integrity error: {e}")
            raise ValueError("User creation failed: unique constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create user: {e}")
            raise ValueError(f"User creation failed: {str(e)}")
    
    def get_user_by_id(self, user_id: int) -> Optional[UserResponse]:
        """Retrieve a user by ID.
        
        Args:
            user_id (int): The ID of the user to fetch.
            
        Returns:
            Optional[UserResponse]: The user's details or None if not found.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            return UserResponse.model_validate(user)
        return None
    
    def get_user_by_uupid(self, uupid: str) -> Optional[UserResponse]:
        """Retrieve a user by UUPID.
        
        Args:
            uupid (str): The UUPID of the user to fetch.
            
        Returns:
            Optional[UserResponse]: The user's details or None if not found.
        """
        user = self.db.query(User).filter(User.uupid == uupid).first()
        if user:
            return UserResponse.model_validate(user)
        return None
    
    def get_user_by_username(self, username: str) -> Optional[UserResponse]:
        """Retrieve a user by username.
        
        Args:
            username (str): The username of the user to fetch.
            
        Returns:
            Optional[UserResponse]: The user's details or None if not found.
        """
        user = self.db.query(User).filter(User.username == username).first()
        if user:
            return UserResponse.model_validate(user)
        return None
    
    def list_users(self, skip: int = 0, limit: int = 10) -> List[UserResponse]:
        """List all users with pagination.
        
        Args:
            skip (int): Number of users to skip (default: 0).
            limit (int): Maximum number of users to return (default: 10).
            
        Returns:
            List[UserResponse]: List of users.
        """
        users = self.db.query(User).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(users)} users with skip={skip}, limit={limit}")
        return [UserResponse.model_validate(user) for user in users]
    
    def update_user(self, user_id: int, user_data: UserCreate) -> Optional[UserResponse]:
        """Update an existing user by ID.
        
        Args:
            user_id (int): The ID of the user to update.
            user_data (UserCreate): The updated user data.
            
        Returns:
            Optional[UserResponse]: The updated user details or None if not found.
            
        Raises:
            ValueError: If update fails due to unique constraint violation.
        """
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        try:
            for key, value in user_data.model_dump().items():
                setattr(db_user, key, value)
            self.db.commit()
            self.db.refresh(db_user)
            logger.info(f"Updated user with ID: {db_user.id}")
            return UserResponse.model_validate(db_user)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update user {user_id} due to integrity error: {e}")
            raise ValueError("Update failed: unique constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update user {user_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_user(self, user_id: int) -> bool:
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        try:
            # Delete related user_skills relationships
            from src.model.user_skill import UserSkill
            user_skills = self.db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
            for user_skill in user_skills:
                self.db.delete(user_skill)
            
            # Delete related user_courses relationships
            from src.model.user_course import UserCourse
            user_courses = self.db.query(UserCourse).filter(UserCourse.user_id == user_id).all()
            for user_course in user_courses:
                self.db.delete(user_course)
            
            # Delete related project_users relationships
            from src.model.project_user import ProjectUser
            project_users = self.db.query(ProjectUser).filter(ProjectUser.user_id == user_id).all()
            for project_user in project_users:
                self.db.delete(project_user)
            
            # Delete the user itself
            self.db.delete(db_user)
            self.db.commit()
            logger.info(f"Deleted user with ID {user_id} and {len(user_skills)} skill relationships, {len(user_courses)} course relationships, and {len(project_users)} project relationships")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete user {user_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_users_count(self) -> int:
        """Get the total number of users.
        
        Returns:
            int: Total number of users in the database.
        """
        return self.db.query(User).count()
    
    def search_users(self, search_term: str, skip: int = 0, limit: int = 10) -> List[UserResponse]:
        """Search users by username, UUPID, or edupersonprincipalname.
        
        Args:
            search_term (str): The search term to match against user fields.
            skip (int): Number of users to skip (default: 0).
            limit (int): Maximum number of users to return (default: 10).
            
        Returns:
            List[UserResponse]: List of matching users.
        """
        search_pattern = f"%{search_term}%"
        users = self.db.query(User).filter(
            (User.username.ilike(search_pattern)) |
            (User.uupid.ilike(search_pattern)) |
            (User.edupersonprincipalname.ilike(search_pattern))
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Found {len(users)} users matching search term: {search_term}")
        return [UserResponse.model_validate(user) for user in users] 