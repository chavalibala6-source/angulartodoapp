#!/usr/bin/env python3
import subprocess
import time
import os

# ---- Paths to your projects ----
FRONTEND_DIR = "/Users/bala/todo-app"
BACKEND_DIR = "/Users/bala/todo-backend"

# ---- Commands to run ----
FRONTEND_CMD = ["ng", "serve", "--host", "0.0.0.0"]
BACKEND_CMD = ["node", "server.js"]

def run_process(cmd, cwd, name):
    """Start a subprocess and print its live output."""
    print(f"🚀 Starting {name} ...")
    process = subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    return process

def stream_output(proc, name):
    """Stream the process output in real time."""
    for line in proc.stdout:
        print(f"[{name}] {line}", end="")

def main():
    os.environ["NG_DISABLE_VERSION_CHECK"] = "1"  # avoid Angular version prompt

    backend_proc = run_process(BACKEND_CMD, BACKEND_DIR, "Backend")
    time.sleep(2)  # small delay so backend starts first
    frontend_proc = run_process(FRONTEND_CMD, FRONTEND_DIR, "Frontend")

    try:
        # Stream both outputs simultaneously
        while True:
            backend_alive = backend_proc.poll() is None
            frontend_alive = frontend_proc.poll() is None

            if not backend_alive or not frontend_alive:
                print("❌ One of the processes stopped. Exiting.")
                break

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n🛑 Stopping both servers ...")
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()
        print("✅ All stopped cleanly.")

if __name__ == "__main__":
    main()
