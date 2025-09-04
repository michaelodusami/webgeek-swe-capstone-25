from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.config.base import Base

# Pydantic Models
class UserCourseCreate(BaseModel):
    user_id: int
    course_id: int
    model_config = ConfigDict(from_attributes=True)

class UserCourseResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    course_id: int
    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class UserCourse(Base):
    __tablename__ = "user_courses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="user_courses")
    course = relationship("Course", back_populates="user_courses") 