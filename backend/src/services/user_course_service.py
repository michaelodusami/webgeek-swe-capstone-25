from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.user_course import UserCourse, UserCourseCreate, UserCourseResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class UserCourseService:
    """Service class for handling user-course relationship business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user_course(self, user_course_data: UserCourseCreate) -> UserCourseResponse:
        try:
            db_user_course = UserCourse(**user_course_data.model_dump())
            self.db.add(db_user_course)
            self.db.commit()
            self.db.refresh(db_user_course)
            logger.info(f"Created user-course relationship with ID: {db_user_course.id}")
            return UserCourseResponse.model_validate(db_user_course)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create user-course relationship due to integrity error: {e}")
            raise ValueError("User-course relationship creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create user-course relationship: {e}")
            raise ValueError(f"User-course relationship creation failed: {str(e)}")
    
    def get_user_course_by_id(self, user_course_id: int) -> Optional[UserCourseResponse]:
        user_course = self.db.query(UserCourse).filter(UserCourse.id == user_course_id).first()
        if user_course:
            return UserCourseResponse.model_validate(user_course)
        return None
    
    def get_user_courses_by_user(self, user_id: int, skip: int = 0, limit: int = 10) -> List[UserCourseResponse]:
        user_courses = self.db.query(UserCourse).filter(
            UserCourse.user_id == user_id
        ).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(user_courses)} user-course relationships for user {user_id}")
        return [UserCourseResponse.model_validate(uc) for uc in user_courses]
    
    def get_user_courses_by_course(self, course_id: int, skip: int = 0, limit: int = 10) -> List[UserCourseResponse]:
        user_courses = self.db.query(UserCourse).filter(
            UserCourse.course_id == course_id
        ).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(user_courses)} user-course relationships for course {course_id}")
        return [UserCourseResponse.model_validate(uc) for uc in user_courses]
    
    def list_user_courses(self, skip: int = 0, limit: int = 10) -> List[UserCourseResponse]:
        user_courses = self.db.query(UserCourse).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(user_courses)} user-course relationships with skip={skip}, limit={limit}")
        return [UserCourseResponse.model_validate(uc) for uc in user_courses]
    
    def update_user_course(self, user_course_id: int, user_course_data: UserCourseCreate) -> Optional[UserCourseResponse]:
        db_user_course = self.db.query(UserCourse).filter(UserCourse.id == user_course_id).first()
        if not db_user_course:
            return None
        try:
            for key, value in user_course_data.model_dump().items():
                setattr(db_user_course, key, value)
            self.db.commit()
            self.db.refresh(db_user_course)
            logger.info(f"Updated user-course relationship with ID: {db_user_course.id}")
            return UserCourseResponse.model_validate(db_user_course)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update user-course relationship {user_course_id} due to integrity error: {e}")
            raise ValueError("Update failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update user-course relationship {user_course_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_user_course(self, user_course_id: int) -> bool:
        db_user_course = self.db.query(UserCourse).filter(UserCourse.id == user_course_id).first()
        if not db_user_course:
            return False
        try:
            self.db.delete(db_user_course)
            self.db.commit()
            logger.info(f"Deleted user-course relationship with ID: {user_course_id}")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete user-course relationship {user_course_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_user_courses_count(self) -> int:
        return self.db.query(UserCourse).count()
    
    def get_user_courses_count_by_user(self, user_id: int) -> int:
        return self.db.query(UserCourse).filter(UserCourse.user_id == user_id).count()
    
    def get_user_courses_count_by_course(self, course_id: int) -> int:
        return self.db.query(UserCourse).filter(UserCourse.course_id == course_id).count() 