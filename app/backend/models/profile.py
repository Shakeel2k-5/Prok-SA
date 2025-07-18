from datetime import datetime
from . import db

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    headline = db.Column(db.String(200))
    company = db.Column(db.String(100))
    position = db.Column(db.String(100))
    industry = db.Column(db.String(100))
    experience_years = db.Column(db.Integer)
    education = db.Column(db.Text)
    skills = db.Column(db.Text)
    profile_picture = db.Column(db.String(255))
    cover_photo = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='profile')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'headline': self.headline,
            'company': self.company,
            'position': self.position,
            'industry': self.industry,
            'experience_years': self.experience_years,
            'education': self.education,
            'skills': self.skills,
            'profile_picture': self.profile_picture,
            'cover_photo': self.cover_photo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
