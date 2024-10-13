from flask import Flask, request, jsonify
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
import numpy as np
from flask_cors import CORS
import yfinance as yf 

app = Flask(__name__)
CORS(app)

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
    
@app.route('/predict', methods=['POST'])
def get_predictions():
    try:
        # Extract data from the request
        data = request.get_json()
        closing_prices = data.get('closing_prices')
        model_type = data.get('model').lower()
        future_days = data.get('future_days')

        # Validate inputs
        if not closing_prices or model_type not in ['linear', 'polynomial'] or not future_days:
            return jsonify({'error': 'Invalid or missing parameters'}), 400

        # Convert closing prices to a numpy array and reshape for scikit-learn
        closing_prices = np.array(closing_prices).reshape(-1, 1)
        days = np.array(range(len(closing_prices))).reshape(-1, 1)

        # Prepare model based on model type
        if model_type == 'linear':
            model = LinearRegression()
            model.fit(days, closing_prices)
        elif model_type == 'polynomial':
            # Fit a Polynomial Regression model (degree 2 as default)
            poly = PolynomialFeatures(degree=2)  # Adjust degree if needed
            days_poly = poly.fit_transform(days)
            model = LinearRegression()
            model.fit(days_poly, closing_prices)

        # Predict future days
        future_days_array = np.array(range(len(closing_prices), len(closing_prices) + future_days)).reshape(-1, 1)
        if model_type == 'linear':
            predictions = model.predict(future_days_array).flatten().tolist()
        elif model_type == 'polynomial':
            future_days_poly = poly.transform(future_days_array)
            predictions = model.predict(future_days_poly).flatten().tolist()

        return jsonify({'predictions': predictions})
    
    except Exception as e:
        # Log the error for debugging
        print(f"Error occurred while predicting: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

