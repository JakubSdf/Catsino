from datetime import datetime
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
    transactions = db.relationship('Transaction', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    

app.secret_key = '1234'  # Set a secret key for session management

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount_changed = db.Column(db.Float, nullable=False)
    new_balance = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Transaction {self.id} - User {self.user_id} - Change {self.amount_changed}>'

def update_balance(user, amount_change):
    new_transaction = Transaction(
        user_id=user.id,
        amount_changed=amount_change,
        new_balance=user.money + amount_change  # Assuming you update user.money separately
    )
    db.session.add(new_transaction)
    user.money += amount_change  # Update the user's balance
    db.session.commit()




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

@app.route('/reset_money', methods=['POST'])
def reset_money():
    if 'username' not in session:
        return jsonify({'error': 'User not logged in'}), 403

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Set the user's money to the default amount, e.g., 1500
    user.money = 1500

    # Optionally, add a transaction record for the reset
    db.session.add(Transaction(user_id=user.id, amount_changed=1500 - user.money, new_balance=1500))

    db.session.commit()

    return jsonify({'success': True})

@app.route('/reset_history', methods=['POST'])
def clear_history():
    username = session.get('username')
    if not username:
        return jsonify({'error': 'Not logged in'}), 403

    user = User.query.filter_by(username=username).first()
    if user:
        # Example logic to delete or archive transactions
        Transaction.query.filter_by(user_id=user.id).delete()
        db.session.commit()
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'User not found'}), 404



@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/roulette')
def ruleta():
    return render_template('roulette.html')



@app.route('/bet/roulette', methods=['POST'])
def roulette_bet():
    username = session.get('username')
    if not username:
        return jsonify({'error': 'User not logged in'}), 403

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    bets = data.get('bets')
    clear = data.get('clear')

    if clear:
        for bet in bets:
            amount = float(bet['amount'])
            user.money += amount
            # Record clearing bet transaction
            db.session.add(Transaction(user_id=user.id, amount_changed=amount, new_balance=user.money))

    done_spin = data.get('done_spin')
    if not done_spin and not clear:
        bet_amount = data.get('bet_amount')
        user.money -= float(bet_amount)
        # Record placing bet transaction
        db.session.add(Transaction(user_id=user.id, amount_changed=-float(bet_amount), new_balance=user.money))
    
    if done_spin:
        winnings = data.get('winnings')
        if int(winnings) > 0:
            user.money += int(winnings)
            # Record winnings transaction
            db.session.add(Transaction(user_id=user.id, amount_changed=int(winnings), new_balance=user.money))
    
    db.session.commit()
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
    
@app.route('/refund_bet', methods=['POST'])
def refund_bet():
    if 'username' not in session:
        return jsonify({'error': 'User not logged in'}), 403

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    game_type = data.get('game_type')
    bets = data.get('bets', [])
    
    if not game_type or not bets:
        return jsonify({'error': 'Invalid request'}), 400

    total_refund_amount = sum(bet.get('amount', 0) for bet in bets if bet.get('amount', 0) > 0)

    # Update the user's balance
    if total_refund_amount > 0:
        user.money += total_refund_amount
        db.session.add(Transaction(user_id=user.id, amount_changed=total_refund_amount, new_balance=user.money))
        db.session.commit()

    return jsonify({'success': True, 'message': f'Bet refunded for {game_type}', 'new_balance': user.money})


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

@app.route('/profile')
def profile():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))
    
    user = User.query.filter_by(username=username).first()
    if user:
        transactions = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.timestamp.desc()).all()
        return render_template('profile.html', transactions=transactions)
    else:
        return redirect(url_for('login'))


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        db.session.commit()
    app.run()


