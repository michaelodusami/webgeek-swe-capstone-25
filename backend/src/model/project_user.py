from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict
from typing import Optional
from src.config.base import Base

# Pydantic Models
class ProjectUserCreate(BaseModel):
    project_id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

class ProjectUserResponse(BaseModel):
    id: Optional[int] = None
    project_id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

# SQLAlchemy Model
class ProjectUser(Base):
    __tablename__ = "project_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    project = relationship("Project", back_populates="project_users")
    user = relationship("User", back_populates="project_users") 