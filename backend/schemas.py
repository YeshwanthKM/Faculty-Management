from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class FacultyBase(BaseModel):
    name: str
    department: str
    designation: Optional[str] = None
    max_duties: Optional[int] = 10
    current_duties: Optional[int] = 0
    availability: Optional[str] = "ANY"
    leave_dates: Optional[str] = ""

class FacultyCreate(FacultyBase):
    pass

class Faculty(FacultyBase):
    id: int
    class Config:
        from_attributes = True

class ExamScheduleBase(BaseModel):
    exam_name: str
    exam_date: date
    session: str
    hall_number: str
    department_conducting: str
    student_count: int
    required_invigilators: int
    status: Optional[str] = "Not Started"

class ExamScheduleCreate(ExamScheduleBase):
    pass

class ExamDetailBase(BaseModel):
    exam_date: date
    session: str
    department_conducting: str
    student_count: int
    required_invigilators: int

class ExamBulkCreate(BaseModel):
    schedule_name: str
    hall_numbers: List[str]
    exams: List[ExamDetailBase]

class ExamSchedule(ExamScheduleBase):
    id: int
    class Config:
        from_attributes = True

class Allocation(BaseModel):
    id: int
    faculty: Faculty
    exam_schedule: ExamSchedule
    class Config:
        from_attributes = True

class Insights(BaseModel):
    highest_workload_dept: str
    max_duties_faculty: str
    underutilized_count: int
    total_faculty: int
    total_exams: int
    dept_workload: dict # {dept: count}
    status_summary: dict # {status: count}

