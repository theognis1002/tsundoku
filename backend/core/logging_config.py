import logging
import logging.config
import sys
from pathlib import Path
from typing import Any


def setup_logging(log_file: Path | None = None) -> None:
    """
    Configure logging for the entire application

    Args:
        log_file: Optional path to log file. If provided, logs will be written to file as well.
    """
    handlers: dict[str, Any] = {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "default",
            "level": "INFO",
        },
    }

    if log_file:
        handlers["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str(log_file),
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "formatter": "default",
            "level": "DEBUG",
        }

    logging_config: dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s - [%(pathname)s:%(lineno)d]",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": handlers,
        "root": {
            "level": "INFO",
            "handlers": list(handlers.keys()),
        },
        "loggers": {
            "backend": {
                "level": "INFO",
                "handlers": list(handlers.keys()),
                "propagate": False,
            },
            "sqlalchemy": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            # Add more logger configurations as needed
        },
    }

    logging.config.dictConfig(logging_config)

    # Log startup message
    logger = logging.getLogger(__name__)
    logger.info("Logging configuration initialized")
