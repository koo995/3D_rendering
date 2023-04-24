from tensorflow.python.keras.models import load_model
import os
import numpy as np
from pathlib import Path
import tensorflow as tf
import matplotlib.pyplot as plt
import keras
from keras.utils.np_utils import to_categorical
from keras.utils import pad_sequences
from keras.layers import BatchNormalization, Bidirectional
from sklearn.preprocessing import LabelEncoder
import pandas as pd
from keras.metrics import top_k_categorical_accuracy


os.environ["CUDA_VISIBLE_DEVICES"] = "-1"


def top_3_accuracy(x, y):
    return top_k_categorical_accuracy(x, y, 3)


from keras.callbacks import (
    ModelCheckpoint,
    LearningRateScheduler,
    EarlyStopping,
    ReduceLROnPlateau,
)
from glob import glob
import gc

gc.enable()

from ast import literal_eval


STROKE_COUNT = 100
INPUT_DIR = Path(__file__).parent


def f2cat(filename: str) -> str:
    return filename.split(".")[0]


def list_all_categories():
    files = os.listdir(os.path.join(INPUT_DIR, "train_simplified_sj"))
    return sorted([f2cat(f) for f in files], key=str.lower)


def _stack_it(raw_strokes):
    """preprocess the string and make
    a standard Nx3 stroke vector"""
    stroke_vec = literal_eval(raw_strokes)  # string->list
    # unwrap the list
    in_strokes = [
        (xi, yi, i) for i, (x, y) in enumerate(stroke_vec) for xi, yi in zip(x, y)
    ]
    c_strokes = np.stack(in_strokes)
    # replace stroke id with 1 for continue, 2 for new
    c_strokes[:, 2] = [1] + np.diff(c_strokes[:, 2]).tolist()
    c_strokes[:, 2] += 1  # since 0 is no stroke
    # pad the strokes with zeros
    return pad_sequences(
        c_strokes.swapaxes(0, 1), maxlen=STROKE_COUNT, padding="post"
    ).swapaxes(0, 1)


model = load_model(
    os.path.join(INPUT_DIR, "tf_model_Bid_t.h5"),
    custom_objects={
        "BatchNormalization": BatchNormalization,
        "Bidirectional": Bidirectional,
    },
)

img_arr = "[[[142,127,114,100,86,72,58,46,33,27,21,14,10,8,5,0,4,12,27,39,51,63,77,96,114,130,149,163,177,188,201,210,214,217,219,218,215,212,208,202,195,186,175,163,150,],[38,38,42,45,50,57,65,73,84,100,115,128,142,157,171,186,201,213,224,232,238,244,250,254,254,254,254,250,245,237,224,209,197,177,158,143,122,103,89,76,65,53,45,39,31,]],[[108,120,130,141,160,175,189,200,],[101,108,117,126,128,128,125,115,]],[[154,165,177,188,199,207,219,227,240,255,],[98,84,66,51,40,30,18,7,2,0,]],]"


def drawing_predict(img_arr):
    img_arr = str(img_arr)
    df = pd.DataFrame(columns=["drawing"])
    df.loc[0] = img_arr
    df["drawing"] = df["drawing"].map(_stack_it)
    sub_vec = np.stack(df["drawing"].values, 0)
    sub_pred = model.predict(sub_vec, verbose=True, batch_size=4096)
    print("여기 예측 값: ", sub_pred)
    max(sub_pred)
    cats = list_all_categories()
    id2cat = {k: cat.replace(" ", "_") for k, cat in enumerate(cats)}
    return id2cat[np.argmax(sub_pred)]
