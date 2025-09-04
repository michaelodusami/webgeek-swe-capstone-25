from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from src.config.base import Base

# Pydantic Models
class SemesterCreate(BaseModel):
    displayName: str
    semesterStartDate: datetime
    semesterEndDate: datetime

    model_config = ConfigDict(from_attributes=True)

class SemesterResponse(BaseModel):
    id: Optional[int] = None
    displayName: str
    semesterStartDate: datetime
    semesterEndDate: datetime
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class Semester(Base):
    __tablename__ = "semesters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    displayName = Column(String(255), nullable=False)
    semesterStartDate = Column(DateTime(timezone=True), nullable=False)
    semesterEndDate = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    courses = relationship("Course", back_populates="semester") 