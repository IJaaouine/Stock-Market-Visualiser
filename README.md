# Stock Market Visualiser

## Overview

**Stock Market Visualiser** is a React-based web application that allows users to visualise stock price data over different time frames and make future price predictions using various machine learning models. The app provides an interactive interface for analysing historical stock prices and beginning to generate predictions.

## Features

- **Stock Selection**: Choose from multiple stocks including Apple, Google, Amazon, Meta, and Microsoft.
- **Chart Types**: Visualise data in different formats, including line, mountain, and candlestick charts.
- **Time Frame Selection**: Analyse stock data over different time frames such as 1 month, 6 months, 1 year, 2 years, and 5 years.
- **Model Selection**: Generate predictions using machine learning models: Support Vector Regression (SVR) and Ridge Regression.
- **Live Date & Time Display**: Shows the current date and time for a user-friendly interface.
- **Responsive UI**: The plot automatically resizes to fit the user's window.

## Tech Stack

- **Frontend**: React, Plotly.js for data visualisation, Axios for API calls.
- **Backend**: Flask, Scikit-learn for machine learning models, yFinance for fetching stock data.

## Setup Instructions

### Prerequisites

- **Node.js** (for running the React frontend)
- **Python 3** (for running the Flask backend)

### Backend Setup

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install the required Python packages:
   ```sh
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```sh
   python app.py
   ```
   The backend will run on `http://127.0.0.1:5001`.

### Frontend Setup

1. Navigate to the frontend folder:
   ```sh
   cd ../frontend
   ```
2. Install the required Node.js packages:
   ```sh
   npm install
   ```
3. Start the React application:
   ```sh
   npm start
   ```
   The frontend will run on `http://localhost:3000`.

## Usage

1. Open the application in your browser at `http://localhost:3000`.
2. Select the desired stock from the dropdown menu.
3. Choose the chart type, time frame, and model for predictions.
4. Toggle the "Show Predictions" button to see the predicted stock prices for the chosen period.

## Machine Learning Models

The app uses two machine learning models to predict future stock prices:

- **Support Vector Regression (SVR)**
- **Ridge Regression**

Each model analyses the closing prices of the selected stock to predict future price movements for half of the selected time frame.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```sh
   git checkout -b feature-branch-name
   ```
3. Commit your changes:
   ```sh
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```sh
   git push origin feature-branch-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE] file for details.

Copyright - 2024 akshat-patel28 (Akshat Patel) - Time and Date UI Design CSS 
Copyright - 2024 gharsh11032000 (Harsh Gupta) - Dropdown Menu UI Design CSS 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Acknowledgements

- **yFinance** for providing easy access to historical stock data.
- **Scikit-learn** for powerful machine learning tools.
- **React & Plotly.js** for building interactive and dynamic UI components.
