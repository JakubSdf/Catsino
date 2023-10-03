# importing Flask and other modules
import os
from flask import Flask, request, render_template

app = Flask(__name__)
@app.route('/')
def home():
    return render_template('main.html')

@app.route('/ruleta')
def ruleta():
    return render_template('ruleta.html')


@app.route('/crash')
def crash():
    return render_template('crash.html')


@app.route('/blackjack')
def blackjack():
    return render_template('blackjack.html')


@app.route('/maty')
def maty():
    return render_template('maty.html')


if __name__ == "__main__":
    app.run(port=8000)

