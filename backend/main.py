from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Depends,
    status
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import Boolean, Column, ForeignKey, Integer
from pydantic import BaseModel, EmailStr

import os
import shutil
import uuid

from backend.predictor import predict_image
from backend.database import get_db, Scan, User, Base, engine
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)


# ============================================================
# APP
# ============================================================

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    notifications = Column(Boolean, nullable=False, default=True)
    sound = Column(Boolean, nullable=False, default=True)
    camera = Column(Boolean, nullable=False, default=True)


# Create the settings table if it does not exist.
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Eco-Sort AI API",
    description="AI-powered waste classification and segregation assistant",
    version="1.2.0"
)


# ============================================================
# AUTHENTICATION SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):

    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):

    email: EmailStr
    password: str


class ProfileUpdateRequest(BaseModel):
    name: str
    email: EmailStr


class SettingsUpdateRequest(BaseModel):
    notifications: bool
    sound: bool
    camera: bool


# ============================================================
# AUTHENTICATION
# ============================================================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    user_id = decode_access_token(token)

    if user_id is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


# ============================================================
# REGISTER
# ============================================================

@app.post("/auth/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    name = data.name.strip()
    email = data.email.lower().strip()

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name is required"
        )

    if len(data.password) < 8:

        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Account created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/auth/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None or not verify_password(
        data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(user.id)

    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/auth/me")
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "success": True,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "created_at": (
                current_user.created_at.isoformat()
                if current_user.created_at
                else None
            )
        }
    }


# ============================================================
# UPDATE CURRENT USER PROFILE
# ============================================================

@app.put("/auth/profile")
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    name = data.name.strip()
    email = data.email.lower().strip()

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    existing_user = (
        db.query(User)
        .filter(User.email == email, User.id != current_user.id)
        .first()
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    current_user.name = name
    current_user.email = email
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        }
    }


# ============================================================
# USER SETTINGS
# ============================================================

@app.get("/auth/settings")
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = (
        db.query(UserSettings)
        .filter(UserSettings.user_id == current_user.id)
        .first()
    )

    if settings is None:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return {
        "success": True,
        "settings": {
            "notifications": bool(settings.notifications),
            "sound": bool(settings.sound),
            "camera": bool(settings.camera)
        }
    }


@app.put("/auth/settings")
def update_settings(
    data: SettingsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = (
        db.query(UserSettings)
        .filter(UserSettings.user_id == current_user.id)
        .first()
    )

    if settings is None:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    settings.notifications = data.notifications
    settings.sound = data.sound
    settings.camera = data.camera

    db.commit()
    db.refresh(settings)

    return {
        "success": True,
        "message": "Settings updated successfully",
        "settings": {
            "notifications": bool(settings.notifications),
            "sound": bool(settings.sound),
            "camera": bool(settings.camera)
        }
    }


# ============================================================
# CORS
# ============================================================

# Frontend origins are configurable for local development and deployment.
#
# Vite may move from port 5173 to 5174 (or another port) if the
# default port is already in use. Keep the common local origins here
# so the API remains usable during development.
#
# Example:
# ECO_SORT_FRONTEND_URLS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174
frontend_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "ECO_SORT_FRONTEND_URLS",
        (
            "http://localhost:5173,"
            "http://localhost:5174,"
            "http://127.0.0.1:5173,"
            "http://127.0.0.1:5174"
        )
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "temp_uploads"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message": "Eco-Sort AI API is running",
        "status": "online",
        "version": "1.2.0",
        "features": [
            "AI Waste Classification",
            "Confidence Analysis",
            "Disposal Guidance",
            "Explainable AI",
            "Grad-CAM Visualization",
            "Real-Time Camera"
        ]
    }


