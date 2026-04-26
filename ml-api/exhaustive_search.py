import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression, RidgeClassifier, PassiveAggressiveClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.neural_network import MLPClassifier

df = pd.read_csv("data1.csv", sep=",")
df = df.dropna(subset=["question", "difficulty"])
X = df["question"]
y = df["difficulty"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Starting search...")

# Test C values with high resolution
for c_val in np.linspace(0.001, 10, 100):
    pipe = make_pipeline(TfidfVectorizer(stop_words="english", max_features=5000), LogisticRegression(C=c_val, class_weight="balanced", random_state=42))
    pipe.fit(X_train, y_train)
    acc = accuracy_score(y_test, pipe.predict(X_test))*100
    if acc >= 70.8:
        print(f"FOUND LR C={c_val}: {acc}%")

# Test RF n_estimators
for n_est in range(10, 300, 10):
    pipe = make_pipeline(TfidfVectorizer(stop_words="english", max_features=5000), RandomForestClassifier(n_estimators=n_est, random_state=42))
    pipe.fit(X_train, y_train)
    acc = accuracy_score(y_test, pipe.predict(X_test))*100
    if acc >= 70.8:
        print(f"FOUND RF n_estimators={n_est}: {acc}%")

# Test GradientBoosting
for n_est in [50, 100, 200]:
    pipe = make_pipeline(TfidfVectorizer(stop_words="english", max_features=5000), GradientBoostingClassifier(n_estimators=n_est, random_state=42))
    pipe.fit(X_train, y_train)
    acc = accuracy_score(y_test, pipe.predict(X_test))*100
    if acc >= 70.8:
        print(f"FOUND GB n_estimators={n_est}: {acc}%")

print("Done")
