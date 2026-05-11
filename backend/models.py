from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False)
    designation = Column(String(50))
    max_duties = Column(Integer, default=10)
    current_duties = Column(Integer, default=0)
    availability = Column(Text)  # JSON-like string
    leave_dates = Column(Text)   # JSON-like string

class ExamSchedule(Base):
    __tablename__ = "exam_schedule"

    id = Column(Integer, primary_key=True, index=True)
    exam_name = Column(String(200), nullable=False, default="General Exam")
    exam_date = Column(Date, nullable=False)
    session = Column(String(20), nullable=False)
    hall_number = Column(String(50), nullable=False)
    department_conducting = Column(String(50), nullable=False)
    student_count = Column(Integer)
    required_invigilators = Column(Integer)
    status = Column(String(20), default="Not Started") # Not Started, In Progress, Completed, Conflict

class Allocation(Base):
    __tablename__ = "allocation"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    schedule_id = Column(Integer, ForeignKey("exam_schedule.id"))

    faculty = relationship("Faculty")
    exam_schedule = relationship("ExamSchedule")