# ============================================================
# PREDICT — NORMAL IMAGE UPLOAD
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WEBP image."
        )


    # --------------------------------------------------------
    # Generate temporary filename
    # --------------------------------------------------------

    extension = os.path.splitext(
        file.filename or ""
    )[1].lower()

    if not extension:
        extension = ".jpg"

    filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )


    try:

        # ----------------------------------------------------
        # Save uploaded image temporarily
        # ----------------------------------------------------

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        # ----------------------------------------------------
        # AI prediction + Grad-CAM
        # ----------------------------------------------------

        result = predict_image(
            file_path
        )


        # ----------------------------------------------------
        # Save scan to database
        # ----------------------------------------------------

        scan = Scan(

            category=result["category"],

            confidence=result["confidence"],

            confidence_status=result[
                "confidence_status"
            ],

            review_required=(
                1
                if result["review_required"]
                else 0
            ),

            recommended_bin=result[
                "recommended_bin"
            ],

            disposal_guidance=result[
                "disposal_guidance"
            ],

            explanation=result[
                "explanation"
            ],

            hazardous_warning=(
                1
                if result["hazardous_warning"]
                else 0
            ),

            user_id=current_user.id
        )


        db.add(scan)

        db.commit()

        db.refresh(scan)


        # ----------------------------------------------------
        # Return prediction
        # ----------------------------------------------------

        return {

            "success": True,

            "scan_id": scan.id,

            "filename": file.filename,

            "category": result[
                "category"
            ],

            "confidence": result[
                "confidence"
            ],

            "confidence_status": result[
                "confidence_status"
            ],

            "review_required": result[
                "review_required"
            ],

            "recommended_bin": result[
                "recommended_bin"
            ],

            "disposal_guidance": result[
                "disposal_guidance"
            ],

            "explanation": result[
                "explanation"
            ],

            "hazardous_warning": result[
                "hazardous_warning"
            ],

            # ------------------------------------------------
            # Explainable AI
            # ------------------------------------------------

            "gradcam_available": result.get(
                "gradcam_available",
                False
            ),

            "gradcam_image": result.get(
                "gradcam_image"
            ),

            "xai": {
                "method": "Grad-CAM",
                "description": (
                    "Highlighted regions show areas "
                    "that contributed more strongly "
                    "to the AI classification."
                )
            }
        }


    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


    finally:

        # ----------------------------------------------------
        # Delete temporary image
        # ----------------------------------------------------

        if os.path.exists(
            file_path
        ):

            os.remove(
                file_path
            )


# ============================================================
# REAL-TIME CAMERA FRAME PREDICTION
# ============================================================

@app.post("/predict-frame")
async def predict_frame(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]


    # --------------------------------------------------------
    # Validate frame
    # --------------------------------------------------------

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please send a JPG, PNG, "
                "or WEBP camera frame."
            )
        )


    # --------------------------------------------------------
    # Generate temporary filename
    # --------------------------------------------------------

    extension = os.path.splitext(
        file.filename or ""
    )[1].lower()

    if not extension:
        extension = ".jpg"

    filename = (
        f"camera_{uuid.uuid4()}{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )


    try:

        # ----------------------------------------------------
        # Save camera frame temporarily
        # ----------------------------------------------------

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        # ----------------------------------------------------
        # AI prediction + Grad-CAM
        # ----------------------------------------------------

        result = predict_image(
            file_path
        )


        # ----------------------------------------------------
        # Return live prediction
        #
        # IMPORTANT:
        # Camera frames are NOT saved to database.
        # ----------------------------------------------------

        return {

            "success": True,

            "mode": "realtime_camera",

            "category": result[
                "category"
            ],

            "confidence": result[
                "confidence"
            ],

            "confidence_status": result[
                "confidence_status"
            ],

            "review_required": result[
                "review_required"
            ],

            "recommended_bin": result[
                "recommended_bin"
            ],

            "disposal_guidance": result[
                "disposal_guidance"
            ],

            "explanation": result[
                "explanation"
            ],

            "hazardous_warning": result[
                "hazardous_warning"
            ],

            # ------------------------------------------------
            # Grad-CAM
            # ------------------------------------------------

            "gradcam_available": result.get(
                "gradcam_available",
                False
            ),

            "gradcam_image": result.get(
                "gradcam_image"
            ),

            "xai": {
                "method": "Grad-CAM",
                "description": (
                    "Highlighted regions show areas "
                    "that contributed more strongly "
                    "to the AI classification."
                )
            }
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Camera frame prediction failed: "
                f"{str(e)}"
            )
        )


    finally:

        # ----------------------------------------------------
        # Delete temporary frame
        # ----------------------------------------------------

        if os.path.exists(
            file_path
        ):

            os.remove(
                file_path
            )


# ============================================================
# HISTORY
# ============================================================

@app.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(
            Scan.timestamp.desc()
        )
        .all()
    )

    history = []


    for scan in scans:

        history.append({

            "id": scan.id,

            "category": scan.category,

            "confidence": scan.confidence,

            "confidence_status": (
                scan.confidence_status
            ),

            "review_required": bool(
                scan.review_required
            ),

            "recommended_bin": (
                scan.recommended_bin
            ),

            "disposal_guidance": (
                scan.disposal_guidance
            ),

            "explanation": (
                scan.explanation
            ),

            "hazardous_warning": bool(
                scan.hazardous_warning
            ),

            "timestamp": (
                scan.timestamp.isoformat()
                if scan.timestamp
                else None
            )
        })


    return {

        "success": True,

        "total_scans": len(history),

        "scans": history
    }


