from fastapi import APIRouter, HTTPException, status
from database import get_database
from models import EmployeeCreate, EmployeeResponse
from pymongo.errors import DuplicateKeyError

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    """Add a new employee."""
    db = get_database()

    employee_data = employee.model_dump()

    try:
        await db.employees.insert_one(employee_data)
    except DuplicateKeyError:
        # Check what field caused the duplicate
        existing_by_id = await db.employees.find_one({"employee_id": employee.employee_id})
        if existing_by_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with ID '{employee.employee_id}' already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{employee.email}' already exists",
        )

    return EmployeeResponse(**employee_data)


@router.get("/", response_model=list[EmployeeResponse])
async def list_employees():
    """Get all employees with their attendance summary."""
    db = get_database()

    employees = []
    async for emp in db.employees.find({}, {"_id": 0}):
        # Count present and absent days
        present_count = await db.attendance.count_documents(
            {"employee_id": emp["employee_id"], "status": "Present"}
        )
        absent_count = await db.attendance.count_documents(
            {"employee_id": emp["employee_id"], "status": "Absent"}
        )
        emp["total_present"] = present_count
        emp["total_absent"] = absent_count
        employees.append(EmployeeResponse(**emp))

    return employees


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    """Get a single employee by ID."""
    db = get_database()

    employee = await db.employees.find_one({"employee_id": employee_id}, {"_id": 0})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )

    present_count = await db.attendance.count_documents(
        {"employee_id": employee_id, "status": "Present"}
    )
    absent_count = await db.attendance.count_documents(
        {"employee_id": employee_id, "status": "Absent"}
    )
    employee["total_present"] = present_count
    employee["total_absent"] = absent_count

    return EmployeeResponse(**employee)


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
async def delete_employee(employee_id: str):
    """Delete an employee and all their attendance records."""
    db = get_database()

    result = await db.employees.delete_one({"employee_id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )

    # Also delete all attendance records
    attendance_result = await db.attendance.delete_many({"employee_id": employee_id})

    return {
        "message": f"Employee '{employee_id}' deleted successfully",
        "attendance_records_deleted": attendance_result.deleted_count,
    }
