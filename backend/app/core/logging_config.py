"""
Structured logging setup.

Uses the standard library `logging` module with a consistent formatter so
that logs are grep-able locally and JSON-friendly enough to ship to a log
aggregator (Datadog, ELK, CloudWatch) in production without modification.
"""
import logging
import sys

from app.core.config import settings

LOG_FORMAT = (
    '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s",'
    '"message":"%(message)s"}'
)


def configure_logging() -> None:
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL)

    # Avoid duplicate handlers on reload (uvicorn --reload imports twice).
    if root_logger.handlers:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt="%Y-%m-%dT%H:%M:%S%z"))
    root_logger.addHandler(handler)

    # Quiet down noisy third-party loggers unless we're debugging.
    for noisy in ("uvicorn.access", "httpx", "urllib3"):
        logging.getLogger(noisy).setLevel(
            logging.WARNING if not settings.DEBUG else logging.INFO
        )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
