#!/usr/bin/env python3
"""
Kiwimu MBTI 32 場景資產管線。

輸入：kiwimu-mbti-32-handfeel-singles-v1/all_32_final_2560_flatter/*.png（2560x2560）
輸出：
  public/assets/mbti32/scene/{TYPE}-{V}.webp     1440  全景（hero / 報告封面）
  public/assets/mbti32/scene-sm/{TYPE}-{V}.webp   720  全景小圖（列表背景）
  public/assets/mbti32/portrait/{TYPE}-{V}.webp   640  角色裁切（卡片，保留辨識度）
  public/assets/mbti32/avatar/{TYPE}-{V}.webp     192  角色特寫（chip / nav）
  public/assets/mbti32/og/{TYPE}-{V}.webp        1200x630 分享圖底
  public/assets/mbti32/og-jpg/{TYPE}-{V}.jpg    1200x630 分享圖底（JPEG 保底）
  data/mbti32Assets.generated.ts                  路徑 + 焦點 + 場景色票

角色偵測：Kiwimu 是「奶霜白身體 + 黑喙／黑腳」。以低彩度高亮度遮罩找身體，
再往下併入黑色腳部，得出 bbox；bbox 中心即 focal point，供 object-position 使用。

用法：python3 scripts/build-mbti32-assets.py [--src DIR] [--only INTJ-A]
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parent.parent
DEFAULT_SRC = Path(
    "/Users/pensoair/Desktop/Kiwimu/01_角色設定/角色設計圖/"
    "kiwimu-mbti-32-handfeel-singles-v1/all_32_final_2560_flatter"
)
OUT_IMG = REPO / "public" / "assets" / "mbti32"
OUT_TS = REPO / "data" / "mbti32Assets.generated.ts"

# 產出規格：(子目錄, 邊長或(寬,高), 裁切模式, webp 品質)
#   scene   = 原圖正方形全景
#   focus   = 以角色 bbox 為中心的正方形裁切，pad 為 bbox 最長邊的倍數
#   og      = 以角色為中心的 1200x630 橫幅
VARIANTS = [
    ("scene", 1600, ("scene", None), 84, "WEBP"),
    ("scene-sm", 800, ("scene", None), 80, "WEBP"),
    ("portrait", 720, ("focus", 1.60), 86, "WEBP"),
    ("avatar", 224, ("focus", 1.34), 88, "WEBP"),
    ("og", (1200, 630), ("og", 1.90), 84, "WEBP"),
    # LINE / 部分社群爬蟲對 WebP OG 圖支援不穩，另出一份 JPEG 保底
    ("og-jpg", (1200, 630), ("og", 1.90), 86, "JPEG"),
]

PALETTE_SIZE = 128


# ── 角色框（人工核定） ──────────────────────────────────────────────────
# 這 32 張是一次性定稿資產，角色框以人工逐張核對後寫死，不做自動偵測：
# 厚塗筆觸會讓連通區塊碎裂，亮地板與暗角也會混進來，四種偵測法都不穩定。
# 值為角色（含黑喙與黑腳）在原圖中的 (x0, y0, x1, y1)，0–1 相對座標。
# 核對方式：`python3 scripts/build-mbti32-assets.py --verify` 會輸出疊框拼版，
# 若日後更換素材，重跑 --verify 對照後再改這張表。
CHARACTER_BOXES: dict[str, tuple[float, float, float, float]] = {
    "INTJ-A": (0.33, 0.32, 0.6, 0.75),
    "INTJ-T": (0.4, 0.41, 0.6, 0.75),
    "INTP-A": (0.35, 0.5, 0.58, 0.83),
    "INTP-T": (0.46, 0.44, 0.66, 0.7),
    "ENTJ-A": (0.34, 0.47, 0.58, 0.8),
    "ENTJ-T": (0.24, 0.46, 0.46, 0.79),
    "ENTP-A": (0.34, 0.53, 0.6, 0.86),
    "ENTP-T": (0.42, 0.55, 0.62, 0.87),
    "INFJ-A": (0.37, 0.43, 0.57, 0.75),
    "INFJ-T": (0.4, 0.48, 0.6, 0.77),
    "INFP-A": (0.36, 0.5, 0.6, 0.85),
    "INFP-T": (0.38, 0.5, 0.6, 0.8),
    "ENFJ-A": (0.36, 0.45, 0.62, 0.82),
    "ENFJ-T": (0.36, 0.45, 0.58, 0.8),
    "ENFP-A": (0.3, 0.48, 0.62, 0.85),
    "ENFP-T": (0.38, 0.5, 0.62, 0.87),
    "ISTJ-A": (0.37, 0.42, 0.58, 0.76),
    "ISTJ-T": (0.52, 0.42, 0.72, 0.72),
    "ISFJ-A": (0.55, 0.47, 0.76, 0.79),
    "ISFJ-T": (0.4, 0.47, 0.58, 0.72),
    "ESTJ-A": (0.47, 0.42, 0.7, 0.74),
    "ESTJ-T": (0.4, 0.42, 0.62, 0.78),
    "ESFJ-A": (0.35, 0.42, 0.6, 0.76),
    "ESFJ-T": (0.38, 0.52, 0.57, 0.78),
    "ISTP-A": (0.42, 0.38, 0.66, 0.68),
    "ISTP-T": (0.4, 0.36, 0.6, 0.66),
    "ISFP-A": (0.34, 0.42, 0.58, 0.74),
    "ISFP-T": (0.42, 0.52, 0.62, 0.82),
    "ESTP-A": (0.42, 0.34, 0.72, 0.68),
    "ESTP-T": (0.32, 0.4, 0.58, 0.76),
    "ESFP-A": (0.36, 0.46, 0.63, 0.82),
    "ESFP-T": (0.4, 0.46, 0.62, 0.8),
}


def character_bbox(full_type: str) -> tuple[float, float, float, float]:
    return CHARACTER_BOXES[full_type]


# ── 場景色票 ────────────────────────────────────────────────────────────
def _srgb_to_hsl(r: int, g: int, b: int) -> tuple[float, float, float]:
    rf, gf, bf = r / 255, g / 255, b / 255
    hi, lo = max(rf, gf, bf), min(rf, gf, bf)
    l = (hi + lo) / 2
    if hi == lo:
        return 0.0, 0.0, l
    d = hi - lo
    s = d / (2 - hi - lo) if l > 0.5 else d / (hi + lo)
    if hi == rf:
        h = ((gf - bf) / d) % 6
    elif hi == gf:
        h = (bf - rf) / d + 2
    else:
        h = (rf - gf) / d + 4
    return h * 60, s, l


def _hsl_to_srgb(h: float, s: float, l: float) -> tuple[int, int, int]:
    c = (1 - abs(2 * l - 1)) * s
    hp = (h % 360) / 60
    x = c * (1 - abs(hp % 2 - 1))
    r, g, b = [(c, x, 0), (x, c, 0), (0, c, x), (0, x, c), (x, 0, c), (c, 0, x)][int(hp) % 6]
    m = l - c / 2
    return tuple(max(0, min(255, round((v + m) * 255))) for v in (r, g, b))


def _fit(rgb: tuple[int, int, int], l_lo: float, l_hi: float, s_lo: float, s_hi: float) -> str:
    """把取樣色的亮度／彩度夾進可用區間，色相不動。

    取樣色直接拿去用會出事：暗場景取出的 accent 亮度可能只有 0.3，
    當成 chip 底色時上面的深色字會讀不到；glow 拿去畫 9px 的 mono 小標更慘。
    夾住亮度與彩度可以保住每一型的色相識別，同時讓 32 型的對比都站得住。
    """
    h, sat, lum = _srgb_to_hsl(*rgb)
    return _hex(_hsl_to_srgb(h, min(max(sat, s_lo), s_hi), min(max(lum, l_lo), l_hi)))


def _hex(rgb: tuple[int, int, int]) -> str:
    return "#%02X%02X%02X" % rgb


def scene_palette(img: Image.Image, bbox: tuple[float, float, float, float]) -> dict[str, str]:
    """從場景（排除角色本體）取出 deep / accent / glow 三個色。"""
    small = img.convert("RGB").resize((PALETTE_SIZE, PALETTE_SIZE), Image.BILINEAR)
    px = small.load()
    bx0, by0, bx1, by1 = (int(v * PALETTE_SIZE) for v in bbox)

    buckets: dict[tuple[int, int, int], list[int]] = {}
    for y in range(PALETTE_SIZE):
        for x in range(PALETTE_SIZE):
            if bx0 <= x < bx1 and by0 <= y < by1:
                continue  # 角色所在區域不參與取色
            r, g, b = px[x, y]
            lo, hi = min(r, g, b), max(r, g, b)
            if lo > 186 and hi - lo < 44:
                continue  # 場景中其他奶霜色（光斑）也排除
            key = (r // 24, g // 24, b // 24)
            acc = buckets.setdefault(key, [0, 0, 0, 0])
            acc[0] += r
            acc[1] += g
            acc[2] += b
            acc[3] += 1

    clusters = []
    for total_r, total_g, total_b, n in buckets.values():
        if n < 12:
            continue
        rgb = (total_r // n, total_g // n, total_b // n)
        h, s, l = _srgb_to_hsl(*rgb)
        clusters.append({"rgb": rgb, "h": h, "s": s, "l": l, "n": n})

    if not clusters:
        return {"deep": "#101A14", "accent": "#4E6B52", "glow": "#E8B65C"}

    # deep：暗且面積夠大 → 章節底色
    deep = min(
        sorted(clusters, key=lambda c: -c["n"])[: max(3, len(clusters) // 2)],
        key=lambda c: c["l"],
    )
    # accent：彩度 × 面積最高、亮度落在可讀中段 → 邊框 / highlight
    mid = [c for c in clusters if 0.22 <= c["l"] <= 0.72] or clusters
    accent = max(mid, key=lambda c: c["s"] * (c["n"] ** 0.5))
    # glow：暖色（黃橘）中最亮的一個 → 小面積訊號色
    warm = [c for c in clusters if (c["h"] <= 62 or c["h"] >= 330) and c["s"] > 0.18]
    glow = max(warm, key=lambda c: c["l"] * (c["n"] ** 0.25)) if warm else accent

    return {
        # deep：章節／圖版底色，必須夠暗才不會跟奶油白文字打架
        "deep": _fit(deep["rgb"], 0.06, 0.17, 0.05, 0.42),
        # accent：邊框、變體 chip 底色（上面壓 --on-signal 深色字），要夠亮
        "accent": _fit(accent["rgb"], 0.60, 0.74, 0.30, 0.78),
        # glow：9–11px 的 mono 小標與圖鑑編號，對比要求最高
        "glow": _fit(glow["rgb"], 0.68, 0.84, 0.32, 0.85),
    }


# ── 裁切 ────────────────────────────────────────────────────────────────
def crop_box(size: int, bbox, mode: str, pad: float | None, out_ratio: float):
    """回傳 PIL crop box。out_ratio = 目標寬/高。"""
    if mode == "scene":
        return (0, 0, size, size)

    cx = (bbox[0] + bbox[2]) / 2 * size
    cy = (bbox[1] + bbox[3]) / 2 * size
    span = max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * size
    h = min(size, span * (pad or 1.5))
    w = h * out_ratio
    if w > size:
        w = size
        h = w / out_ratio

    # 頭頂需要比腳下多一點空間，視覺重心才穩
    cy -= h * 0.03
    # og 橫幅：角色再略高於中線，下方留給文字
    if mode == "og":
        cy -= h * 0.05

    x0 = min(max(0.0, cx - w / 2), size - w)
    y0 = min(max(0.0, cy - h / 2), size - h)
    return (round(x0), round(y0), round(x0 + w), round(y0 + h))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", type=Path, default=DEFAULT_SRC)
    ap.add_argument("--only", default=None, help="只處理某個 fullType，例如 INTJ-A")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--verify", type=Path, default=None, metavar="OUT.png",
                    help="輸出角色框疊圖拼版，用於人工複核 CHARACTER_BOXES")
    args = ap.parse_args()

    manifest = args.src / "manifest_all_32.csv"
    if not manifest.exists():
        print(f"找不到 manifest：{manifest}", file=sys.stderr)
        return 1

    entries = []
    with manifest.open(encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            name = row["file"]
            parts = name.rsplit(".", 1)[0].split("_")
            if len(parts) < 5:
                print(f"檔名格式不符，跳過：{name}", file=sys.stderr)
                continue
            index, family_zh, family_en, full_type, title = parts[0], parts[1], parts[2], parts[3], parts[4]
            if not re.fullmatch(r"[EI][NS][TF][JP]-[AT]", full_type):
                print(f"型別代碼不合法，跳過：{name}", file=sys.stderr)
                continue
            entries.append(
                {
                    "index": int(index),
                    "file": name,
                    "familyZh": family_zh,
                    "familyEn": family_en,
                    "fullType": full_type,
                    "baseType": full_type.split("-")[0],
                    "variant": full_type.split("-")[1],
                    "title": title,
                    "width": int(row["width"]),
                    "height": int(row["height"]),
                }
            )

    entries.sort(key=lambda e: e["index"])
    seen = {e["fullType"] for e in entries}
    expected = {
        f"{t}-{v}"
        for t in "INTJ INTP ENTJ ENTP INFJ INFP ENFJ ENFP ISTJ ISFJ ESTJ ESFJ ISTP ISFP ESTP ESFP".split()
        for v in ("A", "T")
    }
    if seen != expected:
        print(f"型別覆蓋不完整。缺：{sorted(expected - seen)} 多：{sorted(seen - expected)}", file=sys.stderr)
        return 1
    missing_boxes = sorted(expected - set(CHARACTER_BOXES))
    if missing_boxes:
        print(f"CHARACTER_BOXES 缺少：{missing_boxes}", file=sys.stderr)
        return 1
    print(f"manifest 校驗通過：32 型 × A/T 全覆蓋（{len(entries)} 筆），角色框表齊備")

    if args.only:
        entries = [e for e in entries if e["fullType"] == args.only]

    if args.verify:
        write_verify_sheet(args.src, entries, args.verify)
        print(f"角色框複核拼版 → {args.verify}")
        return 0

    for sub, *_ in VARIANTS:
        (OUT_IMG / sub).mkdir(parents=True, exist_ok=True)

    records = []
    total_bytes = 0
    for e in entries:
        src = args.src / e["file"]
        with Image.open(src) as img:
            img.load()
            size = min(img.width, img.height)
            if img.width != img.height:
                img = img.crop((0, 0, size, size))
            bbox = character_bbox(e["fullType"])
            palette = scene_palette(img, bbox)

            outputs = {}
            for sub, target, (mode, pad), quality, fmt in VARIANTS:
                tw, th = (target, target) if isinstance(target, int) else target
                box = crop_box(size, bbox, mode, pad, tw / th)
                out = img.crop(box).resize((tw, th), Image.LANCZOS).convert("RGB")
                ext = "webp" if fmt == "WEBP" else "jpg"
                dest = OUT_IMG / sub / f"{e['fullType']}.{ext}"
                if not args.dry_run:
                    save_kwargs = {"quality": quality, "method": 6} if fmt == "WEBP" else {"quality": quality, "optimize": True, "progressive": True}
                    out.save(dest, fmt, **save_kwargs)
                    total_bytes += dest.stat().st_size
                outputs[sub] = {"src": f"/assets/mbti32/{sub}/{e['fullType']}.{ext}", "width": tw, "height": th}

        records.append({**e, "bbox": bbox, "palette": palette, "outputs": outputs})
        print(
            f"  {e['fullType']:<7} bbox=({bbox[0]:.2f},{bbox[1]:.2f},{bbox[2]:.2f},{bbox[3]:.2f}) "
            f"deep={palette['deep']} accent={palette['accent']} glow={palette['glow']}"
        )

    if args.dry_run:
        print("dry-run：未寫檔")
        return 0

    print(f"\n圖片輸出總計 {total_bytes / 1024 / 1024:.2f} MB → {OUT_IMG}")
    write_ts(records)
    print(f"資料輸出 → {OUT_TS}")
    return 0


def write_verify_sheet(src: Path, entries: list[dict], out: Path) -> None:
    """把 CHARACTER_BOXES 疊回原圖，肉眼確認每張都框住喙、身體與腳。"""
    from PIL import ImageDraw

    cell, cols, label = 300, 8, 20
    rows = (len(entries) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + label)), (247, 246, 240))
    draw = ImageDraw.Draw(sheet)
    for i, e in enumerate(entries):
        with Image.open(src / e["file"]) as im:
            thumb = im.convert("RGB").resize((cell, cell), Image.LANCZOS)
        ox, oy = (i % cols) * cell, (i // cols) * (cell + label)
        sheet.paste(thumb, (ox, oy))
        x0, y0, x1, y1 = CHARACTER_BOXES[e["fullType"]]
        draw.rectangle(
            [ox + x0 * cell, oy + y0 * cell, ox + x1 * cell, oy + y1 * cell],
            outline=(255, 70, 40), width=3,
        )
        draw.text((ox + 4, oy + cell + 4), e["fullType"], fill=(20, 30, 24))
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)


def write_ts(records: list[dict]) -> None:
    lines = [
        "/**",
        " * 由 `python3 scripts/build-mbti32-assets.py` 產生，請勿手改。",
        " * 來源：kiwimu-mbti-32-handfeel-singles-v1 / all_32_final_2560_flatter（2560×2560）",
        " *",
        " * focal 為角色在原圖中的中心點（0–1），供 `object-position` 使用；",
        " * palette 由該張場景取樣而得（已排除角色本體與亮光斑）。",
        " */",
        "",
        "export interface Mbti32Image {",
        "  readonly src: string;",
        "  readonly width: number;",
        "  readonly height: number;",
        "}",
        "",
        "export interface Mbti32Scene {",
        "  readonly fullType: string;",
        "  readonly baseType: string;",
        "  readonly variant: 'A' | 'T';",
        "  readonly familyEn: string;",
        "  readonly familyZh: string;",
        "  readonly title: string;",
        "  readonly index: number;",
        "  /** 角色中心點（0–1），用於 object-position */",
        "  readonly focal: { readonly x: number; readonly y: number };",
        "  /** 場景取樣色票 */",
        "  readonly palette: { readonly deep: string; readonly accent: string; readonly glow: string };",
        "  readonly scene: Mbti32Image;",
        "  readonly sceneSm: Mbti32Image;",
        "  readonly portrait: Mbti32Image;",
        "  readonly avatar: Mbti32Image;",
        "  readonly og: Mbti32Image;",
        "  /** LINE 等對 WebP OG 支援不穩的爬蟲用 */",
        "  readonly ogJpg: Mbti32Image;",
        "}",
        "",
        "export const MBTI32_SCENES = {",
    ]
    key_map = [("scene", "scene"), ("scene-sm", "sceneSm"), ("portrait", "portrait"),
               ("avatar", "avatar"), ("og", "og"), ("og-jpg", "ogJpg")]
    for r in records:
        fx = (r["bbox"][0] + r["bbox"][2]) / 2
        fy = (r["bbox"][1] + r["bbox"][3]) / 2
        lines.append(f"  '{r['fullType']}': {{")
        lines.append(f"    fullType: '{r['fullType']}',")
        lines.append(f"    baseType: '{r['baseType']}',")
        lines.append(f"    variant: '{r['variant']}',")
        lines.append(f"    familyEn: '{r['familyEn']}',")
        lines.append(f"    familyZh: '{r['familyZh']}',")
        lines.append(f"    title: '{r['title']}',")
        lines.append(f"    index: {r['index']},")
        lines.append(f"    focal: {{ x: {fx:.4f}, y: {fy:.4f} }},")
        p = r["palette"]
        lines.append(f"    palette: {{ deep: '{p['deep']}', accent: '{p['accent']}', glow: '{p['glow']}' }},")
        for sub, prop in key_map:
            o = r["outputs"][sub]
            lines.append(f"    {prop}: {{ src: '{o['src']}', width: {o['width']}, height: {o['height']} }},")
        lines.append("  },")
    lines += [
        "} as const satisfies Record<string, Mbti32Scene>;",
        "",
        "export type Mbti32FullType = keyof typeof MBTI32_SCENES;",
        "",
        "export const MBTI32_FULL_TYPES = Object.keys(MBTI32_SCENES) as Mbti32FullType[];",
        "",
    ]
    OUT_TS.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
