import mlflow
from pathlib import Path
from dotenv import load_dotenv
import os
import logging

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parent.parent
ARTIFACT_PATH = (BACKEND_DIR / "mlruns").as_uri()
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


def load_ml_model():
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
