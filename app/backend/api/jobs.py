from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.job import Company, Job, JobApplication
from models import db
from models.user import User
from datetime import datetime

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/companies', methods=['POST'])
@jwt_required()
def create_company():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400     
        company = Company(
            user_id=user_id,
            name=data['name'],
            description=data.get('description'),
            website=data.get('website'),
            industry=data.get('industry'),
            company_size=data.get('company_size'),
            location=data.get('location'),
            logo=data.get('logo')
        )
        
        db.session.add(company)
        db.session.commit()
        
        return jsonify({
          'message': 'Company created successfully',
          'company': company.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}),500

@jobs_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['company_id', 'title', 'description', 'location', 'job_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400 
        # Verify user owns the company
        company = Company.query.filter_by(id=data['company_id'], user_id=user_id).first()
        if not company:
            return jsonify({'error': 'Company not found or unauthorized'}), 404    
        job = Job(
            company_id=data['company_id'],
            title=data['title'],
            description=data['description'],
            location=data['location'],
            job_type=data['job_type'],
            salary_range=data.get('salary_range')
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
          'message': 'Job created successfully',
          'job': job.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}),500

@jobs_bp.route('/jobs', methods=['GET'])
def get_jobs():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'open')
        
        query = Job.query.filter_by(status=status)
        
        # Add filters
        if request.args.get('location'):
            query = query.filter(Job.location.contains(request.args.get('location')))
        
        if request.args.get('job_type'):
            query = query.filter(Job.job_type == request.args.get('job_type'))
        
        jobs = query.order_by(Job.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
           'jobs': [job.to_dict() for job in jobs.items],
           'total': jobs.total,
           'pages': jobs.pages,
           'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}),500

@jobs_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    try:
        job = Job.query.get_or_404(job_id)
        return jsonify({
         'job': job.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}),500

@jobs_bp.route('/jobs/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_for_job(job_id):
    try:
        user_id = get_jwt_identity()
        job = Job.query.get_or_404(job_id)
        
        if job.status != 'open':
            return jsonify({'error': 'Job is not open for applications'}), 400  
        # Check if already applied
        existing_application = JobApplication.query.filter_by(
            job_id=job_id, user_id=user_id
        ).first()
        
        if existing_application:
            return jsonify({'error': 'Already applied for this job'}), 400     
        data = request.get_json()
        user = User.query.get(user_id)
        
        application = JobApplication(
            job_id=job_id,
            user_id=user_id,
            applicant_name=data.get('applicant_name', user.username),
            applicant_email=data.get('applicant_email', user.email),
            resume_link=data.get('resume_link')
        )
        
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
          'message': 'Application submitted successfully',
          'application': application.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}),500

@jobs_bp.route('/applications', methods=['GET'])
@jwt_required()
def get_user_applications():
    try:
        user_id = get_jwt_identity()
        
        applications = JobApplication.query.filter_by(user_id=user_id).order_by(
            JobApplication.created_at.desc()
        ).all()
        
        return jsonify({
         'applications': [app.to_dict() for app in applications]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 