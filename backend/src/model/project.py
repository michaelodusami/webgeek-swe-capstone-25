from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from src.config.base import Base

# Pydantic Models
class ProjectCreate(BaseModel):
    course_id: Optional[int] = None
    title: str
    description: str
    maxCapacity: int
    teamName: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProjectResponse(BaseModel):
    id: Optional[int] = None
    course_id: Optional[int] = None
    title: str
    description: str
    maxCapacity: int
    teamName: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    maxCapacity = Column(Integer, nullable=False, default=4)
    teamName = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    course = relationship("Course", back_populates="projects")
    project_skills = relationship("ProjectSkill", back_populates="project")
    project_users = relationship("ProjectUser", back_populates="project") 