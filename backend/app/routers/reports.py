"""
Reports Router
--------------
GET  /api/reports/summary
GET  /api/reports/monthly
GET  /api/reports/category
GET  /api/reports/yearly
POST /api/reports/upload    (CSV bank-statement import)
"""

import io
import csv
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from pydantic import BaseModel

from app.dependencies.auth import get_current_user
from app.schemas.report import (
    MonthlyReportResponse,
    CategoryReportResponse,
    YearlyReportResponse,
    ReportSummaryResponse,
)
from app.services.report_service import (
    get_monthly_report,
    get_category_report,
    get_yearly_report,
    get_report_summary,
)

router = APIRouter(prefix="/api/reports", tags=["Reports"])


# ---------------------------------------------------------------------------
# Summary (used by the Reports page frontend)
# ---------------------------------------------------------------------------

@router.get("/summary", response_model=ReportSummaryResponse)
async def report_summary(current_user: dict = Depends(get_current_user)):
    """
    Unified summary: totals + category breakdown + monthly trend.
    Used by the frontend Reports page.
    """
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await get_report_summary(user_id)


# ---------------------------------------------------------------------------
# Individual report endpoints
# ---------------------------------------------------------------------------

@router.get("/monthly", response_model=MonthlyReportResponse)
async def monthly_report(current_user: dict = Depends(get_current_user)):
    """Monthly income/expense/savings breakdown. Returns Chart.js-ready arrays."""
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await get_monthly_report(user_id)


@router.get("/category", response_model=CategoryReportResponse)
async def category_report(current_user: dict = Depends(get_current_user)):
    """Expense breakdown by category. Returns Chart.js-ready arrays."""
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await get_category_report(user_id)


@router.get("/yearly", response_model=YearlyReportResponse)
async def yearly_report(current_user: dict = Depends(get_current_user)):
    """Year-over-year income/expense/savings. Returns Chart.js-ready arrays."""
    user_id = str(current_user.get("_id", current_user.get("id")))
    return await get_yearly_report(user_id)


# ---------------------------------------------------------------------------
# CSV Bank-Statement Upload
# ---------------------------------------------------------------------------

class UploadResult(BaseModel):
    imported: int
    skipped: int
    errors: List[str]
    message: str


@router.post("/upload", response_model=UploadResult)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Import transactions from a CSV bank-statement file.

    Accepted columns (case-insensitive, flexible order):
      date, description, amount, type, category

    'type' defaults to 'Expense' if not provided.
    'category' defaults to 'Other' if not provided.
    Rows with missing date or unparseable amount are skipped.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are accepted.",
        )

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")  # handles BOM from Excel exports
    except UnicodeDecodeError:
        text = raw.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))

    # Normalise header names to lowercase with no spaces
    if reader.fieldnames is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file appears to be empty or has no headers.",
        )

    header_map: dict = {h.strip().lower().replace(" ", "_"): h for h in reader.fieldnames}

    def _col(row: dict, *aliases: str) -> Optional[str]:
        """Find first matching column value."""
        for alias in aliases:
            if alias in header_map:
                val = row.get(header_map[alias], "").strip()
                if val:
                    return val
        return None

    from app.core.database import get_db, save_fallback_data
    import uuid

    db_obj = get_db()
    user_id = str(current_user.get("_id", current_user.get("id")))

    imported = 0
    skipped = 0
    errors: List[str] = []

    DATE_FORMATS = [
        "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y",
        "%d-%m-%Y", "%m-%d-%Y", "%d %b %Y",
        "%d %B %Y", "%Y/%m/%d",
    ]

    def _parse_date(raw_date: str) -> Optional[datetime]:
        for fmt in DATE_FORMATS:
            try:
                return datetime.strptime(raw_date.strip(), fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                continue
        return None

    rows = list(reader)
    for idx, row in enumerate(rows, start=2):  # row 1 = header
        raw_date = _col(row, "date", "transaction_date", "trans_date", "value_date")
        raw_amount = _col(row, "amount", "debit", "credit", "transaction_amount")
        description = _col(row, "description", "narration", "particulars", "remarks", "memo") or "Imported"
        tx_type = _col(row, "type", "transaction_type", "dr/cr") or "Expense"
        category = _col(row, "category", "cat") or "Other"

        if not raw_date:
            errors.append(f"Row {idx}: missing date — skipped.")
            skipped += 1
            continue

        parsed_date = _parse_date(raw_date)
        if not parsed_date:
            errors.append(f"Row {idx}: cannot parse date '{raw_date}' — skipped.")
            skipped += 1
            continue

        if not raw_amount:
            errors.append(f"Row {idx}: missing amount — skipped.")
            skipped += 1
            continue

        try:
            # Handle amounts like "1,234.56" or negative "(500.00)"
            clean_amt = raw_amount.replace(",", "").replace("(", "-").replace(")", "")
            amount = abs(float(clean_amt))
        except ValueError:
            errors.append(f"Row {idx}: invalid amount '{raw_amount}' — skipped.")
            skipped += 1
            continue

        # Normalise type
        tx_type_clean = tx_type.strip().capitalize()
        if tx_type_clean not in ("Income", "Expense"):
            # Heuristic: if original was 'CR' or 'credit', treat as Income
            if tx_type.upper() in ("CR", "CREDIT", "C"):
                tx_type_clean = "Income"
            else:
                tx_type_clean = "Expense"

        tx_doc = {
            "userId": user_id,
            "type": tx_type_clean,
            "category": category.strip(),
            "amount": round(amount, 2),
            "description": description[:200],
            "date": parsed_date,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
            "source": "csv_import",
        }

        if db_obj.is_connected and db_obj.db is not None:
            await db_obj.db.transactions.insert_one(tx_doc)
        else:
            tx_id = str(uuid.uuid4())
            tx_doc["id"] = tx_id
            tx_doc["_id"] = tx_id
            tx_doc["date"] = parsed_date.isoformat()
            db_obj.in_memory_transactions[tx_id] = tx_doc
            save_fallback_data()

        imported += 1

    return UploadResult(
        imported=imported,
        skipped=skipped,
        errors=errors[:20],  # cap at 20 error messages
        message=f"Successfully imported {imported} transaction(s). {skipped} row(s) skipped.",
    )

