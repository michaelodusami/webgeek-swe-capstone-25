from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from src.config.base import Base
from sqlalchemy.orm import relationship

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    edupersonprimaryaffiliation: str
    uupid: str
    edupersonprincipalname: str

    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: Optional[int] = None
    username: str
    edupersonprimaryaffiliation: str
    uupid: str
    edupersonprincipalname: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), nullable=False, unique=True)
    edupersonprimaryaffiliation = Column(String(255), nullable=False)
    uupid = Column(String(255), nullable=False, unique=True)
    edupersonprincipalname = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project_users = relationship("ProjectUser", back_populates="user")
    user_courses = relationship("UserCourse", back_populates="user")
    user_skills = relationship("UserSkill", back_populates="user")