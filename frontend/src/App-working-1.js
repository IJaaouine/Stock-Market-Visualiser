import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './App.css';

function App() {
  const [stock, setStock] = useState('AAPL');
  const [timeFrame, setTimeFrame] = useState('1mo');
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [chartType, setChartType] = useState('candlestick');
  const [model, setModel] = useState('linear');
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      console.log(`Fetching stock data for: ${stock}, ${timeFrame}`);
      let interval = '1d';  // Default to 1-day interval
      if (timeFrame === '5y') interval = '1mo';
      else if (timeFrame === '2y') interval = '5d';
  
      // Use the complete URL to ensure the frontend hits the backend correctly
      const response = await axios.get('http://127.0.0.1:5001/stock-data', {
        params: { symbol: stock, period: timeFrame, interval: interval },
      });
  
      if (response.status === 200 && response.data) {
        console.log('Stock data fetched successfully:', response.data);
        const stockData = response.data;
  
        // Prepare the trace for the chart based on chart type
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
  
        // Update the state to display the stock data
        setData([trace]);
        setLayout({
          title: `${stock} Stock Price`,
          paper_bgcolor: '#181818',
          plot_bgcolor: '#181818',
          font: { color: '#FFFFFF' },
          xaxis: { title: 'Date', rangeslider: { visible: true } },
          yaxis: { title: 'Price (USD)' },
          autosize: true,
          width: window.innerWidth * 0.9,
          height: 600,
        });
        setError(null);
      } else {
        throw new Error('Failed to fetch stock data');
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data. Please try again later.');
    }
  };
  

  // Get predictions from backend
  const getPredictions = async () => {
    try {
      console.log('Data before making predictions:', data);
  
      const closingPrices = data[0]?.y || [];
      if (closingPrices.length === 0) {
        setError('No data available to make predictions.');
        return;
      }
  
      console.log('Closing Prices for Predictions:', closingPrices);
  
      const futureDays = timeFrame === '1mo' ? 15 : timeFrame === '3mo' ? 45 : 30;
  
      const response = await axios.post('http://127.0.0.1:5001/predict', {
        closing_prices: closingPrices,
        model: model,
        future_days: futureDays,
      });
  
      if (response.status === 200 && response.data) {
        console.log('Predictions fetched successfully:', response.data);
  
        const futureDates = Array.from({ length: futureDays }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i + 1);  // Add +1 to start from tomorrow
          return date.toISOString().split('T')[0];
        });
  
        const predictionTrace = {
          x: futureDates,
          y: response.data.predictions,
          type: 'scatter',
          mode: 'lines',
          line: { dash: 'dash', color: 'red' },
          name: 'Predicted Prices',
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
  

  useEffect(() => {
    fetchStockData();
  }, [stock, timeFrame, chartType]);

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
        <h1>Stock Market Visualizer</h1>
      </header>
      <Plot data={data.concat(predictions)} layout={layout} />
      <div className="button-wrapper">
        <div className="button-container">
          <button className="sparkle-button" onClick={getPredictions}>Get Predictions</button>
        </div>
      </div>
      <div className="controls">
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
        <div className="select">
          <div className="selected">
            <span>{stock}</span>
            <svg className="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z"></path>
            </svg>
          </div>
          <div className="options">
            <div className="option" onClick={() => setStock('AAPL')}>Apple (AAPL)</div>
            <div className="option" onClick={() => setStock('GOOGL')}>Google (GOOGL)</div>
            <div className="option" onClick={() => setStock('AMZN')}>Amazon (AMZN)</div>
            <div className="option" onClick={() => setStock('TSLA')}>Tesla (TSLA)</div>
            <div className="option" onClick={() => setStock('NFLX')}>Netflix (NFLX)</div>
          </div>
        </div>
        <div className="select">
          <div className="selected">
            <span>{model}</span>
            <svg className="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z"></path>
            </svg>
          </div>
          <div className="options">
            <div className="option" onClick={() => setModel('linear')}>Linear Regression</div>
            <div className="option" onClick={() => setModel('polynomial')}>Polynomial Regression</div>
          </div>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default App;