from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    applications,
    documents,
    verification,
    compliance_rules,
    reviews,
    reports,
    admin,
    notifications,
    contact
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(verification.router, prefix="/verification", tags=["Verification"])
api_router.include_router(compliance_rules.router, prefix="/compliance-rules", tags=["Compliance Rules"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Compliance Review"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(contact.router, prefix="/contact", tags=["Contact & Support"])
