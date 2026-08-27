#!/usr/bin/env bash

set -euo pipefail

demo_python="${BLUBA_DEMO_PYTHON:-./.venv/bin/python}"

"${demo_python}" -m bluba_api &
api_pid=$!

npm --workspace apps/demo-web run dev -- --host 0.0.0.0 &
web_pid=$!

cleanup() {
  kill "${api_pid}" "${web_pid}" 2>/dev/null || true
  wait "${api_pid}" "${web_pid}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Demo lista: http://localhost:5173/?demo=video"
wait -n "${api_pid}" "${web_pid}"
