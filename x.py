from flask import request, make_response, render_template
import mysql.connector
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import re 
from functools import wraps
import os

from icecream import ic
ic.configureOutput(prefix=f'----- | ', includeContext=True)

UPLOAD_ITEM_FOLDER = './images'
 
# ##############################
# def db():
#     try:
#         db = mysql.connector.connect(
#             host = "mariadb",
#             user = "root",  
#             password = "MyPasswordForYou",
#             database = "twitter"
#         )
#         cursor = db.cursor(dictionary=True)
#         return db, cursor
#     except Exception as e:
#         print(e, flush=True)
#         raise Exception("Twitter exception - Database under maintenance", 500)


##############################
def db():
    try:
        host = "sofievo.mysql.eu.pythonanywhere-services.com" if "PYTHONANYWHERE_DOMAIN" in os.environ else "mariadb"
        database = "sofievoo$default" if "PYTHONANYWHERE_DOMAIN" in os.environ else "twitter"
        user = "sofievoo" if "PYTHONANYWHERE_DOMAIN" in os.environ else "root"
        password = "MyPasswordForYou" if "PYTHONANYWHERE_DOMAIN" in os.environ else "MyPasswordForYou"

        db = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        cursor = db.cursor(dictionary=True)
        return db, cursor
    except mysql.connector.Error as e:
        print("DB connection error:", e, flush=True)
        raise Exception("Twitter exception - Database under maintenance", 500)

    

##############################
USER_USERNAME_MIN = 2
USER_USERNAME_MAX = 30
REGEX_USER_USERNAME = f"^[A-Za-z0-9_]{{{USER_USERNAME_MIN},{USER_USERNAME_MAX}}}$"
def validate_user_username():
    user_username = request.form.get("user_username", "").strip()
    if not re.match(REGEX_USER_USERNAME, user_username):
        raise Exception(f"Invalid username (must be {USER_USERNAME_MIN}-{USER_USERNAME_MAX} characters)", 400)
    return user_username


##############################
REGEX_EMAIL = "^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$"
def validate_user_email():
    user_email = request.form.get("user_email", "").strip()
    if not re.match(REGEX_EMAIL, user_email): raise Exception("Invalid email", 400)
    return user_email

##############################
USER_PASSWORD_MIN = 2
USER_PASSWORD_MAX = 50
REGEX_USER_PASSWORD = f"^.{{{USER_PASSWORD_MIN},{USER_PASSWORD_MAX}}}$"
def validate_user_password():
    user_password = request.form.get("user_password", "").strip()
    if not re.match(REGEX_USER_PASSWORD, user_password): raise Exception("Invalid password", 400)
    return user_password

##############################
USER_FIRST_NAME_MIN = 2
USER_FIRST_NAME_MAX = 20
REGEX_USER_FIRST_NAME = f"^[A-Za-z]{{{USER_FIRST_NAME_MIN},{USER_FIRST_NAME_MAX}}}$"
def validate_user_first_name():
    user_first_name = request.form.get("user_first_name", "").strip()
    if not re.match(REGEX_USER_FIRST_NAME, user_first_name):
        raise Exception(f"Invalid first name (must be {USER_FIRST_NAME_MIN}-{USER_FIRST_NAME_MAX} characters)", 400)
    return user_first_name

##############################
USER_LAST_NAME_MIN = 2 
USER_LAST_NAME_MAX = 20
REGEX_USER_LAST_NAME = f"^[A-Za-z]{{{USER_LAST_NAME_MIN},{USER_LAST_NAME_MAX}}}$"
def validate_user_last_name():
    user_last_name = request.form.get("user_last_name", "").strip()
    if not re.match(REGEX_USER_LAST_NAME, user_last_name):
        raise Exception(f"Invalid last name (must be {USER_LAST_NAME_MIN}-{USER_LAST_NAME_MAX} characters)", 400)
    return user_last_name

# ##############################
# REGEX_USER_PHONE = f"^[0-8]$"
# def validate_user_phone():
#     user_phone = request.form.get("user_phone", "").strip()
#     if not re.match(REGEX_USER_PHONE, user_phone):
#         raise Exception(f"Invalid phone number", 400)

# ##############################
## welcome email when signing up
def send_welcome_email(to_email, user_verification_key):
    try:
        # Email and password of the sender's Gmail account
        sender_email = "spfieoslen@gmail.com"
        password = "xcfs mhxl eumx lrqt"  

        # Receiver email address
        receiver_email = to_email
        
        # Create the email message
        message = MIMEMultipart()
        message["From"] = "Twitter"
        message["To"] = receiver_email
        message["Subject"] = "Congrats!"

        #verification link
        verification_link = f"http://127.0.0.1/activate/{user_verification_key}"

        # Body of the email
        body = f"""
        <h2>Welcome to Instagram! Thank you for choosing us.</h2>
        <p>In order to activate your account, <b>please click on the link below.</b></p>
        <a href="{verification_link}"><em>Click here to verify your account</em></a>
        <p>See you around!</p>
        """

        message.attach(MIMEText(body, "html"))

        # Connect to Gmail's SMTP server and send the email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Upgrade the connection to secure
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print("Email sent successfully!")

        return "email sent"
       
    except Exception as ex:
       print(ex)
    finally:
        pass