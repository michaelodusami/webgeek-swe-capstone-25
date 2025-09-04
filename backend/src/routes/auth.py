# --- Directory: src/routes ---
# Create a new file: src/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import RedirectResponse, Response, JSONResponse

from cas import CASClient
from src.model.user import UserCreate, UserResponse, User
from src.services.user_service import UserService
from src.dependencies.dependencies import get_user_service
from src.core.settings import settings
import logging
from sqlalchemy.orm import Session
from src.config.database import get_db

logger = logging.getLogger(__name__)

SERVICE_URL = "https://webgeek.discovery.cs.vt.edu"

router = APIRouter(tags=["auth"])

# CAS Client Configuration (mimicking Node.js auth.cas.js)
cas_client = CASClient(
    version='2',  # CAS 2.0
    service_url=f"{SERVICE_URL}/api/login?",
    server_url='https://login.vt.edu/profile/cas/',
)

@router.get("/api/login")
def login(request: Request, user_service: UserService = Depends(get_user_service), db: Session = Depends(get_db), role: str = Query("student", description="Role to use for dev login (staff, student, etc.)")):
    """Handle CAS login and user creation/update.
    
    - If no ticket, redirect to CAS login.
    - If ticket present, validate and create/update user in database.
    
    Args:
        request (Request): The current request object.
        user_service (UserService): User service instance.
        
    Returns:
        dict: Login success message and user details.
        
    Raises:
        HTTPException: If ticket validation fails (401).
    """
    logger.info(f"Session before login: {dict(request.session)}")
    if settings.ENVIRONMENT == "development":
        user = db.query(User).filter(User.edupersonprimaryaffiliation.ilike(role)).first()
        if not user:
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": f"Dev user '{role}' not found in database"}
            )
        request.session['username'] = user.username
        logger.info(f"Mock login session: {dict(request.session)}")
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": "Mock login successful", "user": UserResponse.model_validate(user).model_dump(mode='json')}, "error": None}
        )
    if 'username' in request.session:
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": "Logged in!", "username": request.session['username']}, "error": None}
        )

    ticket = request.query_params.get('ticket')
    if not ticket:
        login_url = cas_client.get_login_url()
        logger.info(f"Returning CAS redirect URL: {login_url}")
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"redirect_url": login_url, "message": "Redirect to CAS login"}, "error": None}
        )

    (user, attributes, _) = cas_client.verify_ticket(ticket)
    if not user:
        logger.warning("CAS ticket validation failed")
        return JSONResponse(
            status_code=401,
            content={"success": False, "data": None, "error": "Invalid CAS ticket"}
        )

    attributes = attributes or {}
    request.session['username'] = user
    logger.info(f"CAS login session: {dict(request.session)}")

    existing_user = user_service.get_user_by_username(user)
    if not existing_user:
        user_create = UserCreate(
            username=user,
            edupersonprimaryaffiliation=attributes.get('eduPersonPrimaryAffiliation', 'student'),
            uupid=attributes.get('uid') or user,
            edupersonprincipalname=attributes.get('eduPersonPrincipalName', f"{user}@vt.edu")
        )
        created_user = user_service.create_user(user_create)
        logger.info(f"Created new user from CAS: {created_user}")
    else:
        logger.info(f"Existing user logged in: {user}")
        created_user = existing_user
    return RedirectResponse(SERVICE_URL)
    # return JSONResponse(
    #     status_code=200,
    #     content={"success": True, "data": {"message": "Logged in successfully", "user": UserResponse.model_validate(created_user).model_dump(mode='json')}, "error": None}
    # )

@router.get("/api/logout")
def logout(request: Request):
    """Handle CAS logout and session destruction.
    
    Args:
        request (Request): The current request object.
        
    Returns:
        RedirectResponse: Redirect to CAS logout URL.
    """
    username = request.session.get('username')
    if settings.ENVIRONMENT == "development":
        request.session.pop('username', None)
        return JSONResponse(
            status_code=200,
            content={"success": True, "data": {"message": "Mock logout successful", "user": username}, "error": None}
        )
    logout_url = cas_client.get_logout_url(SERVICE_URL)
    logger.info(f"Logged out user: {username}")
    request.session.pop('username', None)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": {"redirect_url": logout_url, "message": "Redirect to CAS logout"}, "error": None}
    )

@router.get("/api/me")
def get_me(request: Request, user_service: UserService = Depends(get_user_service)):
    username = request.session.get('username')
    if not username:
        return JSONResponse(
            status_code=401,
            content={"success": False, "data": None, "error": "Not logged in"}
        )
    user = user_service.get_user_by_username(username)
    if not user:
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "User not found"}
        )
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": UserResponse.model_validate(user).model_dump(mode='json'), "error": None}
    )