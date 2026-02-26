from fastapi import APIRouter
from database import get_database
from models import DashboardSummary
from datetime import date

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    """Get dashboard summary stats."""
    db = get_database()

    total_employees = await db.employees.count_documents({})

    today = date.today().isoformat()

    present_today = await db.attendance.count_documents(
        {"date": today, "status": "Present"}
    )
    absent_today = await db.attendance.count_documents(
        {"date": today, "status": "Absent"}
    )
    not_marked_today = total_employees - present_today - absent_today

    return DashboardSummary(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        not_marked_today=max(0, not_marked_today),
    )
