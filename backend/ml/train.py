"""
train.py — PCOS risk model training pipeline.

Source dataset: "PCOS_data_without_infertility" (Kaggle, prasoonkottarathil),
541 patients, clinical + lifestyle attributes, binary PCOS diagnosis label.

Design decision: the full Kaggle dataset includes lab-test and ultrasound
features (beta-HCG, FSH, LH, AMH, follicle counts, blood pressure, etc.)
that an app user cannot self-report at home. This model is deliberately
trained on ONLY the subset of features a user can enter through the
Femina Pulse profile, daily log, and risk-check screen:

    age, BMI (from height/weight), cycle regularity, recent weight gain,
    excess hair growth, skin darkening, hair loss, persistent acne / pimples,
    frequent fast food, and regular exercise.

This trades some accuracy for something that actually works as a
consumer-facing screening tool instead of requiring blood work.

Usage:
    python train.py
Outputs (written to ./model/):
    xgb_model.joblib      trained XGBoost classifier
    feature_meta.json     feature order + encoding reference
    metrics.json          held-out test metrics + model comparison
    shap_importance.json  mean |SHAP value| per feature, for explanations
"""

import json
import warnings
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix,
)
from xgboost import XGBClassifier
import shap
import joblib

warnings.filterwarnings("ignore")

RAW_PATH = "data/PCOS_data_raw.csv"
MODEL_DIR = "model"

FEATURE_COLUMNS = [
    "age", "bmi", "cycle_irregular", "weight_gain",
    "hair_growth", "skin_darkening", "hair_loss",
    "pimples", "fast_food", "reg_exercise",
]
TARGET_COLUMN = "pcos"


def load_and_clean():
    df = pd.read_csv(RAW_PATH)
    df.columns = [c.strip() for c in df.columns]

    clean = pd.DataFrame()
    clean["age"] = df["Age (yrs)"]
    clean["bmi"] = df["BMI"]
    # Cycle(R/I): 2 = regular, anything else observed (4, 5) = irregular
    clean["cycle_irregular"] = (df["Cycle(R/I)"] != 2).astype(int)
    clean["weight_gain"] = df["Weight gain(Y/N)"]
    clean["hair_growth"] = df["hair growth(Y/N)"]
    clean["skin_darkening"] = df["Skin darkening (Y/N)"]
    clean["hair_loss"] = df["Hair loss(Y/N)"]
    clean["pimples"] = df["Pimples(Y/N)"]
    clean["fast_food"] = df["Fast food (Y/N)"]
    clean["reg_exercise"] = df["Reg.Exercise(Y/N)"]
    clean["pcos"] = df["PCOS (Y/N)"]

    before = len(clean)
    clean = clean.dropna()
    clean = clean.drop_duplicates()
    after = len(clean)
    print(f"Loaded {before} rows -> {after} after dropping missing/duplicate rows")

    for c in ["weight_gain", "hair_growth", "skin_darkening", "hair_loss", "pimples", "fast_food", "reg_exercise", "pcos"]:
        clean[c] = clean[c].astype(int)

    return clean


def train_and_compare(X_train, X_test, y_train, y_test):
    candidates = {
        "logistic_regression": LogisticRegression(max_iter=1000),
        "random_forest": RandomForestClassifier(n_estimators=300, max_depth=6, random_state=42),
        "xgboost": XGBClassifier(
            n_estimators=250, max_depth=4, learning_rate=0.05,
            subsample=0.9, colsample_bytree=0.9, eval_metric="logloss",
            random_state=42,
        ),
    }

    results = {}
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        proba = model.predict_proba(X_test)[:, 1]
        results[name] = {
            "accuracy": round(accuracy_score(y_test, preds), 4),
            "precision": round(precision_score(y_test, preds), 4),
            "recall": round(recall_score(y_test, preds), 4),
            "f1": round(f1_score(y_test, preds), 4),
            "roc_auc": round(roc_auc_score(y_test, proba), 4),
        }
        print(f"{name:20s} -> {results[name]}")

    best_name = max(results, key=lambda k: results[k]["roc_auc"])
    print(f"\nBest model by ROC-AUC: {best_name}")
    return candidates, results, best_name


def main():
    df = load_and_clean()
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    candidates, results, best_name = train_and_compare(X_train, X_test, y_train, y_test)
    best_model = candidates[best_name]

    # Retrain the chosen model on the full dataset for the shipped artifact,
    # while keeping the held-out metrics above for honest reporting.
    final_model = XGBClassifier(
        n_estimators=250, max_depth=4, learning_rate=0.05,
        subsample=0.9, colsample_bytree=0.9, eval_metric="logloss",
        random_state=42,
    )
    final_model.fit(X, y)

    explainer = shap.TreeExplainer(final_model)
    shap_values = explainer.shap_values(X)
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    shap_importance = {
        col: round(float(val), 5)
        for col, val in sorted(zip(FEATURE_COLUMNS, mean_abs_shap), key=lambda x: -x[1])
    }
    print("\nMean |SHAP| feature importance:")
    for k, v in shap_importance.items():
        print(f"  {k:16s} {v}")

    import os
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(final_model, f"{MODEL_DIR}/xgb_model.joblib")

    with open(f"{MODEL_DIR}/feature_meta.json", "w") as f:
        json.dump({
            "feature_order": FEATURE_COLUMNS,
            "binary_features": [c for c in FEATURE_COLUMNS if c not in ("age", "bmi")],
            "notes": "cycle_irregular: 1 if periods are irregular/absent, else 0. All other binary fields: 1=yes, 0=no.",
        }, f, indent=2)

    with open(f"{MODEL_DIR}/metrics.json", "w") as f:
        json.dump({
            "dataset_size": len(df),
            "train_size": len(X_train),
            "test_size": len(X_test),
            "class_balance": y.value_counts().to_dict(),
            "model_comparison": results,
            "chosen_model": "xgboost",
            "note": "chosen_model metrics above are on the held-out test split; the shipped model.joblib is refit on all data.",
        }, f, indent=2)

    with open(f"{MODEL_DIR}/shap_importance.json", "w") as f:
        json.dump(shap_importance, f, indent=2)

    print(f"\nSaved model + metadata to ./{MODEL_DIR}/")


if __name__ == "__main__":
    main()
