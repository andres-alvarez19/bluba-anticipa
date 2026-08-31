#!/usr/bin/env bash

set -euo pipefail

demo_python="${BLUBA_DEMO_PYTHON:-./.venv/bin/python}"

"${demo_python}" -m bluba_api &
api_pid=$!

# Bind the video demo to loopback only. getUserMedia/MediaRecorder require a
# trustworthy browser context; localhost and 127.0.0.1 qualify, while a plain
# LAN http://<ip>:5173 origin can be blocked by the browser.
npm --workspace apps/demo-web run dev -- --host 127.0.0.1 &
web_pid=$!

cleanup() {
  kill "${api_pid}" "${web_pid}" 2>/dev/null || true
  wait "${api_pid}" "${web_pid}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Demo lista: http://localhost:5173/?demo=video"
echo "Para usar el micrófono, abre exactamente localhost/127.0.0.1 y autoriza el permiso del navegador."
wait -n "${api_pid}" "${web_pid}"
