from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum
from typing import Optional
import datetime


class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"


# ─── Employee Models ───


class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=20, description="Unique employee ID")
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of the employee")
    email: EmailStr = Field(..., description="Valid email address")
    department: str = Field(..., min_length=1, max_length=50, description="Department name")

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Employee ID cannot be empty")
        return v.strip()


class EmployeeResponse(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str
    total_present: Optional[int] = 0
    total_absent: Optional[int] = 0


# ─── Attendance Models ───


class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Employee ID")
    date: datetime.date = Field(..., description="Attendance date (YYYY-MM-DD)")
    status: AttendanceStatus = Field(..., description="Present or Absent")

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Employee ID cannot be empty")
        return v.strip()


class AttendanceResponse(BaseModel):
    employee_id: str
    date: str
    status: str
    employee_name: Optional[str] = None


# ─── Dashboard Models ───


class DashboardSummary(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    not_marked_today: int
