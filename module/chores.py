import os
from pathlib import Path


def f2cat(filename: str) -> str:
    return filename.split(".")[0]


INPUT_DIR = Path(__file__).parent
files = os.listdir(os.path.join(INPUT_DIR, "train_simplified_sj"))
files = [f2cat(f) for f in files]

f = open("simplified_categories.txt", "w")
for file in files:
    f.write(f"{file} \n")
f.close()
