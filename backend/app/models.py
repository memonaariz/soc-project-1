from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    cases = relationship("Case", back_populates="analyst")

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    raw_alert = Column(Text, nullable=False)
    severity = Column(String(20), default="UNKNOWN")
    status = Column(String(30), default="OPEN")
    mitre_techniques = Column(Text, default="[]")   # JSON string
    triage_summary = Column(Text, default="")
    playbook = Column(Text, default="")
    notes = Column(Text, default="")
    analyst_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    analyst = relationship("User", back_populates="cases")

class IOCResult(Base):
    __tablename__ = "ioc_results"
    id = Column(Integer, primary_key=True, index=True)
    ioc_value = Column(String(500), nullable=False)
    ioc_type = Column(String(50), nullable=False)
    verdict = Column(String(30), default="UNKNOWN")
    risk_score = Column(Float, default=0.0)
    raw_data = Column(Text, default="{}")
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    queried_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