# ============================================================
# ANALYTICS
# ============================================================

@app.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .all()
    )

    total_scans = len(scans)


    # --------------------------------------------------------
    # Category counts
    # --------------------------------------------------------

    hazardous_count = sum(
        1
        for scan in scans
        if scan.category == "Hazardous"
    )

    organic_count = sum(
        1
        for scan in scans
        if scan.category == "Organic"
    )

    recyclable_count = sum(
        1
        for scan in scans
        if scan.category == "Recyclable"
    )


    # --------------------------------------------------------
    # Average confidence
    # --------------------------------------------------------

    if total_scans > 0:

        average_confidence = (
            sum(
                scan.confidence
                for scan in scans
            )
            / total_scans
        )

    else:

        average_confidence = 0


    # --------------------------------------------------------
    # Category percentages
    # --------------------------------------------------------

    if total_scans > 0:

        hazardous_percentage = (
            hazardous_count
            / total_scans
        ) * 100

        organic_percentage = (
            organic_count
            / total_scans
        ) * 100

        recyclable_percentage = (
            recyclable_count
            / total_scans
        ) * 100

    else:

        hazardous_percentage = 0
        organic_percentage = 0
        recyclable_percentage = 0


    # --------------------------------------------------------
    # Low-confidence scans
    # --------------------------------------------------------

    low_confidence_count = sum(
        1
        for scan in scans
        if scan.review_required
    )


    # --------------------------------------------------------
    # Return analytics
    # --------------------------------------------------------

    return {

        "success": True,

        "total_scans": total_scans,

        "average_confidence": round(
            average_confidence,
            2
        ),

        "low_confidence_scans": (
            low_confidence_count
        ),

        "categories": {

            "Hazardous": {

                "count": hazardous_count,

                "percentage": round(
                    hazardous_percentage,
                    2
                )
            },

            "Organic": {

                "count": organic_count,

                "percentage": round(
                    organic_percentage,
                    2
                )
            },

            "Recyclable": {

                "count": recyclable_count,

                "percentage": round(
                    recyclable_percentage,
                    2
                )
            }
        }
    }


# ============================================================
# ECO-SORT SCORE
# ============================================================

