from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import time
import os

app = Flask(__name__)
CORS(app)

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'announcements.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

import requests

# Announcement Model
class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    body = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'timestamp': self.timestamp
        }

# Push Token Model
class PushToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(255), unique=True, nullable=False)

# Initialize database
with app.app_context():
    db.create_all()

def send_push_notifications(title, body, announcement_id=None):
    tokens = [t.token for t in PushToken.query.all()]
    if not tokens:
        return

    announcement_id_str = str(announcement_id) if announcement_id else None

    messages = []
    for token in tokens:
        messages.append({
            'to': token,
            'sound': 'default',
            'title': title,
            'body': body,
            'data': {'title': title, 'body': body, 'id': announcement_id_str},
            'channelId': 'default',
        })

    try:
        response = requests.post(
            'https://exp.host/--/api/v2/push/send',
            json=messages,
            headers={'Content-Type': 'application/json'}
        )
        return response.json()
    except Exception as e:
        print(f"Error sending push notifications: {e}")

@app.route('/announcements', methods=['GET'])
def get_announcements():
    announcements = Announcement.query.order_by(Announcement.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in announcements])

@app.route('/announcements', methods=['POST'])
def add_announcement():
    data = request.json
    title = data.get('title')
    body = data.get('body')
    timestamp = int(time.time() * 1000)
    
    if not title or not body:
        return jsonify({'error': 'Missing title or body'}), 400
        
    new_announcement = Announcement(
        title=title,
        body=body,
        timestamp=timestamp
    )
    
    db.session.add(new_announcement)
    db.session.commit()
    
    # Send push notifications to all registered devices
    # Pass the ID of the new announcement
    send_push_notifications(title, body, new_announcement.id)
    
    return jsonify(new_announcement.to_dict()), 201

@app.route('/register-token', methods=['POST'])
def register_token():
    token = request.json.get('token')
    if not token:
        return jsonify({'error': 'Token is required'}), 400
        
    existing = PushToken.query.filter_by(token=token).first()
    if not existing:
        new_token = PushToken(token=token)
        db.session.add(new_token)
        db.session.commit()
        
    return jsonify({'message': 'Token registered successfully'}), 200

@app.route('/unregister-token', methods=['POST'])
def unregister_token():
    token = request.json.get('token')
    if not token:
        return jsonify({'error': 'Token is required'}), 400
        
    existing = PushToken.query.filter_by(token=token).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        
    return jsonify({'message': 'Token unregistered successfully'}), 200

@app.route('/announcements', methods=['DELETE'])
def clear_announcements():
    try:
        db.session.query(Announcement).delete()
        db.session.commit()
        return jsonify({'message': 'All announcements cleared'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
