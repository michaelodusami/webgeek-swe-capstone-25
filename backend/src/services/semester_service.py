from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.semester import Semester, SemesterCreate, SemesterResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class SemesterService:
    """Service class for handling semester-related business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_semester(self, semester_data: SemesterCreate) -> SemesterResponse:
        """Create a new semester.
        
        Args:
            semester_data (SemesterCreate): The semester data to create.
            
        Returns:
            SemesterResponse: The created semester details.
            
        Raises:
            ValueError: If semester creation fails due to integrity error.
        """
        try:
            db_semester = Semester(**semester_data.model_dump())
            self.db.add(db_semester)
            self.db.commit()
            self.db.refresh(db_semester)
            logger.info(f"Created semester with ID: {db_semester.id}")
            return SemesterResponse.model_validate(db_semester)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create semester due to integrity error: {e}")
            raise ValueError("Semester creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create semester: {e}")
            raise ValueError(f"Semester creation failed: {str(e)}")
    
    def get_semester_by_id(self, semester_id: int) -> Optional[SemesterResponse]:
        """Retrieve a semester by ID.
        
        Args:
            semester_id (int): The ID of the semester to fetch.
            
        Returns:
            Optional[SemesterResponse]: The semester's details or None if not found.
        """
        semester = self.db.query(Semester).filter(Semester.id == semester_id).first()
        if semester:
            return SemesterResponse.model_validate(semester)
        return None
    
    def get_semester_by_display_name(self, display_name: str) -> Optional[SemesterResponse]:
        """Retrieve a semester by display name.
        
        Args:
            display_name (str): The display name of the semester to fetch.
            
        Returns:
            Optional[SemesterResponse]: The semester's details or None if not found.
        """
        semester = self.db.query(Semester).filter(Semester.displayName == display_name).first()
        if semester:
            return SemesterResponse.model_validate(semester)
        return None
    
    def list_semesters(self, skip: int = 0, limit: int = 10) -> List[SemesterResponse]:
        """List all semesters with pagination.
        
        Args:
            skip (int): Number of semesters to skip (default: 0).
            limit (int): Maximum number of semesters to return (default: 10).
            
        Returns:
            List[SemesterResponse]: List of semesters.
        """
        semesters = self.db.query(Semester).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(semesters)} semesters with skip={skip}, limit={limit}")
        return [SemesterResponse.model_validate(semester) for semester in semesters]
    
    def update_semester(self, semester_id: int, semester_data: SemesterCreate) -> Optional[SemesterResponse]:
        """Update an existing semester by ID.
        
        Args:
            semester_id (int): The ID of the semester to update.
            semester_data (SemesterCreate): The updated semester data.
            
        Returns:
            Optional[SemesterResponse]: The updated semester details or None if not found.
            
        Raises:
            ValueError: If update fails due to integrity constraint violation.
        """
        db_semester = self.db.query(Semester).filter(Semester.id == semester_id).first()
        if not db_semester:
            return None
        
        try:
            for key, value in semester_data.model_dump().items():
                setattr(db_semester, key, value)
            self.db.commit()
            self.db.refresh(db_semester)
            logger.info(f"Updated semester with ID: {db_semester.id}")
            return SemesterResponse.model_validate(db_semester)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update semester {semester_id} due to integrity error: {e}")
            raise ValueError("Update failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update semester {semester_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_semester(self, semester_id: int) -> bool:
        db_semester = self.db.query(Semester).filter(Semester.id == semester_id).first()
        if not db_semester:
            return False
        try:
            # Delete related courses
            from src.model.course import Course
            courses = self.db.query(Course).filter(Course.semester_id == semester_id).all()
            for course in courses:
                self.db.delete(course)
            
            # Delete the semester itself
            self.db.delete(db_semester)
            self.db.commit()
            logger.info(f"Deleted semester with ID {semester_id} and {len(courses)} courses")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete semester {semester_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_semesters_count(self) -> int:
        """Get the total number of semesters.
        
        Returns:
            int: Total number of semesters in the database.
        """
        return self.db.query(Semester).count()
    
    def search_semesters(self, search_term: str, skip: int = 0, limit: int = 10) -> List[SemesterResponse]:
        """Search semesters by display name.
        
        Args:
            search_term (str): The search term to match against semester display name.
            skip (int): Number of semesters to skip (default: 0).
            limit (int): Maximum number of semesters to return (default: 10).
            
        Returns:
            List[SemesterResponse]: List of matching semesters.
        """
        search_pattern = f"%{search_term}%"
        semesters = self.db.query(Semester).filter(
            Semester.displayName.ilike(search_pattern)
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Found {len(semesters)} semesters matching search term: {search_term}")
        return [SemesterResponse.model_validate(semester) for semester in semesters]
    
    def get_current_semester(self) -> Optional[SemesterResponse]:
        """Get the current semester based on current date.
        
        Returns:
            Optional[SemesterResponse]: The current semester or None if not found.
        """
        from datetime import datetime
        current_date = datetime.now()
        
        semester = self.db.query(Semester).filter(
            Semester.semesterStartDate <= current_date,
            Semester.semesterEndDate >= current_date
        ).first()
        
        if semester:
            return SemesterResponse.model_validate(semester)
        return None 