@app.get("/eco-score")
def get_eco_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(
            Scan.timestamp.asc()
        )
        .all()
    )


    # --------------------------------------------------------
    # No scans
    # --------------------------------------------------------

    if not scans:

        return {

            "success": True,

            "eco_sort_score": 0,

            "level": "Eco Beginner",

            "total_scans": 0,

            "score_breakdown": {
                "ai_confidence": 0,
                "sorting_reliability": 0,
                "safe_handling": 0,
                "consistency": 0
            },

            "message": (
                "Start scanning waste to build "
                "your Eco-Sort Score."
            )
        }


    total_scans = len(scans)


    # ========================================================
    # FACTOR 1 — AI CONFIDENCE
    # Weight: 50%
    # ========================================================

    average_confidence = (
        sum(
            float(scan.confidence or 0)
            for scan in scans
        )
        / total_scans
    )

    confidence_score = min(
        max(average_confidence, 0),
        100
    )


    # ========================================================
    # FACTOR 2 — SORTING RELIABILITY
    # Weight: 25%
    #
    # High-confidence classifications count as successful
    # sorting decisions.
    # Low-confidence decisions require verification.
    # ========================================================

    reliable_scans = sum(
        1
        for scan in scans
        if not scan.review_required
    )

    sorting_reliability = (
        reliable_scans
        / total_scans
    ) * 100


    # ========================================================
    # FACTOR 3 — SAFE HANDLING
    # Weight: 15%
    #
    # Hazardous items are treated more carefully:
    #
    # - Correctly flagged hazardous item = full score
    # - Low-confidence item = partial score
    # - High-confidence non-hazardous item = full score
    #
    # This is a product metric, not a real-world safety
    # certification.
    # ========================================================

    safe_handling_values = []

    for scan in scans:

        if scan.review_required:

            # Uncertain classification should encourage
            # manual verification rather than automatic disposal.
            safe_handling_values.append(50)

        elif scan.category == "Hazardous":

            # Hazardous warning was generated by the backend.
            if scan.hazardous_warning:

                safe_handling_values.append(100)

            else:

                safe_handling_values.append(60)

        else:

            safe_handling_values.append(100)


    safe_handling_score = (
        sum(safe_handling_values)
        / len(safe_handling_values)
    )


    # ========================================================
    # FACTOR 4 — CONSISTENCY
    # Weight: 10%
    #
    # More completed scans demonstrate continued engagement.
    # The score gradually approaches 100 and does not punish
    # a new user excessively.
    # ========================================================

    consistency_score = min(
        100,
        40 + (
            min(total_scans, 20)
            / 20
            * 60
        )
    )


    # ========================================================
    # FINAL WEIGHTED SCORE
    # ========================================================

    eco_score = (
        confidence_score * 0.50
        + sorting_reliability * 0.25
        + safe_handling_score * 0.15
        + consistency_score * 0.10
    )

    eco_score = round(
        min(max(eco_score, 0), 100),
        2
    )


    # ========================================================
    # LEVEL
    # ========================================================

    if eco_score >= 90:

        level = "Eco Legend"

    elif eco_score >= 75:

        level = "Eco Champion"

    elif eco_score >= 60:

        level = "Eco Explorer"

    else:

        level = "Eco Beginner"


    # ========================================================
    # NEXT LEVEL
    # ========================================================

    if eco_score >= 90:

        next_level = None
        points_to_next_level = 0

    elif eco_score >= 75:

        next_level = "Eco Legend"
        points_to_next_level = round(
            90 - eco_score,
            2
        )

    elif eco_score >= 60:

        next_level = "Eco Champion"
        points_to_next_level = round(
            75 - eco_score,
            2
        )

    else:

        next_level = "Eco Explorer"
        points_to_next_level = round(
            60 - eco_score,
            2
        )


    # ========================================================
    # RETURN SCORE
    # ========================================================

    return {

        "success": True,

        "eco_sort_score": eco_score,

        "level": level,

        "total_scans": total_scans,

        "score_breakdown": {

            "ai_confidence": round(
                confidence_score,
                2
            ),

            "sorting_reliability": round(
                sorting_reliability,
                2
            ),

            "safe_handling": round(
                safe_handling_score,
                2
            ),

            "consistency": round(
                consistency_score,
                2
            )
        },

        "weights": {

            "ai_confidence": 50,

            "sorting_reliability": 25,

            "safe_handling": 15,

            "consistency": 10
        },

        "next_level": next_level,

        "points_to_next_level": points_to_next_level,

        "message": (
            "Keep scanning, verify uncertain items, "
            "and follow the recommended disposal guidance "
            "to improve your Eco-Sort Score."
        ),

        "note": (
            "Eco-Sort Score is an indicative product metric "
            "based on AI confidence, scan reliability, safe "
            "handling signals, and scan consistency. It is "
            "not a scientific measurement of environmental impact "
            "or a certification of disposal correctness."
        )
    }


# ============================================================
# ECO IMPACT
# ============================================================

@app.get("/eco-impact")
def get_eco_impact(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .all()
    )

    total_scans = len(scans)


    recyclable_count = sum(
        1
        for scan in scans
        if scan.category == "Recyclable"
    )

    organic_count = sum(
        1
        for scan in scans
        if scan.category == "Organic"
    )

    hazardous_count = sum(
        1
        for scan in scans
        if scan.category == "Hazardous"
    )


    recyclable_points = (
        recyclable_count * 2
    )

    organic_points = (
        organic_count * 1
    )

    hazardous_points = (
        hazardous_count * 1
    )


    eco_impact_score = (
        recyclable_points
        + organic_points
        + hazardous_points
    )


    correctly_sorted = sum(
        1
        for scan in scans
        if not scan.review_required
    )


    return {

        "success": True,

        "total_items_sorted": total_scans,

        "correctly_sorted_items": (
            correctly_sorted
        ),

        "recyclable_items": (
            recyclable_count
        ),

        "organic_items": (
            organic_count
        ),

        "hazardous_items": (
            hazardous_count
        ),

        "eco_impact_score": (
            eco_impact_score
        ),

        "message": (
            "Every correctly sorted item contributes "
            "to better waste segregation."
        ),

        "note": (
            "Eco impact score is an indicative product metric. "
            "It is not a scientific estimate of weight, "
            "recycling savings, or CO2 reduction."
        )
    }


# ============================================================
# GAMIFICATION
# ============================================================

