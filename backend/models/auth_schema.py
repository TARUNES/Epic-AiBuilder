from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    role: str = Field(..., description="Target role: 'PHARMACY' or 'MUNICIPAL'")
    identifier: str = Field(..., description="Facility ID or Department Officer ID")
    password: str = Field(..., description="Access password")

class UserProfile(BaseModel):
    user_id: str
    name: str
    role: str # "PHARMACY" or "MUNICIPAL"
    title: str
    organization: str
    facility_id: Optional[str] = None
    facility_name: Optional[str] = None
    license_number: Optional[str] = None
    ward_id: str = "WARD_14"

class LoginResponse(BaseModel):
    token: str
    role: str
    user: UserProfile
    message: str = "Authentication successful."
