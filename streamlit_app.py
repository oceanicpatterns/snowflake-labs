"""Streamlit entrypoint for Snowflake Learning Hub."""

from __future__ import annotations

import json
import re
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


ROOT = Path(__file__).resolve().parent


def _read_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"Missing required file: {path}")
    return path.read_text(encoding="utf-8")


def _build_embedded_app_html() -> str:
    index_html = _read_text(ROOT / "index.html")
    css = _read_text(ROOT / "styles.css")
    js = _read_text(ROOT / "app.js")
    content = _read_text(ROOT / "data" / "content-v3.json")
    content_json = json.dumps(json.loads(content), ensure_ascii=False)

    # Strip external asset links so Streamlit can render one self-contained bundle.
    index_html = re.sub(
        r'<link[^>]+href="styles\.css[^"]*"[^>]*>\s*',
        "",
        index_html,
        flags=re.IGNORECASE,
    )
    index_html = re.sub(
        r'<script[^>]+src="app\.js[^"]*"[^>]*>\s*</script>\s*',
        "",
        index_html,
        flags=re.IGNORECASE,
    )

    injected_assets = (
        f"<style>{css}</style>\n"
        f"<script>window.__SF_CONTENT__ = {content_json};</script>\n"
        f"<script>{js}</script>\n"
    )

    if "</body>" in index_html:
        return index_html.replace("</body>", f"{injected_assets}</body>")
    return f"{index_html}\n{injected_assets}"


def main() -> None:
    st.set_page_config(
        page_title="Snowflake Learning Hub",
        page_icon=":snowflake:",
        layout="wide",
    )
    st.title("Snowflake Learning Hub")
    st.caption(
        "Independent, community-built learning portal for Snowflake certification prep."
    )

    app_html = _build_embedded_app_html()
    components.html(app_html, height=2600, scrolling=True)


if __name__ == "__main__":
    main()
