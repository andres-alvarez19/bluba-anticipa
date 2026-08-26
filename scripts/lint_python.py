from __future__ import annotations

import py_compile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGETS = [ROOT / "services", ROOT / "scripts", ROOT / "tests"]


def main() -> None:
    for target in TARGETS:
        if not target.exists():
            continue
        for path in sorted(target.rglob("*.py")):
            py_compile.compile(str(path), doraise=True)
    print("python lint ok")


if __name__ == "__main__":
    main()
