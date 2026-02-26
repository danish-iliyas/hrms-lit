from fastapi import APIRouter, HTTPException, Query, status
from database import get_database
from models import AttendanceCreate, AttendanceResponse
from pymongo.errors import DuplicateKeyError
from typing import Optional
from datetime import date

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for an employee on a given date."""
    db = get_database()

    # Verify employee exists
    employee = await db.employees.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance.employee_id}' not found",
        )

    attendance_data = {
        "employee_id": attendance.employee_id,
        "date": attendance.date.isoformat(),
        "status": attendance.status.value,
    }

    try:
        await db.attendance.insert_one(attendance_data)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for employee '{attendance.employee_id}' on {attendance.date.isoformat()} is already marked",
        )

    return AttendanceResponse(
        employee_id=attendance.employee_id,
        date=attendance.date.isoformat(),
        status=attendance.status.value,
        employee_name=employee["full_name"],
    )


@router.get("/{employee_id}", response_model=list[AttendanceResponse])
async def get_attendance(
    employee_id: str,
    date_from: Optional[date] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter to date (YYYY-MM-DD)"),
):
    """Get attendance records for an employee with optional date range filter."""
    db = get_database()

    # Verify employee exists
    employee = await db.employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )

    query = {"employee_id": employee_id}

    # Date range filter
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from.isoformat()
        if date_to:
            date_filter["$lte"] = date_to.isoformat()
        query["date"] = date_filter

    records = []
    async for record in db.attendance.find(query, {"_id": 0}).sort("date", -1):
        record["employee_name"] = employee["full_name"]
        records.append(AttendanceResponse(**record))

    return records


@router.get("/", response_model=list[AttendanceResponse])
async def get_all_attendance(
    date_from: Optional[date] = Query(None, description="Filter from date"),
    date_to: Optional[date] = Query(None, description="Filter to date"),
):
    """Get all attendance records with optional date range filter."""
    db = get_database()

    query = {}
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from.isoformat()
        if date_to:
            date_filter["$lte"] = date_to.isoformat()
        query["date"] = date_filter

    records = []
    async for record in db.attendance.find(query, {"_id": 0}).sort("date", -1):
        # Get employee name
        employee = await db.employees.find_one(
            {"employee_id": record["employee_id"]}, {"full_name": 1}
        )
        record["employee_name"] = employee["full_name"] if employee else "Unknown"
        records.append(AttendanceResponse(**record))

    return records
