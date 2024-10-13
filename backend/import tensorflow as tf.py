import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
print("TensorFlow Version:", tf.__version__)

# Create a simple LSTM model to check if it's recognized
model = Sequential()
model.add(LSTM(50, input_shape=(60, 1)))
model.add(Dense(1))

model.compile(optimizer='adam', loss='mean_squared_error')

print("Model compiled successfully")
