import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import User
from models.post import Post, Comment, Like
from models.profile import UserProfile
from models import db

# SQLite and MySQL connection URIs
SQLITE_URI = 'sqlite:///instance/prok_app.db'
MYSQL_URI = 'mysql://prok_user:ProkApp2024!%40%23@localhost/prok_app'

# Create engines
sqlite_engine = create_engine(SQLITE_URI)
mysql_engine = create_engine(MYSQL_URI)

# Create sessions
SQLiteSession = sessionmaker(bind=sqlite_engine)
MySQLSession = sessionmaker(bind=mysql_engine)
sqlite_session = SQLiteSession()
mysql_session = MySQLSession()

def migrate_table(Model):
    print(f'Migrating {Model.__tablename__}...')
    records = sqlite_session.query(Model).all()
    for record in records:
        # Detach from SQLite session
        sqlite_session.expunge(record)
        db.make_transient(record)
        mysql_session.merge(record)
    mysql_session.commit()
    print(f'  Migrated {len(records)} records.')

def main():
    # Order matters due to foreign keys
    migrate_table(User)
    migrate_table(UserProfile)
    migrate_table(Post)
    migrate_table(Comment)
    migrate_table(Like)
    print('✅ Data migration complete!')

if __name__ == '__main__':
    main() 