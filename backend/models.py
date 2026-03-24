from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, func
from database import Base


class Project(Base):
    __tablename__ = "projects"

    id           = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(255), nullable=False, index=True)
    purpose      = Column(Text, nullable=False)
    responsible  = Column(String(200), nullable=False)
    start_date   = Column(Date, nullable=True)
    telescope    = Column(String(100), nullable=True)
    image_path   = Column(String(500), nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    evaluation   = Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)