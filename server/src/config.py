import os
from functools import cache
from types import SimpleNamespace


@cache
def get_settings() -> SimpleNamespace:
    keys = [
        "secret_key", "algorithm", "access_token_expire_days", "redis_url",
        "log_path", "database_url", "data_dir", "stage"
    ]
    envs = {k.lower(): os.environ.get(k.upper(), 'null') for k in keys}
    return SimpleNamespace(**envs)
