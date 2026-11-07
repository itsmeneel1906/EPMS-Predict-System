import os
import sys
import argparse
import subprocess
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def start_backend():
    import uvicorn
    print("\n" + "=" * 65)
    print(" 🚀 EMPLOYEE PERFORMANCE PREDICTION SYSTEM (EPMS) - PYTHON BACKEND")
    print("=" * 65)
    print("  • Backend API:        http://127.0.0.1:8000")
    print("  • Interactive Docs:   http://127.0.0.1:8000/docs")
    print("  • Health Check:       http://127.0.0.1:8000/api/health")
    print("  • Frontend Dashboard: http://localhost:3001 (run: cd frontend && npm run dev)")
    print("=" * 65 + "\n")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)

def start_all():
    print("\n" + "=" * 65)
    print(" 🚀 LAUNCHING FULL-STACK APPLICATION (BACKEND + FRONTEND)")
    print("=" * 65)
    print("  • Starting Next.js frontend on http://localhost:3001 ...")
    print("  • Starting FastAPI backend on http://127.0.0.1:8000 ...")
    print("=" * 65 + "\n")

    frontend_dir = PROJECT_ROOT / "frontend"
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"

    # Launch frontend as child process
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)

    try:
        start_backend()
    except KeyboardInterrupt:
        print("\nStopping services...")
    finally:
        frontend_proc.terminate()
        frontend_proc.wait()

def main():
    parser = argparse.ArgumentParser(description="Run the EPMS Project")
    parser.add_argument(
        "--all",
        action="store_true",
        help="Start both the FastAPI backend and the Next.js frontend together",
    )
    args = parser.parse_args()

    if args.all:
        start_all()
    else:
        start_backend()

if __name__ == "__main__":
    main()
