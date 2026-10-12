"""
STORMGUARD AI — Machine Learning Model Training Module
Trains an ensemble Gradient-Boosted Decision Tree model for
Convective Genesis Probability (0-100%) and severe atmospheric threat risks.
"""

import os
import sys
import csv
import json
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model import ConvectiveGenesisEnsembleClassifier

FEATURE_NAMES = [
    'cape_j_kg',
    'cin_j_kg',
    'lifted_index_k',
    'k_index',
    'precipitable_water_mm',
    'surface_temp_c',
    'relative_humidity_pct',
    'dew_point_depression_c',
    'pressure_tendency_hpa_3h',
    'updraft_helicity_m2_s2',
    'vertical_velocity_ms',
    'wind_shear_knots',
    'reflectivity_gradient_dbz_10m',
    'cloud_top_cooling_c_15m'
]

def load_data_from_csv(csv_path: str):
    data = []
    targets = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            feat_vals = [float(row[k]) for k in FEATURE_NAMES]
            data.append(feat_vals)
            targets.append(int(float(row['convective_genesis'])))
    return np.array(data), np.array(targets)

def compute_roc_auc(y_true: np.ndarray, y_score: np.ndarray) -> float:
    # Standard Wilcoxon-Mann-Whitney trapezoidal ROC-AUC
    pos_mask = (y_true == 1)
    n_pos = np.sum(pos_mask)
    n_neg = len(y_true) - n_pos
    if n_pos == 0 or n_neg == 0:
        return 0.5
    
    order = np.argsort(y_score)
    ranks = np.empty_like(order)
    ranks[order] = np.arange(len(y_score))
    
    pos_ranks_sum = np.sum(ranks[pos_mask])
    u_stat = pos_ranks_sum - (n_pos * (n_pos - 1)) / 2.0
    return float(u_stat / (n_pos * n_neg))

def train_convective_model(data_path: str = None, save_dir: str = None):
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    if data_path is None:
        data_path = os.path.join(curr_dir, '..', 'data', 'demo_weather_data.csv')
    if save_dir is None:
        save_dir = os.path.join(curr_dir, 'models')
    os.makedirs(save_dir, exist_ok=True)
    
    # Check if dataset exists or generate it
    if not os.path.exists(data_path):
        from dataset_generator import generate_atmospheric_dataset, export_dataset_to_csv
        dataset_dict = generate_atmospheric_dataset(n_samples=4000)
        export_dataset_to_csv(dataset_dict, data_path)
        
    X, y = load_data_from_csv(data_path)
    
    # Train-test split (80/20)
    np.random.seed(42)
    indices = np.arange(len(X))
    np.random.shuffle(indices)
    split_idx = int(0.80 * len(X))
    train_idx, test_idx = indices[:split_idx], indices[split_idx:]
    
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]
    
    print(f"[*] Training on {len(X_train)} samples, testing on {len(X_test)} samples...")
    
    # Train Convective Genesis Ensemble
    model = ConvectiveGenesisEnsembleClassifier(
        n_estimators=35,
        learning_rate=0.15,
        max_depth=4
    )
    model.fit(X_train, y_train, FEATURE_NAMES)
    
    # Evaluation
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = float(np.mean(y_pred == y_test))
    roc_auc = compute_roc_auc(y_test, y_prob)
    
    tp = np.sum((y_pred == 1) & (y_test == 1))
    fp = np.sum((y_pred == 1) & (y_test == 0))
    fn = np.sum((y_pred == 0) & (y_test == 1))
    prec = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    rec = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1 = float(2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0
    
    print("==================================================")
    print("      STORMGUARD AI PROTOTYPE MODEL METRICS       ")
    print("==================================================")
    print(f"Accuracy:        {acc:.4f} ({acc*100:.1f}%)")
    print(f"ROC-AUC Score:   {roc_auc:.4f}")
    print(f"F1 Score:        {f1:.4f}")
    print(f"Precision:       {prec:.4f}")
    print(f"Recall:          {rec:.4f}")
    print("--------------------------------------------------")
    
    # Feature Importances
    feat_imp = sorted(model.feature_importances_.items(), key=lambda x: x[1], reverse=True)
    print("\n[*] Key Atmospheric Feature Importances:")
    for feat, imp in feat_imp:
        print(f"  - {feat:30s}: {imp * 100:6.2f}%")
        
    # Baseline stats for XAI normalization (means & standard deviations)
    feature_stats = {}
    for i, col in enumerate(FEATURE_NAMES):
        feature_stats[col] = {
            'mean': float(np.mean(X[:, i])),
            'std': float(np.std(X[:, i])),
            'min': float(np.min(X[:, i])),
            'max': float(np.max(X[:, i]))
        }
        
    model_metadata = {
        'model_name': 'StormGuard Convective Genesis Gradient-Boosted Ensemble',
        'algorithm': 'Gradient-Boosted Decision Ensemble (35 Estimators, Depth 4)',
        'version': '1.0.0-prototype',
        'target': 'convective_genesis (Initiation within 15-60 min)',
        'features': FEATURE_NAMES,
        'feature_importances': {feat: float(imp) for feat, imp in feat_imp},
        'feature_stats': feature_stats,
        'metrics': {
            'accuracy': float(acc),
            'roc_auc': float(roc_auc),
            'f1_score': float(f1),
            'precision': float(prec),
            'recall': float(rec)
        },
        'training_samples': len(X_train),
        'test_samples': len(X_test),
        'scientific_note': 'Calibrated Prototype Model for SIH 2026 Demonstration. Scalable to 3D Spatiotemporal ConvLSTM / Graph Neural Networks with Radar & INSAT inputs in full production.'
    }
    
    model_file = os.path.join(save_dir, 'convective_genesis_model.json')
    meta_file = os.path.join(save_dir, 'model_metadata.json')
    
    model.save(model_file, model_metadata)
    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump(model_metadata, f, indent=2)
        
    print(f"\n[+] Saved model artifact to: {model_file}")
    print(f"[+] Saved metadata to: {meta_file}")
    
    return model, model_metadata

if __name__ == '__main__':
    train_convective_model()
