debug = False
if debug:
    STEPS = 200
    val_steps = 10
else:
    STEPS = 800
    val_steps = 100


from tensorflow.python.keras.models import load_model
import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import keras
from keras.utils.np_utils import to_categorical
from keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import LabelEncoder
import pandas as pd
from keras.metrics import top_k_categorical_accuracy
from keras.callbacks import ModelCheckpoint, LearningRateScheduler, EarlyStopping, ReduceLROnPlateau
from glob import glob
import ast
import gc
from ast import literal_eval
gc.enable()

DP_DIR = 'D:/quickdraw-doodle-recognition/shuffle-csv-50k'
NCSVS = 100
batchsize = 1000
EPOCHS = 15
STROKE_COUNT = 100
NCATS = 61




def _stack_it(raw_strokes):
    """preprocess the string and make
    a standard Nx3 stroke vector"""
    stroke_vec = literal_eval(raw_strokes) # string->list
    # unwrap the list
    in_strokes = [(xi,yi,i)
                  for i,(x,y) in enumerate(stroke_vec)
                  for xi,yi in zip(x,y)]
    c_strokes = np.stack(in_strokes)
    # replace stroke id with 1 for continue, 2 for new
    c_strokes[:,2] = [1]+np.diff(c_strokes[:,2]).tolist()
    c_strokes[:,2] += 1 # since 0 is no stroke
    # pad the strokes with zeros
    return pad_sequences(c_strokes.swapaxes(0, 1),
                         maxlen=STROKE_COUNT,
                         padding='post').swapaxes(0, 1)

def image_generator_xd( batchsize, ks):
    while True:
        for k in np.random.permutation(ks):
            filename = os.path.join(DP_DIR, 'train_k{}.csv.gz'.format(k))
            for df in pd.read_csv(filename, chunksize=batchsize):

                df['drawing'] = df['drawing'].map(_stack_it)
                x2 = np.stack(df['drawing'], 0)
                y = keras.utils.to_categorical(df.y, num_classes=NCATS)
                yield x2, y


train_datagen = image_generator_xd(batchsize=batchsize, ks=range(NCSVS - 2))
val_datagen = image_generator_xd(batchsize=batchsize, ks=range(NCSVS - 2, NCSVS))


from keras.models import Sequential
from keras.layers import BatchNormalization, Conv1D, LSTM, Dense, Dropout, Bidirectional
#if len(get_available_gpus())>0:
#    from keras.layers import CuDNNLSTM as LSTM # this one is about 3x faster on GPU instances
stroke_read_model = Sequential()
stroke_read_model.add(BatchNormalization(input_shape = (None,)+(3,)))
stroke_read_model.add(Conv1D(256, (5,), activation = 'relu'))
stroke_read_model.add(Dropout(0.2))
stroke_read_model.add(Conv1D(256, (5,), activation = 'relu'))
stroke_read_model.add(Dropout(0.2))
stroke_read_model.add(Conv1D(256, (3,), activation = 'relu'))
stroke_read_model.add(Dropout(0.2))
stroke_read_model.add(Bidirectional(LSTM(128, dropout = 0.3, recurrent_dropout= 0.3,  return_sequences = True)))
stroke_read_model.add(Bidirectional(LSTM(128,dropout = 0.3, recurrent_dropout= 0.3, return_sequences = True)))
stroke_read_model.add(Bidirectional(LSTM(128,dropout = 0.3, recurrent_dropout= 0.3, return_sequences = False)))
stroke_read_model.add(Dense(512, activation = 'relu'))
stroke_read_model.add(Dropout(0.2))
stroke_read_model.add(Dense(NCATS, activation = 'softmax'))
stroke_read_model.summary()





stroke_read_model.compile(optimizer = 'adam',
                          loss = 'categorical_crossentropy',
                          metrics = ['categorical_accuracy'])


hist = stroke_read_model.fit(train_datagen, steps_per_epoch=STEPS, epochs=EPOCHS, verbose=1,
                             validation_data=val_datagen, validation_steps = val_steps)


stroke_read_model.save('tf_model_Bid_t0306.h5', include_optimizer=False)
stroke_read_model.save('tf_model_opt_Bid_t0306.h5', include_optimizer=True)
