import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

print("🚀 TRAINING SCRIPT STARTED...")

# Load dataset
df = pd.read_csv("clean_data.csv", sep=";")

print("✅ Dataset Loaded:", df.shape)
print("Columns:", df.columns)

# Check required columns
if "question" not in df.columns or "difficulty" not in df.columns:
    print("❌ ERROR: Dataset must contain 'question' and 'difficulty'")
    exit()

X = df["question"].astype(str)
y = df["difficulty"].astype(str)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("🧠 Training model...")

# Pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))),
    ("clf", LogisticRegression(max_iter=2000, class_weight="balanced"))
])

model.fit(X_train, y_train)

print("✅ Model training complete!")

# Accuracy
pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)

print("\n📊 Accuracy:", acc * 100, "%")
print("\n📄 Classification Report:\n")
print(classification_report(y_test, pred))

# Save model
joblib.dump(model, "difficulty_model.pkl")

print("\n💾 Model saved successfully as difficulty_model.pkl")