@app.get("/gamification")
def get_gamification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(
            Scan.timestamp.asc()
        )
        .all()
    )

    total_scans = len(scans)

    # --------------------------------------------------------
    # No scans
    # --------------------------------------------------------

    if total_scans == 0:

        return {
            "success": True,
            "eco_points": 0,
            "points": 0,
            "level": "Eco Beginner",
            "badges": [],
            "current_streak": 0,
            "total_scans": 0,
            "next_level": "Eco Explorer",
            "next_level_points": 100,
            "points_to_next_level": 100,
            "progress_percentage": 0,
            "point_rules": {
                "high_confidence_scan": 10,
                "low_confidence_scan": 5,
                "recyclable_bonus": 5,
                "organic_bonus": 3,
                "hazardous_bonus": 5
            },
            "message": (
                "Start scanning waste to earn Eco Points "
                "and unlock achievements!"
            )
        }

    # --------------------------------------------------------
    # Eco Points
    #
    # Rules are calculated here in the backend so the UI
    # reflects actual application behaviour.
    # --------------------------------------------------------

    eco_points = 0

    for scan in scans:

        # Base points for completing a scan.
        if scan.review_required:
            eco_points += 5
        else:
            eco_points += 10

            # Category bonus for a high-confidence result.
            if scan.category == "Recyclable":
                eco_points += 5

            elif scan.category == "Organic":
                eco_points += 3

            elif scan.category == "Hazardous":
                eco_points += 5

    # --------------------------------------------------------
    # Level system
    # --------------------------------------------------------

    level_definitions = [
        ("Eco Beginner", 0),
        ("Eco Explorer", 100),
        ("Eco Champion", 250),
        ("Eco Legend", 500),
    ]

    level = "Eco Beginner"
    next_level = None
    next_level_points = None

    for index, (level_name, required_points) in enumerate(
        level_definitions
    ):

        if eco_points >= required_points:
            level = level_name

            if index + 1 < len(level_definitions):
                next_level = level_definitions[index + 1][0]
                next_level_points = level_definitions[index + 1][1]

    if next_level_points is not None:

        points_to_next_level = max(
            next_level_points - eco_points,
            0
        )

        previous_level_points = 0

        for level_name, required_points in level_definitions:
            if level_name == level:
                previous_level_points = required_points
                break

        level_range = max(
            next_level_points - previous_level_points,
            1
        )

        progress_percentage = min(
            100,
            max(
                0,
                (
                    (eco_points - previous_level_points)
                    / level_range
                ) * 100
            )
        )

    else:

        points_to_next_level = 0
        progress_percentage = 100

    # --------------------------------------------------------
    # Badges
    # --------------------------------------------------------

    badges = []

    if total_scans >= 1:
        badges.append("First Scan")

    if total_scans >= 5:
        badges.append("Waste Watcher")

    if total_scans >= 10:
        badges.append("Sorting Pro")

    if total_scans >= 25:
        badges.append("Eco Hero")

    recyclable_scans = sum(
        1
        for scan in scans
        if scan.category == "Recyclable"
    )

    if recyclable_scans >= 5:
        badges.append("Recycling Champion")

    organic_scans = sum(
        1
        for scan in scans
        if scan.category == "Organic"
    )

    if organic_scans >= 5:
        badges.append("Compost Champion")

    hazardous_scans = sum(
        1
        for scan in scans
        if scan.category == "Hazardous"
    )

    if hazardous_scans >= 5:
        badges.append("Hazard Safety Champion")

    # --------------------------------------------------------
    # Current streak
    #
    # MVP definition: consecutive scan activity, capped at 7.
    # This is intentionally not presented as calendar-day streak.
    # --------------------------------------------------------

    current_streak = min(
        total_scans,
        7
    )

    # --------------------------------------------------------
    # Return gamification
    # --------------------------------------------------------

    return {
        "success": True,

        # Keep both names for frontend compatibility.
        "eco_points": eco_points,
        "points": eco_points,

        "level": level,

        "badges": badges,

        "current_streak": current_streak,

        "total_scans": total_scans,

        "next_level": next_level,

        "next_level_points": next_level_points,

        "points_to_next_level": points_to_next_level,

        "progress_percentage": round(
            progress_percentage,
            2
        ),

        "point_rules": {
            "high_confidence_scan": 10,
            "low_confidence_scan": 5,
            "recyclable_bonus": 5,
            "organic_bonus": 3,
            "hazardous_bonus": 5
        },

        "badge_rules": {
            "First Scan": "1 total scan",
            "Waste Watcher": "5 total scans",
            "Sorting Pro": "10 total scans",
            "Eco Hero": "25 total scans",
            "Recycling Champion": "5 recyclable scans",
            "Compost Champion": "5 organic scans",
            "Hazard Safety Champion": "5 hazardous scans"
        },

        "message": (
            "Keep scanning, verify uncertain items, "
            "and follow the recommended disposal guidance "
            "to earn more Eco Points and badges."
        ),

        "note": (
            "Gamification metrics are designed to encourage "
            "consistent waste-sorting activity. The current "
            "streak is an MVP scan-based streak, not a "
            "calendar-day streak."
        )
    }

