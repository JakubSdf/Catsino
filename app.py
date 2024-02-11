from flask import Flask, jsonify, render_template, request, redirect, url_for
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

@app.route('/get_balance')
def get_balance():
    if 'username' not in session:
        return jsonify({'error': 'User not logged in'}), 403
    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'balance': round(user.money, 1)})


@app.route('/home')
def home():
    return render_template('main.html')

@app.route('/roulette')
def ruleta():
    return render_template('roulette.html')



@app.route('/bet/roulette', methods=['POST'])
def roulette_bet():
    # Assuming session management and user identification are handled
    username = session.get('username')
    if not username:
        return jsonify({'error': 'User not logged in'}), 403

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()  # Get the JSON data sent with the request
    bets = data.get('bets')
    clear = data.get('clear')

    if clear:
        for bet in bets:
            user.money += float(bet['amount'])

    done_spin = data.get('done_spin')
    if not done_spin and not clear:
        bet_amount = data.get('bet_amount')
        user.money -= float(bet_amount)
        bet_amount = 0
    
    if done_spin:
        complete_winnings = 0
        winnings = data.get('winnings')
        if int(winnings) > 0:
            complete_winnings += winnings
        user.money += complete_winnings  # Update the user's balance with winnings
            
    # Save changes to the database
    db.session.commit()

    # Return the result and the new balance
    return jsonify({'success': True, 'new_balance': user.money})


@app.route('/crash')
def crash():
    return render_template('crash.html')

@app.route('/bet/crash', methods=['POST'])
def crash_bet():
    if 'username' not in session:
        return jsonify({'error': 'User not logged in'}), 403

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    action = request.form.get('action')
    bet_amount = request.form.get('bet_amount', type=int)

    if bet_amount is None or bet_amount <= 0:
        return jsonify({'error': 'Invalid bet amount'}), 400

    if action == 'place_bet':
        # Check if user has enough money to place the bet
        if user.money < bet_amount:
            return jsonify({'error': 'Insufficient funds'}), 400

        # Deduct the bet amount from the user's balance
        user.money -= bet_amount
        user.money = round(user.money, 1)
        db.session.commit()

        # Here you could start the game logic or simply return success
        # Since this is an example, we're directly returning success
        return jsonify({'success': True, 'message': 'Bet placed', 'new_balance': user.money})

    elif action == 'cash_out':
        multiplier = request.form.get('multiplier', type=float)
        if not multiplier or multiplier <= 0:
            return jsonify({'error': 'Invalid multiplier value'}), 400

        # Calculate winnings based on the multiplier
        # Assuming the bet was already deducted when placed, we add winnings only
        winnings = bet_amount * multiplier
        user.money += winnings  # Update user's balance with winnings
        user.money = round(user.money, 1)
        
        db.session.commit()

        return jsonify({'success': True, 'message': 'Cashed out successfully', 'new_balance': user.money})

    else:
        return jsonify({'error': 'Invalid action'}), 400
    
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

    return dict(username=username, money=(money))



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        db.session.commit()
    app.run()


