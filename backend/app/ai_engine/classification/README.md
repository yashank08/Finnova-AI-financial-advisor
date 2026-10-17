# Transaction Expense Categorization Engine (Traditional NLP + ML)

This module provides an automated, traditional Machine Learning classification pipeline for bank statement transaction descriptions. It automatically maps raw merchant strings (e.g., `"ZOMATO ORDER 438"`, `"UBER TRIP MUMBAI"`) into standard personal finance categories (`Food`, `Transport`, `Entertainment`, `Shopping`, `Utilities`, `Healthcare`, `Other`).

---

## 💡 How the AI Works (Simple Explanation)

### 1. What TF-IDF Does
Computers cannot process raw English words like `"ZOMATO"` or `"ELECTRICITY"` directly. 

**TF-IDF** stands for **Term Frequency - Inverse Document Frequency**. It converts text into numeric feature vectors using two key principles:
* **Term Frequency (TF)**: Counts how often a word appears in a specific transaction description. (e.g., `"ZOMATO"` appearing in `"ZOMATO ORDER"` gives a high TF score for `"ZOMATO"`).
* **Inverse Document Frequency (IDF)**: Measures how common or rare a word is across *all* transaction records. Common generic words (like `"ORDER"`, `"PAY"`, `"BILL"`) get **lower weight**, while unique merchant identifiers (like `"ZOMATO"`, `"UBER"`, `"APOLLO"`, `"NETFLIX"`) get **higher weight**.

### 2. What Logistic Regression Does
**Logistic Regression** is a mathematical classification algorithm. 

In this project, it acts as a decision-maker:
* It takes the numeric TF-IDF feature weights of a transaction string.
* It computes a probability score for each target category (`Food`, `Transport`, `Entertainment`, etc.).
* It selects the category with the **highest probability** as the predicted output.

### 3. Model Input
* **Input**: A raw text string representing a transaction description.
* **Example**: `"ZOMATO ORDER 438"`

### 4. Model Output
* **Output**: A structured dictionary containing:
  - `predicted_category`: The assigned category label (e.g., `"Food"`).
  - `confidence`: The probability score (from `0.0` to `1.0`, e.g., `0.9412` or `94.12%`).
  - `all_probabilities`: Breakdown of probabilities across all 7 categories.

### 5. How the Model is Evaluated
The system evaluates performance on a hold-out test set (data the model has never seen during training) using standard metrics:
* **Accuracy**: The percentage of test transactions correctly categorized.
* **Precision**: When the model predicts `"Food"`, how often is it actually Food?
* **Recall**: Out of all real `"Food"` transactions in the dataset, how many did the model correctly identify?
* **Macro F1-Score**: The harmonic mean of precision and recall across all categories, ensuring equal weight even if some categories have fewer samples.
* **Confusion Matrix**: A table showing exact true vs. predicted category counts to reveal any misclassification patterns.

---

## 📁 Module Directory Structure

```
backend/app/ai_engine/classification/
├── __init__.py
├── dataset/
│   └── merchant_data_dev.csv       # Labeled training dataset (synthetic/dev data)
├── train.py                        # Model training pipeline (TF-IDF + Logistic Regression)
├── predict.py                      # Inference module for single/batch predictions
├── evaluate.py                     # Evaluation harness (Accuracy, F1, Confusion Matrix)
├── test_classifier.py             # Simple test runner for example queries
├── model/                          # Saved model artifacts directory
│   └── merchant_classifier.joblib  # Serialized Scikit-learn Pipeline
└── README.md                       # Plain English documentation
```

---

## 🚀 How to Run

### 1. Train Model
```powershell
python backend/app/ai_engine/classification/train.py
```

### 2. Evaluate Model
```powershell
python backend/app/ai_engine/classification/evaluate.py
```

### 3. Run Inference Tests
```powershell
python backend/app/ai_engine/classification/test_classifier.py
```
