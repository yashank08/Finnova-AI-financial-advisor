import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("finnova.errors")


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return clear, flat error messages instead of raw pydantic output."""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({
            "field": field,
            "message": error["msg"].replace("Value error, ", ""),
            "type": error["type"]
        })
    logger.warning(f"Validation error on {request.url}: {errors}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": errors,
            "message": "Validation failed. Please check your input."
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Uniform HTTP error format."""
    logger.warning(f"HTTP {exc.status_code} on {request.url}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled server errors."""
    logger.error(f"Unhandled exception on {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again later."}
    )
