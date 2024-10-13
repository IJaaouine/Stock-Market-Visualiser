import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './App.css';

function App() {
  // State variables to manage stock selection, time frame, data, layout, prediction model, and so on 
  const [stock, setStock] = useState('AAPL');
  const [timeFrame, setTimeFrame] = useState('1mo');
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [chartType, setChartType] = useState('candlestick');
  const [model, setModel] = useState('polynomial');
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  // Fetch stock data when stock symbol, time frame, model type, or chart type changes from the backend 
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        console.log(`Fetching stock data for: ${stock}, ${timeFrame}`);
        let interval = '1d'; // Default to 1-day interval
        if (timeFrame === '5y') interval = '1mo';
        else if (timeFrame === '2y') interval = '5d';

        const response = await axios.get('http://127.0.0.1:5001/stock-data', {
          params: { symbol: stock, period: timeFrame, interval: interval },
        });

        if (response.status === 200 && response.data) {
          console.log('Stock data fetched successfully:', response.data);
          const stockData = response.data;

          // Prepare the trace for the chart
          let trace;
          if (chartType === 'candlestick') {
            trace = {
              x: stockData.dates,
              open: stockData.open_prices,
              high: stockData.high_prices,
              low: stockData.low_prices,
              close: stockData.closing_prices,
              type: 'candlestick',
              name: `${stock} Stock Data`,
            };
          } else {
            trace = {
              x: stockData.dates,
              y: stockData.closing_prices,
              type: 'scatter',
              mode: chartType === 'line' ? 'lines' : 'lines',
              fill: chartType === 'mountain' ? 'tozeroy' : undefined,
              name: `${stock} Stock Data`,
            };
          }

          setData([trace]);
          setError(null);
          setLayout({
            title: `${stock} Stock Price`,
            paper_bgcolor: '#181818',
            plot_bgcolor: '#181818',
            font: { color: '#FFFFFF' },
            xaxis: { title: 'Date', rangeslider: { visible: true } },
            yaxis: { title: 'Price (USD)' },
            autosize: true,
          });
        } else {
          throw new Error('Failed to fetch stock data');
        }
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to fetch stock data. Please try again later.');
      }
    };

    fetchStockData();
  }, [stock, timeFrame, chartType]);

  // Get predictions from the backend based on selected model type
  useEffect(() => {
    if (!showPredictions || data.length === 0) {
      setPredictions([]);
      return;
    }

    const getPredictions = async () => {
      try {
        let closingPrices;
        if (chartType === 'candlestick') {
          closingPrices = data[0]?.close || []; // Use closing prices for candlestick chart
        } else {
          closingPrices = data[0]?.y || [];
        }
        console.log('Closing Prices for Predictions:', closingPrices);


        if (closingPrices.length === 0) {
          setError('No data available to make predictions.');
          return;
        }

        let futureDays;
        if (timeFrame === '2y') {
          futureDays = 365; // Predict 1 year for 2 years
        } else if (timeFrame === '5y') {
          futureDays = 730; // Predict 2 years for 5 years
        } else {
          futureDays = Math.floor(closingPrices.length / 2);
        }
        
        // API call to the backend for predictions 
        const response = await axios.post('http://127.0.0.1:5001/predict', {
          closing_prices: closingPrices,
          model: model,
          future_days: futureDays,
        });

        if (response.status === 200 && response.data) {
          console.log('Predictions fetched successfully:', response.data);
          const futureDates = Array.from({ length: futureDays }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i + 1); // Add +1 to start from tomorrow
            return date.toISOString().split('T')[0];
          });

          const predictionTrace = {
            x: futureDates,
            y: response.data.predictions.map(value => Math.max(value, 0)), // Remove negative predictions
            type: 'scatter',
            mode: 'lines',
            line: { dash: 'dash', color: 'red', width: 1 },
            name: 'Prediction',
          };
          setPredictions([predictionTrace]);
          setError(null);
        } else {
          throw new Error('Failed to fetch predictions');
        }
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setError('Failed to fetch predictions. Please try again later.');
      }
    };

    // automatically update predictions when selected options change 
    getPredictions();
  }, [data, model, showPredictions, chartType, stock, timeFrame]);


  // Update current time and day for display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDay(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <header className="header">
        <div className="card">
          <div className="time-text">{currentTime}</div>
          <div className="day-text">{currentDay}</div>
        </div>
        <h1>Stock Market Visualiser</h1>
      </header>
      <Plot
        data={data.concat(predictions)}
        layout={{ ...layout, autosize: true, responsive: true }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
      <div className="controls">
        {/* Show Predictions Checkbox */}
        <div className="checkbox-wrapper">
          <label>
            <input
              type="checkbox"
              checked={showPredictions}
              onChange={() => setShowPredictions(!showPredictions)}
            />
            Show Predictions
          </label>
        </div>
        {/* Stock Selector */}
        <div className="select">
          <div className="selected">
            <span>{stock}</span>
            <svg className="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z"></path>
            </svg>
          </div>
          <div className="options">
            <div className="option" onClick={() => setStock('AAPL')}>Apple - AAPL</div>
            <div className="option" onClick={() => setStock('GOOGL')}>Google - GOOGL</div>
            <div className="option" onClick={() => setStock('AMZN')}>Amazon - AMZN</div>
            <div className="option" onClick={() => setStock('TSLA')}>Tesla - TSLA</div>
            <div className="option" onClick={() => setStock('NFLX')}>Netflix - NFLX</div>
            <div className="option" onClick={() => setStock('MSFT')}>Microsoft - MSFT</div>
            <div className="option" onClick={() => setStock('NVDA')}>NVIDIA - NVDA</div>
          </div>
        </div>
        {/* Model Selector */}
        <div className="select">
          <div className="selected">
            <span>{model.charAt(0).toUpperCase() + model.slice(1)} Regression</span>
            <svg className="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z"></path>
            </svg>
          </div>
          <div className="options">
            <div className="option" onClick={() => setModel('svr')}>SVR</div>
            <div className="option" onClick={() => setModel('random_forest')}>Random Forest Regression</div>
            <div className="option" onClick={() => setModel('decision_tree')}>Decision Tree Regression</div>
            <div className="option" onClick={() => setModel('ridge')}>Ridge Rgiiegression</div>
          </div>
        </div>
        {/* Time Frame Selector */}
        <div className="select">
          <div className="selected">
            <span>{timeFrame}</span>
            <svg className="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z"></path>
            </svg>
          </div>
          <div className="options">
            <div className="option" onClick={() => setTimeFrame('1mo')}>1 Month</div>
            <div className="option" onClick={() => setTimeFrame('3mo')}>3 Months</div>
            <div className="option" onClick={() => setTimeFrame('6mo')}>6 Months</div>
            <div className="option" onClick={() => setTimeFrame('1y')}>1 Year</div>
            <div className="option" onClick={() => setTimeFrame('2y')}>2 Years</div>
            <div className="option" onClick={() => setTimeFrame('5y')}>5 Years</div>
          </div>
        </div>
        {/* Chart Type Selector */}
        <div className="select">
          <div className="selected">
            <span>{chartType.charAt(0).toUpperCase() + chartType.slice(1)}</span>
            <svg className="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z"></path>
            </svg>
          </div>
          <div className="options">
            <div className="option" onClick={() => setChartType('line')}>Line</div>
            <div className="option" onClick={() => setChartType('mountain')}>Mountain</div>
            <div className="option" onClick={() => setChartType('candlestick')}>Candlestick</div>
          </div>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default App;