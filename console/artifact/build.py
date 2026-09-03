#!/usr/bin/env python3
"""Build the publishable artifact page.

Injects console/data/matrix-seed.json into console/artifact/template.html at the
/*__DATA__*/ marker and writes console/artifact/dist.html.

    python console/artifact/build.py

The result is a single self-contained file with no network dependency other than
Google Fonts, which is what the Artifact CSP allows. Publish it with the Artifact
tool, passing the existing artifact URL so it updates in place instead of
creating a second one.
"""
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONSOLE = os.path.dirname(HERE)

TEMPLATE = os.path.join(HERE, "template.html")
DATA = os.path.join(CONSOLE, "data", "matrix-seed.json")
OUT = os.path.join(HERE, "dist.html")

MARKER = "/*__DATA__*/"


def main():
    tpl = io.open(TEMPLATE, encoding="utf-8").read()
    rows = json.load(io.open(DATA, encoding="utf-8"))

    if not isinstance(rows, list) or not rows:
        sys.exit("matrix-seed.json must be a non-empty list")

    required = {"id", "capability", "question", "priority", "distribution"}
    for r in rows:
        missing = required - set(r)
        if missing:
            sys.exit("row %s missing fields: %s" % (r.get("id", "?"), sorted(missing)))

    if MARKER not in tpl:
        sys.exit("template is missing the %s marker" % MARKER)

    # Escape any "</" so a string in the data cannot close the <script> element.
    payload = json.dumps(rows, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    out = tpl.replace(MARKER, payload)

    io.open(OUT, "w", encoding="utf-8", newline="\n").write(out)

    seeded = sum(1 for r in rows if r.get("verdict"))
    stars = sum(1 for r in rows if r.get("priority") == "star")
    print("built %s" % OUT)
    print("  rows: %d | with a verdict: %d | decisive: %d | size: %.1f KB"
          % (len(rows), seeded, stars, len(out.encode("utf-8")) / 1024))


if __name__ == "__main__":
    main()
