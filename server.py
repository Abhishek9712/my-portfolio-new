from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

SENDER_EMAIL = os.getenv('SENDER_EMAIL')
GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/send-email', methods=['POST'])
def send_email():
    if not SENDER_EMAIL or not GMAIL_APP_PASSWORD:
        return jsonify({'error': 'Server configuration error: parameters missing'}), 500

    data = request.json
    name = data.get('name')
    visitor_email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')

    if not all([name, visitor_email, subject, message]):
        return jsonify({'error': 'All fields are required'}), 400

    # Create email
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = SENDER_EMAIL  # Send to yourself
    msg['Reply-To'] = visitor_email # Reply to the visitor
    msg['Subject'] = f"Portfolio Contact: {subject}"

    body = f"""
    New contact form submission from your portfolio:

    Name: {name}
    Email: {visitor_email}
    
    Message:
    {message}
    
    ---------------------------------------------------
    You can reply to this email to write back to {name}.
    """
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Connect to Gmail SMTP
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, GMAIL_APP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, SENDER_EMAIL, text)
        server.quit()
        return jsonify({'success': 'Email sent successfully!'}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
