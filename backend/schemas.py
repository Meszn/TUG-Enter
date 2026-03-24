from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class ProjectBase(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    purpose:      str = Field(..., min_length=1)
    responsible:  str = Field(..., min_length=1, max_length=500)
    start_date:   Optional[date]  = None
    telescope:    Optional[str]   = Field(None, max_length=100)

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id:         int
    image_path: Optional[str] = None
    is_completed: bool
    evaluation: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class ProjectCompleteRequest(BaseModel):
    evaluation: str = Field(..., min_length=1)

    class Config:
        from_attributes = True