import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib

# -----------------------------
# STEP 1: Create training data
# -----------------------------
data = [
    # water_dist, forest_dist, restricted_dist, risk
    [10, 500, 5000, "HIGH"],
    [30, 200, 2000, "HIGH"],
    [80, 400, 3000, "MEDIUM"],
    [120, 250, 3000, "MEDIUM"],
    [200, 100, 5000, "MEDIUM"],
    [400, 500, 8000, "LOW"],
    [600, 800, 10000, "LOW"],
    [300, 700, 9000, "LOW"],
]

df = pd.DataFrame(data, columns=[
    "water_dist",
    "forest_dist",
    "restricted_dist",
    "risk"
])

# -----------------------------
# STEP 2: Train model
# -----------------------------
X = df[["water_dist", "forest_dist", "restricted_dist"]]
y = df["risk"]

model = DecisionTreeClassifier()
model.fit(X, y)

# -----------------------------
# STEP 3: Save model
# -----------------------------
joblib.dump(model, "model.pkl")

print("✅ Model trained and saved as model.pkl")