from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.model.project import Project, ProjectCreate, ProjectResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class ProjectService:
    """Service class for handling project-related business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_project(self, project_data: ProjectCreate) -> ProjectResponse:
        """Create a new project.
        
        Args:
            project_data (ProjectCreate): The project data to create.
            
        Returns:
            ProjectResponse: The created project details.
            
        Raises:
            ValueError: If project creation fails due to integrity error.
        """
        try:
            db_project = Project(**project_data.model_dump())
            self.db.add(db_project)
            self.db.commit()
            self.db.refresh(db_project)
            logger.info(f"Created project with ID: {db_project.id}")
            return ProjectResponse.model_validate(db_project)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to create project due to integrity error: {e}")
            raise ValueError("Project creation failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create project: {e}")
            raise ValueError(f"Project creation failed: {str(e)}")
    
    def get_project_by_id(self, project_id: int) -> Optional[ProjectResponse]:
        """Retrieve a project by ID.
        
        Args:
            project_id (int): The ID of the project to fetch.
            
        Returns:
            Optional[ProjectResponse]: The project's details or None if not found.
        """
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if project:
            return ProjectResponse.model_validate(project)
        return None
    
    def get_projects_by_course(self, course_id: int, skip: int = 0, limit: int = 10) -> List[ProjectResponse]:
        """Retrieve all projects for a specific course.
        
        Args:
            course_id (int): The ID of the course.
            skip (int): Number of projects to skip (default: 0).
            limit (int): Maximum number of projects to return (default: 10).
            
        Returns:
            List[ProjectResponse]: List of projects for the course.
        """
        projects = self.db.query(Project).filter(
            Project.course_id == course_id
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(projects)} projects for course {course_id}")
        return [ProjectResponse.model_validate(project) for project in projects]
    
    def list_projects(self, skip: int = 0, limit: int = 10) -> List[ProjectResponse]:
        """List all projects with pagination.
        
        Args:
            skip (int): Number of projects to skip (default: 0).
            limit (int): Maximum number of projects to return (default: 10).
            
        Returns:
            List[ProjectResponse]: List of projects.
        """
        projects = self.db.query(Project).offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(projects)} projects with skip={skip}, limit={limit}")
        return [ProjectResponse.model_validate(project) for project in projects]
    
    def update_project(self, project_id: int, project_data: ProjectCreate) -> Optional[ProjectResponse]:
        """Update an existing project by ID.
        
        Args:
            project_id (int): The ID of the project to update.
            project_data (ProjectCreate): The updated project data.
            
        Returns:
            Optional[ProjectResponse]: The updated project details or None if not found.
            
        Raises:
            ValueError: If update fails due to integrity constraint violation.
        """
        db_project = self.db.query(Project).filter(Project.id == project_id).first()
        if not db_project:
            return None
        
        try:
            for key, value in project_data.model_dump().items():
                setattr(db_project, key, value)
            self.db.commit()
            self.db.refresh(db_project)
            logger.info(f"Updated project with ID: {db_project.id}")
            return ProjectResponse.model_validate(db_project)
        except IntegrityError as e:
            self.db.rollback()
            logger.error(f"Failed to update project {project_id} due to integrity error: {e}")
            raise ValueError("Update failed: integrity constraint violation")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update project {project_id}: {e}")
            raise ValueError(f"Update failed: {str(e)}")
    
    def delete_project(self, project_id: int) -> bool:
        db_project = self.db.query(Project).filter(Project.id == project_id).first()
        if not db_project:
            return False
        try:
            # Delete related project_skills relationships
            from src.model.project_skill import ProjectSkill
            project_skills = self.db.query(ProjectSkill).filter(ProjectSkill.project_id == project_id).all()
            for project_skill in project_skills:
                self.db.delete(project_skill)
            
            # Delete related project_users relationships
            from src.model.project_user import ProjectUser
            project_users = self.db.query(ProjectUser).filter(ProjectUser.project_id == project_id).all()
            for project_user in project_users:
                self.db.delete(project_user)
            
            # Delete the project itself
            self.db.delete(db_project)
            self.db.commit()
            logger.info(f"Deleted project with ID {project_id} and {len(project_skills)} skill relationships and {len(project_users)} user relationships")
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete project {project_id}: {e}")
            raise ValueError(f"Deletion failed: {str(e)}")
    
    def get_projects_count(self) -> int:
        """Get the total number of projects.
        
        Returns:
            int: Total number of projects in the database.
        """
        return self.db.query(Project).count()
    
    def get_projects_count_by_course(self, course_id: int) -> int:
        """Get the total number of projects for a specific course.
        
        Args:
            course_id (int): The ID of the course.
            
        Returns:
            int: Total number of projects for the course.
        """
        return self.db.query(Project).filter(Project.course_id == course_id).count()
    
    def search_projects(self, search_term: str, skip: int = 0, limit: int = 10) -> List[ProjectResponse]:
        """Search projects by title, description, or team name.
        
        Args:
            search_term (str): The search term to match against project fields.
            skip (int): Number of projects to skip (default: 0).
            limit (int): Maximum number of projects to return (default: 10).
            
        Returns:
            List[ProjectResponse]: List of matching projects.
        """
        search_pattern = f"%{search_term}%"
        projects = self.db.query(Project).filter(
            (Project.title.ilike(search_pattern)) |
            (Project.description.ilike(search_pattern)) |
            (Project.teamName.ilike(search_pattern))
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Found {len(projects)} projects matching search term: {search_term}")
        return [ProjectResponse.model_validate(project) for project in projects]
    
    def get_projects_without_course(self, skip: int = 0, limit: int = 10) -> List[ProjectResponse]:
        """Get projects that are not assigned to any course.
        
        Args:
            skip (int): Number of projects to skip (default: 0).
            limit (int): Maximum number of projects to return (default: 10).
            
        Returns:
            List[ProjectResponse]: List of projects without course assignment.
        """
        projects = self.db.query(Project).filter(
            Project.course_id.is_(None)
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(projects)} projects without course assignment")
        return [ProjectResponse.model_validate(project) for project in projects]
    
    def get_projects_by_team_name(self, team_name: str, skip: int = 0, limit: int = 10) -> List[ProjectResponse]:
        """Get projects by team name.
        
        Args:
            team_name (str): The team name to search for.
            skip (int): Number of projects to skip (default: 0).
            limit (int): Maximum number of projects to return (default: 10).
            
        Returns:
            List[ProjectResponse]: List of projects for the team.
        """
        projects = self.db.query(Project).filter(
            Project.teamName == team_name
        ).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(projects)} projects for team: {team_name}")
        return [ProjectResponse.model_validate(project) for project in projects]
    
    def get_projects_by_capacity(self, min_capacity: Optional[int] = None, max_capacity: Optional[int] = None, skip: int = 0, limit: int = 10) -> List[ProjectResponse]:
        """Get projects filtered by capacity range.
        
        Args:
            min_capacity (Optional[int]): Minimum capacity filter.
            max_capacity (Optional[int]): Maximum capacity filter.
            skip (int): Number of projects to skip (default: 0).
            limit (int): Maximum number of projects to return (default: 10).
            
        Returns:
            List[ProjectResponse]: List of projects matching capacity criteria.
        """
        query = self.db.query(Project)
        
        if min_capacity is not None:
            query = query.filter(Project.maxCapacity >= min_capacity)
        
        if max_capacity is not None:
            query = query.filter(Project.maxCapacity <= max_capacity)
        
        projects = query.offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(projects)} projects with capacity filter: min={min_capacity}, max={max_capacity}")
        return [ProjectResponse.model_validate(project) for project in projects] 