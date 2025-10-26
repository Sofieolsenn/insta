from flask import Flask, render_template, request, session, redirect, url_for
from flask_session import Session
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
import x 
import time
import uuid
import os

from icecream import ic
ic.configureOutput(prefix=f'----- | ', includeContext=True)

app = Flask(__name__)

# Set the maximum file size to 10 MB
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024   # 1 MB

app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
 

##############################
##############################
##############################
def _____USER_____(): pass 
##############################
##############################
##############################

##############################
@app.get("/")
def view_index():
    return render_template("index.html")

## login
@app.post("/login")
def handle_login():
    try:
        #get the users info from the form
        user_username = request.form.get("user_username", "").strip()
        user_password = request.form.get("user_password", "").strip()

        #connect and talk to the db
        db, cursor = x.db()
        q = "SELECT * FROM users WHERE user_username = %s"
        cursor.execute(q, (user_username,))
        user = cursor.fetchone()

        #error handling
        if not user: raise Exception ("User not found", 404)
        if not check_password_hash(user["user_password"], user_password):
            raise Exception ("Invalid password", 400)

        # If OK, create session
        session["user"] = user["user_username"]
        return redirect(url_for("view_dashboard"))
    except Exception as ex:
        ic (ex)
        return "error"
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()

## logout
@app.get("/logout")
def handle_logout():
    try:
        # Clear session data
        session.clear()

        # Redirect to login (index page)
        return redirect(url_for("view_index"))
    except Exception as ex:
        ic(ex)
        return "Error logging out", 500

##############################
@app.get("/signup")
def view_signup():
    return render_template("signup.html", x=x)

##
@app.post("/signup")
def handle_signup():
    try:
        #validate the form
        user_username = x.validate_user_username()
        user_email = x.validate_user_email()
        user_password = x.validate_user_password()
        user_first_name = x.validate_user_first_name()
        user_last_name = x.validate_user_last_name()

        # user_phone = x.validate_user_phone()
        user_hashed_password = generate_password_hash(user_password)

        # user verification key / uuid
        user_verification_key = uuid.uuid4().hex

        q = "INSERT INTO users (user_username, user_email, user_password, user_first_name, user_last_name, user_verification_key) VALUES (%s, %s, %s, %s, %s, %s)"
        db, cursor = x.db()
        cursor.execute(q, (user_username, user_email, user_hashed_password, user_first_name, user_last_name, user_verification_key))
        db.commit()
        x.send_welcome_email(user_email, user_verification_key)
        return f"You have sucessfully created an account, {user_username}! Please check your mail in order to verify your account."
    except Exception as ex:
        ic(ex)
        return "error"
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()

##
@app.get("/activate/<user_verification_key>")
def handle_activate_key(user_verification_key):
    try:
        db, cursor = x.db()
        db.start_transaction()
        user_verified_at = int(time.time())

        q_update = """
        UPDATE users
        SET user_verified_at = %s, user_verification_key = ''
        WHERE user_verification_key = %s
        """

        cursor.execute(q_update, (user_verified_at, user_verification_key))
        db.commit()

        return redirect(url_for("view_activate"))
    except Exception as ex:
        ic(ex)
        return "error"
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()

###
@app.get("/activate")
def view_activate():
    try:
        return render_template("/activate.html")
    except Exception as ex:
        ic(ex)
        return "error"
    finally:
        pass

##############################
@app.get("/dashboard")
def view_dashboard():
    try:
        # Ensure user is logged in
        if "user" not in session:
            return redirect(url_for("view_index"))
        
        # Render the dashboard with user info (and maybe posts)
        return render_template("dashboard.html", user=session["user"])
    
    except Exception as ex:
        ic(ex)  # Log the error with icecream for debugging
        return "An error occurred while loading the dashboard.", 500
    
    finally:
        # Clean up database connections if used
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()

## change username 
@app.post("/change_username")
def change_username():
    try:
        #makes sure the user is logged in
        if "user" not in session:
            return redirect(url_for("view_index"))
        
        #get the new username from the form
        change_user_username = request.form.get("change_user_username", "").strip()
        if not change_user_username:
            raise Exception("username cannot be empty")

        db, cursor = x.db()
        #the q should update the users username?? somehow
        q = "UPDATE users SET user_username = %s WHERE user_username = %s"
        cursor.execute(q, (change_user_username, session["user"]))
        db.commit()

        # Update the username in the session too
        session["user"] = change_user_username

        return f"Username changed successfully to {change_user_username}!"
    except Exception as ex:
        ic(ex)
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()

## change password
@app.post("/change_password")
def change_password():
    try:
        #make sure the user is logged in
        if "user" not in session:
            return redirect(url_for("view_index"))
        
        #get the new password from the form
        change_user_password = request.form.get("change_user_password", "").strip()
        if not change_user_password: 
            return "password cannot be empty", 400
        
        #make the password hashed
        hashed_password = generate_password_hash(change_user_password)

        db, cursor = x.db()
        q = "UPDATE users SET user_password = %s WHERE user_username = %s"
        cursor.execute(q, (hashed_password, session["user"]))
        db.commit()
        
        return "password changed."
    except Exception as ex:
        ic(ex)
    finally:
        if "cursor" in locals(): cursor.close()
        if "db" in locals(): db.close()


