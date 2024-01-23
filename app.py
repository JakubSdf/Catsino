from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask import session

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    money = db.Column(db.Integer, default=1500) 

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

app.secret_key = '1234'  # Set a secret key for session management

@app.route('/')

@app.route('/login', methods=['GET', 'POST'])
def login():
    session.pop('username', "")
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user is None or not user.check_password(password):
            error = 'Invalid Credentials. Please try again.'
        else:
            session['username'] = username
            return redirect(url_for('home'))
    
    return render_template('login.html', error=error)


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        user = User.query.filter_by(username=username).first()
        if user:
            return render_template('register.html', error='Username already exists')

        if password != confirm_password:
            return render_template('register.html', error='Passwords do not match')

        new_user = User(username=username, money=1500)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))
    
    return render_template('register.html')


@app.route('/home')
def home():
    return render_template('main.html')

@app.route('/roulette')
def ruleta():
    return render_template('roulette.html')


@app.route('/crash')
def crash():
    return render_template('crash.html')


@app.route('/blackjack')
def blackjack():
    return render_template('blackjack.html')


@app.route('/slots')
def maty():
    return render_template('slots.html')

@app.route('/games')
def games():
    return render_template('games.html')


@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/logout')
def logout():
    session.pop('username', "")
    return redirect(url_for('login'))

@app.context_processor
def inject_username():
    username = session.get('username', "")
    if username:
        user = User.query.filter_by(username=username).first()
        if user:
            money = user.money
        else:
            money = ""
    else:
        money = ""

    print(f"Money for user {username}: {money}") 
    return dict(username=username, money=money)



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        db.session.commit()
    app.run()


