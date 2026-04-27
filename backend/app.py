from flask import Flask, jsonify, redirect, render_template, request
from flask_cors import CORS
from .word_hunt import WordHunt

wr = WordHunt()
app = Flask(__name__, static_folder='../frontend/assets', template_folder='../frontend')
CORS(app) # Allows the frontend to talk to the backend

@app.route('/generate', methods=['GET'])
def generate():
    difficulty = request.args.get('difficulty', 'medium')
    theme = request.args.get('theme', 'random')
    grid, words, hints, cols, rows = wr.run(difficulty, theme)
    return jsonify({"board": grid, "words": words, "hints": hints, "width": cols, "height": rows})

@app.route('/wordhunt', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/', methods=['GET'])
def root():
    return redirect('/wordhunt')
