from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from src.config.base import Base

# Pydantic Models
class CourseCreate(BaseModel):
    semester_id: Optional[int] = None
    crn: str
    displayName: str

    model_config = ConfigDict(from_attributes=True)

class CourseResponse(BaseModel):
    id: Optional[int] = None
    semester_id: Optional[int] = None
    crn: str
    displayName: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    semester_id = Column(Integer, ForeignKey("semesters.id", ondelete="SET NULL"), nullable=True, index=True)
    crn = Column(String(100), nullable=False, unique=True)
    displayName = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    semester = relationship("Semester", back_populates="courses")
    projects = relationship("Project", back_populates="course")
    user_courses = relationship("UserCourse", back_populates="course") 