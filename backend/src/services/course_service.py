from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.course import Course, CourseCreate, CourseResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class CourseService:
    """Service class for handling course-related business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_course(self, course_data: CourseCreate) -> CourseResponse:
        """Create a new course.
        
        Args:
            course_data (CourseCreate): The course data to create.
            
        Returns:
            CourseResponse: The created course details.
            
        Raises:
            ValueError: If course creation fails due to integrity error.
        """
        try:
            db_course = Course(**course_data.model_dump())
            self.db.add(db_course)
            self.db.commit()
            self.db.refresh(db_course)
            logger.info(f"Created course with ID: {db_course.id}")
            return CourseResponse.model_validate(db_course)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create course due to integrity error: {e}")
            raise ValueError("Course creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create course: {e}")
            raise ValueError(f"Course creation failed: {str(e)}")
    
    def get_course_by_id(self, course_id: int) -> Optional[CourseResponse]:
        """Retrieve a course by ID.
        
        Args:
            course_id (int): The ID of the course to fetch.
            
        Returns:
            Optional[CourseResponse]: The course's details or None if not found.
        """
        course = self.db.query(Course).filter(Course.id == course_id).first()
        if course:
            return CourseResponse.model_validate(course)
        return None
    
    def get_course_by_crn(self, crn: str) -> Optional[CourseResponse]:
        """Retrieve a course by CRN.
        
        Args:
            crn (str): The CRN of the course to fetch.
            
        Returns:
            Optional[CourseResponse]: The course's details or None if not found.
        """
        course = self.db.query(Course).filter(Course.crn == crn).first()
        if course:
            return CourseResponse.model_validate(course)
        return None
    
    def get_courses_by_semester(self, semester_id: int, skip: int = 0, limit: int = 10) -> List[CourseResponse]:
        """Retrieve all courses for a specific semester.
        
        Args:
            semester_id (int): The ID of the semester.
            skip (int): Number of courses to skip (default: 0).
            limit (int): Maximum number of courses to return (default: 10).
            
        Returns:
            List[CourseResponse]: List of courses for the semester.
        """
        courses = self.db.query(Course).filter(
            Course.semester_id == semester_id
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(courses)} courses for semester {semester_id}")
        return [CourseResponse.model_validate(course) for course in courses]
    
    def list_courses(self, skip: int = 0, limit: int = 10) -> List[CourseResponse]:
        """List all courses with pagination.
        
        Args:
            skip (int): Number of courses to skip (default: 0).
            limit (int): Maximum number of courses to return (default: 10).
            
        Returns:
            List[CourseResponse]: List of courses.
        """
        courses = self.db.query(Course).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(courses)} courses with skip={skip}, limit={limit}")
        return [CourseResponse.model_validate(course) for course in courses]
    
    def update_course(self, course_id: int, course_data: CourseCreate) -> Optional[CourseResponse]:
        """Update an existing course by ID.
        
        Args:
            course_id (int): The ID of the course to update.
            course_data (CourseCreate): The updated course data.
            
        Returns:
            Optional[CourseResponse]: The updated course details or None if not found.
            
        Raises:
            ValueError: If update fails due to integrity constraint violation.
        """
        db_course = self.db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            return None
        
        try:
            for key, value in course_data.model_dump().items():
                setattr(db_course, key, value)
            self.db.commit()
            self.db.refresh(db_course)
            logger.info(f"Updated course with ID: {db_course.id}")
            return CourseResponse.model_validate(db_course)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update course {course_id} due to integrity error: {e}")
            raise ValueError("Update failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update course {course_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_course(self, course_id: int) -> bool:
        db_course = self.db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            return False
        try:
            # Delete related user_courses relationships
            from src.model.user_course import UserCourse
            user_courses = self.db.query(UserCourse).filter(UserCourse.course_id == course_id).all()
            for user_course in user_courses:
                self.db.delete(user_course)
            
            # Delete the course itself
            self.db.delete(db_course)
            self.db.commit()
            logger.info(f"Deleted course with ID {course_id} and {len(user_courses)} user relationships")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete course {course_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_courses_count(self) -> int:
        """Get the total number of courses.
        
        Returns:
            int: Total number of courses in the database.
        """
        return self.db.query(Course).count()
    
    def get_courses_count_by_semester(self, semester_id: int) -> int:
        """Get the total number of courses for a specific semester.
        
        Args:
            semester_id (int): The ID of the semester.
            
        Returns:
            int: Total number of courses for the semester.
        """
        return self.db.query(Course).filter(Course.semester_id == semester_id).count()
    
    def search_courses(self, search_term: str, skip: int = 0, limit: int = 10) -> List[CourseResponse]:
        """Search courses by display name or CRN.
        
        Args:
            search_term (str): The search term to match against course fields.
            skip (int): Number of courses to skip (default: 0).
            limit (int): Maximum number of courses to return (default: 10).
            
        Returns:
            List[CourseResponse]: List of matching courses.
        """
        search_pattern = f"%{search_term}%"
        courses = self.db.query(Course).filter(
            (Course.displayName.ilike(search_pattern)) |
            (Course.crn.ilike(search_pattern))
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Found {len(courses)} courses matching search term: {search_term}")
        return [CourseResponse.model_validate(course) for course in courses]
    
    def get_courses_without_semester(self, skip: int = 0, limit: int = 10) -> List[CourseResponse]:
        """Get courses that are not assigned to any semester.
        
        Args:
            skip (int): Number of courses to skip (default: 0).
            limit (int): Maximum number of courses to return (default: 10).
            
        Returns:
            List[CourseResponse]: List of courses without semester assignment.
        """
        courses = self.db.query(Course).filter(
            Course.semester_id.is_(None)
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(courses)} courses without semester assignment")
        return [CourseResponse.model_validate(course) for course in courses] 