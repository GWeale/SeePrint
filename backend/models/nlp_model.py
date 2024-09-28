import tensorflow as tf
from tensorflow.keras.models import load_model as keras_load_model
import numpy as np
import pandas as pd

def load_model():
    model = keras_load_model('models/store_optimizer.h5')
    return model

def optimize_store(model, data):
    processed_data = preprocess_data(data)
    predictions = model.predict(processed_data)
    optimization = postprocess_predictions(predictions, data)
    return optimization

def preprocess_data(data):
    # Complex data preprocessing steps
    df = pd.DataFrame(data)
    df = df.fillna(0)
    df_encoded = pd.get_dummies(df, columns=['category', 'placement'])
    return df_encoded.values

def postprocess_predictions(predictions, data):
    optimization = {}
    for i, pred in enumerate(predictions):
        item = data.iloc[i]
        optimization[item['name']] = {
            'new_placement': decode_prediction(pred[0]),
            'new_restock_level': pred[1]
        }
    return optimization

def decode_prediction(pred):
    # Decode placement from prediction
    placements = ['Aisle 1', 'Aisle 2', 'Aisle 3', 'Endcap', 'Checkout']
    return placements[int(np.argmax(pred))]
