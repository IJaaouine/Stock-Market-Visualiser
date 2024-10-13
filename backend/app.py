from flask import Flask, request, jsonify
from sklearn.linear_model import Ridge, Lasso
from sklearn.svm import SVR  # Import Support Vector Regression
from sklearn.ensemble import RandomForestRegressor  # Import Random Forest Regressor
from sklearn.tree import DecisionTreeRegressor  # Import Decision Tree Regressor
import numpy as np
from flask_cors import CORS
import yfinance as yf 

# Initialise the Flask application and enable CORS for cross-origin requests
app = Flask(__name__)
CORS(app)

# Route to fetch historical stock data from Yahoo Finance 
@app.route('/stock-data', methods=['GET'])
def get_stock_data():
    try:
        # Extract query parameters from the request
        symbol = request.args.get('symbol')
        period = request.args.get('period')
        interval = request.args.get('interval')

        # Validate the presence of all required parameters
        if not symbol or not period or not interval:
            return jsonify({'error': 'Missing required parameters'}), 400

        # Fetch the stock data using yfinance
        stock = yf.Ticker(symbol)
        history = stock.history(period=period, interval=interval)

        # Check if any data is returned
        if history.empty:
            return jsonify({'error': 'No data found for the given stock symbol and period'}), 404

        # Format the data to be returned to the frontend
        data = {
            'dates': history.index.strftime('%Y-%m-%d').tolist(),
            'open_prices': history['Open'].tolist(),
            'high_prices': history['High'].tolist(),
            'low_prices': history['Low'].tolist(),
            'closing_prices': history['Close'].tolist()
        }
        return jsonify(data)

    except Exception as e:
        # Log the error for debugging and return a meaningful error response
        print(f"Error occurred while fetching stock data: {e}")
        return jsonify({'error': str(e)}), 500
    
# Route to get predictions based on historical stock data
@app.route('/predict', methods=['POST'])
def get_predictions():
    try:
        # Extract data from the request
        data = request.get_json()
        closing_prices = data.get('closing_prices')
        model_type = data.get('model').lower()
        future_days = min(data.get('future_days'), 183)  # Limit future predictions to half a year (183 days)

        # Validate inputs
        if not closing_prices or len(closing_prices) < 5 or len(closing_prices) > 365 or model_type not in ['svr', 'random_forest', 'decision_tree', 'ridge'] or not future_days:
            return jsonify({'error': 'Invalid or missing parameters, or not enough data for training, or dataset exceeds 365 days'}), 400

        # Convert closing prices to a numpy array and reshape for scikit-learn
        closing_prices = np.array(closing_prices).reshape(-1, 1)
        days = np.array(range(len(closing_prices))).reshape(-1, 1)

        # Prepare model based on model type
        model = None

        if model_type == 'svr':
            # Support Vector Regressor (SVR)
            model = SVR(kernel='rbf', C=100, gamma=0.1, epsilon=0.1)
            model.fit(days, closing_prices.flatten())

        elif model_type == 'random_forest':
            # Random Forest Regressor
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(days, closing_prices.flatten())

        elif model_type == 'decision_tree':
            # Decision Tree Regressor
            model = DecisionTreeRegressor(random_state=42)
            model.fit(days, closing_prices.flatten())

        elif model_type == 'ridge':
            # Ridge Regression
            model = Ridge(alpha=1.0)
            model.fit(days, closing_prices)

        # Predict future days
        future_days_array = np.array(range(len(closing_prices), len(closing_prices) + future_days)).reshape(-1, 1)
        predictions = model.predict(future_days_array).flatten().tolist()

        # Ensure no negative predictions are returned (as prices cannot be negative)
        predictions = [max(0, p) for p in predictions]

        return jsonify({'predictions': predictions})

    except Exception as e:
        # Log the error for debugging
        print(f"Error occurred while predicting: {e}")
        return jsonify({'error': str(e)}), 500

# Run the Flask app on localhost with port 5001 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)