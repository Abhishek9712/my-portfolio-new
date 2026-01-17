import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Environment variables for email credentials
EMAIL_USER = os.environ.get('EMAIL_USER')
EMAIL_PASS = os.environ.get('EMAIL_PASS')
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

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
        return jsonify({'error': 'Server configuration error: Missing email credentials'}), 500

    try:
        # Create the email content
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = EMAIL_USER  # Send to yourself
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

        # Connect to SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
        server.quit()

        return jsonify({'success': 'Email sent successfully'}), 200

    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Server starting...")
    if not EMAIL_USER or not EMAIL_PASS:
        print("WARNING: EMAIL_USER or EMAIL_PASS environment variables are not set.")
    else:
        print("Email configuration found.")
        
    app.run(debug=True, port=5000)
