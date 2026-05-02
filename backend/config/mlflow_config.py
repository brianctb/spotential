import mlflow
from pathlib import Path
from dotenv import load_dotenv
import os
import logging
import joblib

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parent.parent
ARTIFACT_PATH = (BACKEND_DIR / "mlruns").as_uri()
MODELS_PATH = BACKEND_DIR / "models"
LOCAL_MODEL_NAME = "production_model.pkl"
DB_PATH = f"sqlite:///{BACKEND_DIR / 'mlflow.db'}"

# using the fastapi default uvicorn logger, has the nice green icon
logger = logging.getLogger("uvicorn")


def init_mlflow():
    mlflow.set_tracking_uri(DB_PATH)

    experiment_name = "spotential_v1"
    client = mlflow.tracking.MlflowClient()

    exp = client.get_experiment_by_name(experiment_name)

    if exp is None:
        mlflow.create_experiment(
            name=experiment_name,
            artifact_location=ARTIFACT_PATH
        )

    mlflow.set_experiment(experiment_name)


def load_mlruns_model():
    mlflow.set_tracking_uri(DB_PATH)
    model_name = os.getenv("MODEL_NAME", "spotential-unified-model")
    model_uri = f"models:/{model_name}/latest"
    try:
        logger.info(f"Attempting to load model: {model_uri}")
        model = mlflow.pyfunc.load_model(model_uri)
        logger.info(f"Successfully loaded model '{model_name}' from {DB_PATH}")
        return model
    except Exception as e:
        logger.exception(f"Failed to load ML model from registry: {model_uri}")
        raise RuntimeError(f"ML model load failed: {model_name}") from e


def export_model(model_name: str = None, destination_path: Path = None):
    mlflow.set_tracking_uri(DB_PATH)
    name = model_name or os.getenv("MODLE_NAME", "spotential-unified-model")
    out_dir = destination_path or MODELS_PATH

    os.makedirs(out_dir, exist_ok=True)
    dest_path = out_dir / LOCAL_MODEL_NAME

    model_uri = f"models:/{name}/latest"

    try:
        logger.info(f"Connecting to MLflow at {DB_PATH}")
        logger.info(f"Exporting raw XGBoost model from: {model_uri}")

        raw_model = mlflow.xgboost.load_model(model_uri)

        joblib.dump(raw_model, dest_path)
        logger.info(f"Exported to {dest_path}")

    except Exception as e:
        logger.error(f"Failed to export model: {e}")
        raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s: %(message)s"
    )
    export_model()
