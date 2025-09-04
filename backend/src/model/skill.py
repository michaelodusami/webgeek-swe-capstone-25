from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.config.base import Base

# Pydantic Models
class SkillCreate(BaseModel):
    name: str
    model_config = ConfigDict(from_attributes=True)

class SkillResponse(BaseModel):
    id: Optional[int] = None
    name: str
    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)

    # Relationships
    project_skills = relationship("ProjectSkill", back_populates="skill")
    user_skills = relationship("UserSkill", back_populates="skill") 