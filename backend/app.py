from flask import Flask, jsonify
from flask_cors import CORS
from word_hunt import WordHunt

wr = WordHunt()
app = Flask(__name__)
CORS(app) # Allows the frontend to talk to the backend

@app.route('/generate', methods=['GET'])
def generate():
    grid, words = wr.run()
    return jsonify({"board": grid, "words": words})

if __name__ == '__main__':
    app.run(port=5000, debug=True)