from flask import Flask, jsonify, redirect, render_template
from flask_cors import CORS
from .word_hunt import WordHunt

wr = WordHunt()
app = Flask(__name__, static_folder='../frontend/assets', template_folder='../frontend')
CORS(app) # Allows the frontend to talk to the backend

@app.route('/generate', methods=['GET'])
def generate():
    grid, words, hints = wr.run()
    return jsonify({"board": grid, "words": words, "hints": hints})

@app.route('/wordhunt', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/', methods=['GET'])
def root():
    return redirect('/wordhunt')
