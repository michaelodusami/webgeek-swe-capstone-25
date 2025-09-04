from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.config.base import Base

# Pydantic Models
class ProjectSkillCreate(BaseModel):
    project_id: int
    skill_id: int
    model_config = ConfigDict(from_attributes=True)

class ProjectSkillResponse(BaseModel):
    id: Optional[int] = None
    project_id: int
    skill_id: int
    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class ProjectSkill(Base):
    __tablename__ = "project_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    project = relationship("Project", back_populates="project_skills")
    skill = relationship("Skill", back_populates="project_skills") 