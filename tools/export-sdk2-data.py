# -*- coding: utf-8 -*-
"""Экспорт данных справочника pioneer_sdk2 из docs/_data.py и docs/_examples.py
в JSON для Eleventy (src/_data/sdk2.json).

Запуск (Windows PowerShell):
    python tools/export-sdk2-data.py

Источник данных — Python-модули генератора docs/ (единый источник истины).
Скрипт только читает их и складывает всё в один JSON: категории, методы,
группы примеров и сами примеры с готовыми ссылками и prev/next.
"""

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
DOCS = PROJECT.parent / "docs"
REPO = PROJECT / "gf" / "pioneer-sdk2-example"
OUT = PROJECT / "src" / "_data" / "sdk2.json"

sys.path.insert(0, str(DOCS))
import _data as D  # noqa: E402
import _examples as EX  # noqa: E402

PREFIX = "/sdk2"


def method_url(m):
    return f'{PREFIX}/{m["category"]}/{m["slug"]}/'


def category_url(slug):
    return f"{PREFIX}/{slug}/"


def example_url(e, stem):
    return f'{PREFIX}/examples/{e["group"]}/{stem}/'


def group_url(slug):
    return f"{PREFIX}/examples/{slug}/"


KIND_LABEL = {"method": "метод", "class": "класс", "enum": "перечисление"}

CATS = {c["slug"]: c for c in D.CATEGORIES}
CAT_ORDER = [c["slug"] for c in D.CATEGORIES]

METHODS_BY_CAT = {slug: [] for slug in CAT_ORDER}
for m in D.METHODS:
    METHODS_BY_CAT[m["category"]].append(m)

ALL_METHODS = [m for slug in CAT_ORDER for m in METHODS_BY_CAT[slug]]
BY_SLUG = {m["slug"]: m for m in ALL_METHODS}

GROUP_BY_SLUG = {g["slug"]: g for g in EX.EXAMPLE_GROUPS}
GROUP_ORDER = [g["slug"] for g in EX.EXAMPLE_GROUPS]

EX_BY_GROUP = {slug: [] for slug in GROUP_ORDER}
for e in EX.EXAMPLES_DETAIL:
    e["stem"] = Path(e["file"]).stem
    EX_BY_GROUP[e["group"]].append(e)


def see_links(m):
    links = []
    for slug in m.get("see") or []:
        t = BY_SLUG.get(slug)
        if t:
            links.append({"display": t["display"], "url": method_url(t)})
    return links


def method_links(e):
    links = []
    for slug in e.get("methods") or []:
        t = BY_SLUG.get(slug)
        if t:
            links.append({"display": t["display"], "url": method_url(t)})
    return links


def read_source(e):
    path = REPO / e["path"]
    if path.exists():
        return path.read_text(encoding="utf-8")
    return None


def build_categories():
    out = []
    for slug in CAT_ORDER:
        cat = CATS[slug]
        methods = METHODS_BY_CAT[slug]
        out.append({
            "slug": cat["slug"],
            "title": cat["title"],
            "icon": cat["icon"],
            "owner": cat["owner"],
            "description": cat["description"],
            "count": len(methods),
            "methods": [
                {
                    "slug": m["slug"],
                    "display": m["display"],
                    "summary": m["summary"],
                    "signature": m["signature"],
                    "kind": m["kind"],
                    "url": method_url(m),
                }
                for m in methods
            ],
        })
    return out


def build_methods():
    out = []
    for cat_slug in CAT_ORDER:
        methods = METHODS_BY_CAT[cat_slug]
        cat = CATS[cat_slug]
        for idx, m in enumerate(methods):
            prev_m = methods[idx - 1] if idx > 0 else None
            next_m = methods[idx + 1] if idx < len(methods) - 1 else None
            out.append({
                "category": m["category"],
                "slug": m["slug"],
                "name": m["name"],
                "display": m["display"],
                "kind": m["kind"],
                "kind_label": KIND_LABEL.get(m["kind"], m["kind"]),
                "owner": m["owner"],
                "signature": m["signature"],
                "summary": m["summary"],
                "description": m["description"],
                "params": m.get("params") or [],
                "values": m.get("values") or [],
                "returns": m.get("returns"),
                "raises": m.get("raises") or [],
                "example": m.get("example"),
                "example_file": m.get("example_file"),
                "notes": m.get("notes") or [],
                "url": method_url(m),
                "cat_title": cat["title"],
                "cat_icon": cat["icon"],
                "see_links": see_links(m),
                "prev": (
                    {"display": prev_m["display"], "url": method_url(prev_m)}
                    if prev_m else None
                ),
                "next": (
                    {"display": next_m["display"], "url": method_url(next_m)}
                    if next_m else None
                ),
            })
    return out


def build_groups():
    out = []
    for slug in GROUP_ORDER:
        g = GROUP_BY_SLUG[slug]
        examples = EX_BY_GROUP[slug]
        out.append({
            "slug": g["slug"],
            "title": g["title"],
            "icon": g["icon"],
            "description": g["description"],
            "folder": g["folder"],
            "count": len(examples),
            "examples": [
                {
                    "stem": e["stem"],
                    "file": e["file"],
                    "title": e["title"],
                    "summary": e["summary"],
                    "url": example_url(e, e["stem"]),
                }
                for e in examples
            ],
        })
    return out


def build_examples():
    out = []
    for slug in GROUP_ORDER:
        group = GROUP_BY_SLUG[slug]
        examples = EX_BY_GROUP[slug]
        for idx, e in enumerate(examples):
            prev_e = examples[idx - 1] if idx > 0 else None
            next_e = examples[idx + 1] if idx < len(examples) - 1 else None
            out.append({
                "group": e["group"],
                "group_title": group["title"],
                "group_icon": group["icon"],
                "stem": e["stem"],
                "file": e["file"],
                "path": e["path"],
                "title": e["title"],
                "summary": e["summary"],
                "description": e["description"],
                "steps": e.get("steps") or [],
                "constants": e.get("constants") or [],
                "run": e.get("run") or [],
                "prereq": e.get("prereq") or [],
                "result": e.get("result") or [],
                "streams": e.get("streams") or [],
                "safety": e.get("safety") or [],
                "notes": e.get("notes") or [],
                "url": example_url(e, e["stem"]),
                "method_links": method_links(e),
                "prev": (
                    {"file": prev_e["file"], "url": example_url(prev_e, prev_e["stem"])}
                    if prev_e else None
                ),
                "next": (
                    {"file": next_e["file"], "url": example_url(next_e, next_e["stem"])}
                    if next_e else None
                ),
                "source": read_source(e),
            })
    return out


def main():
    data = {
        "project": D.PROJECT,
        "prefix": PREFIX,
        "stats": {
            "methods": len(ALL_METHODS),
            "categories": len(D.CATEGORIES),
            "groups": len(EX.EXAMPLE_GROUPS),
            "examples": len(EX.EXAMPLES_DETAIL),
        },
        "categories": build_categories(),
        "methods": build_methods(),
        "groups": build_groups(),
        "examples": build_examples(),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(data, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(
        f"Готово: {OUT} "
        f"({data['stats']['methods']} методов, {data['stats']['categories']} категорий, "
        f"{data['stats']['examples']} примеров в {data['stats']['groups']} группах)"
    )


if __name__ == "__main__":
    main()
