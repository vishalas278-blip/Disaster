"""
STORMGUARD AI — ML Backend Service Wrapper
Integrates the trained Convective Genesis model with the FastAPI web layer.
"""

import os
import sys
from typing import Dict, Any

# Ensure ML package is reachable
backend_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(backend_dir, '..', '..'))
ml_dir = os.path.join(root_dir, 'ml')
if ml_dir not in sys.path:
    sys.path.insert(0, ml_dir)

from predict import ConvectivePredictor

class MLService:
    _instance = None
    
    @classmethod
    def get_instance(cls) -> 'MLService':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
        
    def __init__(self):
        try:
            self.predictor = ConvectivePredictor()
            self.is_loaded = True
        except Exception as e:
            print(f"[!] Warning: Could not initialize predictor from disk: {e}")
            # Try running training once if not created
            try:
                from train import train_convective_model
                train_convective_model()
                self.predictor = ConvectivePredictor()
                self.is_loaded = True
            except Exception as e2:
                print(f"[!] Critical: Failed fallback training: {e2}")
                self.is_loaded = False
                
    def predict(self, atmospheric_data: Dict[str, float]) -> Dict[str, Any]:
        if not self.is_loaded:
            raise RuntimeError("ML Model failed to load.")
        return self.predictor.predict_genesis(atmospheric_data)
        
    def get_model_info(self) -> Dict[str, Any]:
        if not self.is_loaded:
            return {'status': 'error', 'message': 'Model not loaded'}
        return {
            'status': 'online',
            'metadata': self.predictor.metadata,
            'features': self.predictor.features,
            'feature_importances': self.predictor.feature_importances
        }

ml_service = MLService.get_instance()
