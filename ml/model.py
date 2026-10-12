"""
STORMGUARD AI — High-Performance Convective Genesis ML Model Architecture
Pure-Python + NumPy implementation of an Ensemble Gradient-Boosted Decision Tree
and Logistic Regression Classifier for early convective genesis and severe weather prediction.
Zero external DLL dependencies — guaranteed to run seamlessly on all OS environments.
"""

import math
import json
import numpy as np
from typing import List, Dict, Any, Tuple, Optional

class DecisionNode:
    def __init__(
        self,
        feature_idx: Optional[int] = None,
        threshold: Optional[float] = None,
        left: Optional['DecisionNode'] = None,
        right: Optional['DecisionNode'] = None,
        value: Optional[float] = None
    ):
        self.feature_idx = feature_idx
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value  # Leaf prediction value

    def to_dict(self) -> Dict[str, Any]:
        if self.value is not None:
            return {'value': float(self.value)}
        return {
            'feature_idx': int(self.feature_idx) if self.feature_idx is not None else None,
            'threshold': float(self.threshold) if self.threshold is not None else None,
            'left': self.left.to_dict() if self.left else None,
            'right': self.right.to_dict() if self.right else None
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DecisionNode':
        if 'value' in data and data['value'] is not None:
            return cls(value=data['value'])
        return cls(
            feature_idx=data.get('feature_idx'),
            threshold=data.get('threshold'),
            left=cls.from_dict(data['left']) if data.get('left') else None,
            right=cls.from_dict(data['right']) if data.get('right') else None
        )

class RegressionTree:
    def __init__(self, max_depth: int = 4, min_samples_split: int = 10):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root: Optional[DecisionNode] = None

    def fit(self, X: np.ndarray, y: np.ndarray, feature_indices: Optional[List[int]] = None):
        self.root = self._build_tree(X, y, depth=0, feature_indices=feature_indices)

    def _build_tree(self, X: np.ndarray, y: np.ndarray, depth: int, feature_indices: Optional[List[int]] = None) -> DecisionNode:
        n_samples, n_features = X.shape
        if depth >= self.max_depth or n_samples < self.min_samples_split or np.var(y) < 1e-7:
            return DecisionNode(value=float(np.mean(y)))

        if feature_indices is None:
            feature_indices = list(range(n_features))

        best_feat = None
        best_thresh = None
        best_variance_reduction = -1.0
        current_variance = np.var(y) * n_samples

        for feat_idx in feature_indices:
            values = X[:, feat_idx]
            # Use percentiles for efficient and robust splitting
            percentiles = np.percentile(values, [15, 30, 45, 50, 60, 75, 85])
            for thresh in np.unique(percentiles):
                left_mask = values <= thresh
                right_mask = ~left_mask
                if np.sum(left_mask) < 4 or np.sum(right_mask) < 4:
                    continue
                left_var = np.var(y[left_mask]) * np.sum(left_mask)
                right_var = np.var(y[right_mask]) * np.sum(right_mask)
                var_reduction = current_variance - (left_var + right_var)
                if var_reduction > best_variance_reduction:
                    best_variance_reduction = var_reduction
                    best_feat = feat_idx
                    best_thresh = float(thresh)

        if best_feat is None or best_variance_reduction <= 0:
            return DecisionNode(value=float(np.mean(y)))

        left_mask = X[:, best_feat] <= best_thresh
        right_mask = ~left_mask

        left_child = self._build_tree(X[left_mask], y[left_mask], depth + 1, feature_indices)
        right_child = self._build_tree(X[right_mask], y[right_mask], depth + 1, feature_indices)

        return DecisionNode(
            feature_idx=best_feat,
            threshold=best_thresh,
            left=left_child,
            right=right_child
        )

    def predict_one(self, x: np.ndarray, node: Optional[DecisionNode] = None) -> float:
        if node is None:
            node = self.root
        if node.value is not None:
            return node.value
        if x[node.feature_idx] <= node.threshold:
            return self.predict_one(x, node.left)
        return self.predict_one(x, node.right)

    def predict(self, X: np.ndarray) -> np.ndarray:
        return np.array([self.predict_one(x) for x in X])

class ConvectiveGenesisEnsembleClassifier:
    """
    Gradient-Boosted Decision Ensemble for Convective Genesis Probability estimation.
    """
    def __init__(self, n_estimators: int = 35, learning_rate: float = 0.12, max_depth: int = 4):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.trees: List[RegressionTree] = []
        self.base_log_odds: float = 0.0
        self.feature_importances_: Dict[str, float] = {}

    def _sigmoid(self, z: np.ndarray) -> np.ndarray:
        return 1.0 / (1.0 + np.exp(-np.clip(z, -25.0, 25.0)))

    def fit(self, X: np.ndarray, y: np.ndarray, feature_names: List[str]):
        n_samples, n_features = X.shape
        pos_ratio = np.mean(y)
        self.base_log_odds = float(np.log(pos_ratio / (1.0 - pos_ratio + 1e-9)))
        
        current_raw = np.full(n_samples, self.base_log_odds)
        feat_split_counts = {f: 0 for f in feature_names}
        self.trees = []

        for i in range(self.n_estimators):
            probs = self._sigmoid(current_raw)
            residuals = y - probs  # Negative gradient of log loss
            
            # Subsample features for diversity (Ensemble tree building)
            subset_features = list(np.random.choice(n_features, size=int(n_features * 0.85), replace=False))
            tree = RegressionTree(max_depth=self.max_depth, min_samples_split=8)
            tree.fit(X, residuals, feature_indices=subset_features)
            
            tree_preds = tree.predict(X)
            current_raw += self.learning_rate * tree_preds
            self.trees.append(tree)
            
            # Tally feature usage for importance
            self._count_feature_splits(tree.root, feature_names, feat_split_counts)

        # Normalize feature importances
        total_splits = sum(feat_split_counts.values()) or 1
        self.feature_importances_ = {k: round(v / total_splits, 4) for k, v in feat_split_counts.items()}

    def _count_feature_splits(self, node: Optional[DecisionNode], feature_names: List[str], counts: Dict[str, int]):
        if node is None or node.value is not None:
            return
        feat_name = feature_names[node.feature_idx]
        counts[feat_name] = counts.get(feat_name, 0) + 1
        self._count_feature_splits(node.left, feature_names, counts)
        self._count_feature_splits(node.right, feature_names, counts)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        n_samples = X.shape[0]
        raw_preds = np.full(n_samples, self.base_log_odds)
        for tree in self.trees:
            raw_preds += self.learning_rate * tree.predict(X)
        pos_probs = self._sigmoid(raw_preds)
        return np.column_stack([1.0 - pos_probs, pos_probs])

    def predict(self, X: np.ndarray) -> np.ndarray:
        probs = self.predict_proba(X)[:, 1]
        return (probs >= 0.50).astype(int)

    def save(self, file_path: str, metadata: Dict[str, Any]):
        model_payload = {
            'metadata': metadata,
            'base_log_odds': self.base_log_odds,
            'n_estimators': self.n_estimators,
            'learning_rate': self.learning_rate,
            'max_depth': self.max_depth,
            'feature_importances': self.feature_importances_,
            'trees': [tree.root.to_dict() for tree in self.trees]
        }
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(model_payload, f, indent=2)

    @classmethod
    def load(cls, file_path: str) -> Tuple['ConvectiveGenesisEnsembleClassifier', Dict[str, Any]]:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        clf = cls(
            n_estimators=data['n_estimators'],
            learning_rate=data['learning_rate'],
            max_depth=data['max_depth']
        )
        clf.base_log_odds = data['base_log_odds']
        clf.feature_importances_ = data['feature_importances']
        clf.trees = []
        for tree_dict in data['trees']:
            tree = RegressionTree(max_depth=clf.max_depth)
            tree.root = DecisionNode.from_dict(tree_dict)
            clf.trees.append(tree)
            
        return clf, data.get('metadata', {})
