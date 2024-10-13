from flask import Flask

app = Flask(__name__)

@app.route('/test', methods=['GET'])
def test():
    return "Flask is working!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
