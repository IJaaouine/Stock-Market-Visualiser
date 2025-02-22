from flask import Flask, request, jsonify
from sklearn.linear_model import Ridge, Lasso
from sklearn.svm import SVR  # Import Support Vector Regression
from sklearn.ensemble import RandomForestRegressor  # Import Random Forest Regressor
from sklearn.tree import DecisionTreeRegressor  # Import Decision Tree Regressor
import numpy as np
from flask_cors import CORS
import yfinance as yf 
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import PolynomialFeatures

# Initialise the Flask application and enable CORS for cross-origin requests
app = Flask(__name__)
CORS(app)

# Route to fetch historical stock data from Yahoo Finance 
@app.route('/stock-data', methods=['GET'])
def get_stock_data():
    try:
        symbol = request.args.get('symbol')
        period = request.args.get('period')
        interval = request.args.get('interval')

        print(f"Received request: symbol={symbol}, period={period}, interval={interval}")

        stock = yf.Ticker(symbol)
        history = stock.history(period=period, interval=interval)

        if history.empty:
            print(f"⚠️ No data found for {symbol} with period {period} and interval {interval}")
            return jsonify({'error': f'No data found for {symbol}'}), 404

        print("✅ Data fetched successfully!")
        print(history.head())  # Print the first 5 rows to confirm data retrieval

        data = {
            'dates': history.index.strftime('%Y-%m-%d').tolist(),
            'open_prices': history['Open'].tolist(),
            'high_prices': history['High'].tolist(),
            'low_prices': history['Low'].tolist(),
            'closing_prices': history['Close'].tolist()
        }
        return jsonify(data)

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
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
            # Scale the data (Fix applied here)
            scaler = StandardScaler()
            closing_prices_scaled = scaler.fit_transform(closing_prices)

            # Support Vector Regressor (SVR) with improved hyperparameters
            model = SVR(kernel='rbf', C=1000, gamma=0.01, epsilon=0.01)
            model.fit(days, closing_prices_scaled.flatten())

            # Predict future days and inverse transform predictions
            future_days_array = np.array(range(len(closing_prices), len(closing_prices) + future_days)).reshape(-1, 1)
            predictions_scaled = model.predict(future_days_array).reshape(-1, 1)
            predictions = scaler.inverse_transform(predictions_scaled).flatten().tolist()

        elif model_type == 'ridge':
            # Ridge Regression with Polynomial Features
            poly = PolynomialFeatures(degree=3)  # Degree 3 for better flexibility
            days_poly = poly.fit_transform(days)
            
            model = Ridge(alpha=1.0)
            model.fit(days_poly, closing_prices)

            future_days_array = np.array(range(len(closing_prices), len(closing_prices) + future_days)).reshape(-1, 1)
            future_days_poly = poly.transform(future_days_array)
            
            predictions = model.predict(future_days_poly).flatten().tolist()
            
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
