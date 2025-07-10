from pathlib import Path

from dotenv import load_dotenv

# Load variables from project-root .env if present (for local dev / non-Docker runs)
root_env = Path(__file__).resolve().parent.parent.parent / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=False) 