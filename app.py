from flask import Flask, request, render_template

app = Flask(__name__)
@app.route('/')
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

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/about')
def about():
    return render_template('about.html')


if __name__ == "__main__":
    app.run()


