from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = Flask(__name__)
CORS(app)

# Environment variables
EMAIL_USER = os.environ.get('EMAIL_USER')
EMAIL_PASS = os.environ.get('EMAIL_PASS')
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587

# Debug: Catch-all to see what path is being received
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({
        'error': 'Route not found in Flask',
        'path_received': path,
        'full_path': request.path
    }), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok', 
        'email_configured': bool(EMAIL_USER and EMAIL_PASS)
    })

@app.route('/api/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')

    if not all([name, email, subject, message]):
        return jsonify({'error': 'Missing required fields'}), 400

    if not EMAIL_USER or not EMAIL_PASS:
        return jsonify({'error': 'Server configuration error'}), 500

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = EMAIL_USER
        msg['Reply-To'] = email
        msg['Subject'] = f"Portfolio Contact: {subject}"

        body = f"""
        You have received a new message from your portfolio contact form.

        Name: {name}
        Email: {email}
        Subject: {subject}

        Message:
        {message}
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
        server.quit()

        return jsonify({'success': 'Email sent successfully'}), 200

    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': str(e)}), 500

# Vercel needs the app to be available as a variable named 'app'
