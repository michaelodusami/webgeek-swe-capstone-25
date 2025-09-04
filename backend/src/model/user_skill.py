from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.config.base import Base

# Pydantic Models
class UserSkillCreate(BaseModel):
    user_id: int
    skill_id: int
    model_config = ConfigDict(from_attributes=True)

class UserSkillResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    skill_id: int
    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="user_skills")
    skill = relationship("Skill", back_populates="user_skills") 