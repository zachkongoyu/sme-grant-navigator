"""
HK Government Funding Scheme Logos – Batch Downloader
======================================================
Run this script to download all logos into the ./files/ subfolder.

Requirements:
    pip install requests

Usage:
    python download_logos.py
"""

import os
import json
import time
import requests
from pathlib import Path
from urllib.parse import urlparse

OUTPUT_DIR = Path(__file__).parent / "files"
OUTPUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ── Logo catalogue ────────────────────────────────────────────────────────────

LOGOS = [
    # ── Found automatically ──────────────────────────────────────────────────
    {"org": "Hong Kong Productivity Council",               "short": "HKPC",       "file": "hkpc.svg",       "url": "https://www.hkpc.org/themes/custom/hkpc/assetsv2/img/hkpc_logo.svg"},
    {"org": "Agriculture, Fisheries and Conservation Dept", "short": "AFCD",       "file": "afcd.gif",       "url": "https://www.afcd.gov.hk/images/logo_afcd_chi.gif"},
    {"org": "Hong Kong Monetary Authority",                 "short": "HKMA",       "file": "hkma.jpg",       "url": "https://www.hkma.gov.hk/statics/assets/img/logo.jpg"},
    {"org": "HKMC Insurance Limited",                       "short": "HKMC",       "file": "hkmc.png",       "url": "https://www.hkmc.com.hk/images/logo.png"},
    {"org": "Vocational Training Council",                  "short": "VTC",        "file": "vtc.svg",        "url": "https://www.vtc.edu.hk/vtc_image/images/navigation/vtc_logo_en.svg"},
    {"org": "HK Science & Technology Parks Corp",           "short": "HKSTP",      "file": "hkstp.svg",      "url": "https://www.hkstp.org/-/media/corpsite/assets/park-life/news-and-events/news/logo/hkstp_logo_eng_op-01.svg"},
    {"org": "Travel Industry Council of HK",                "short": "TIC",        "file": "tic.svg",        "url": "https://www.tichk.org/themes/custom/tic/src/images/tic_logo_header.svg"},
    {"org": "Travel Industry Authority",                    "short": "TIA",        "file": "tia.svg",        "url": "https://www.tia.org.hk/_nuxt/img/logo.a614acb.svg"},
    {"org": "Securities and Futures Commission",            "short": "SFC",        "file": "sfc.svg",        "url": "https://www.sfc.hk/assets/images/common/logo.svg"},
    {"org": "Hong Kong Design Centre",                      "short": "HKDC",       "file": "hkdc.svg",       "url": "https://www.hkdesigncentre.org/assets/img/hkdc-logo-white.svg",  "note": "White logo – use on dark background"},
    {"org": "Construction Industry Council (CITF)",         "short": "CIC",        "file": "cic.png",        "url": "https://www.citf.cic.hk/img/common/logo.png"},
    {"org": "Commerce and Economic Development Bureau",     "short": "CEDB",       "file": "cedb.png",       "url": "https://www.cedb.gov.hk/assets/images/cedb/cedb_logo_en_new.png"},
    {"org": "Digital Policy Office (SIE Fund)",             "short": "DPO",        "file": "dpo_sie.png",    "url": "https://www.sie.gov.hk/f/frontpage/1/160c88/logo_L5.png"},
    {"org": "Cleaner Production Partnership Programme",     "short": "CPPP",       "file": "cppp.png",       "url": "https://www.cleanerproduction.hk/img/logo_cppp.png"},
    {"org": "Chinese Medicine Development Fund",            "short": "CMDF",       "file": "cmdf.svg",       "url": "https://www.cmdevfund.hk/assets/img/logo.svg"},
    {"org": "Cyberport – DTSPP",                            "short": "DTSPP",      "file": "dtspp.png",      "url": "https://dtspp.cyberport.hk/wp-content/uploads/elementor/thumbs/DTSPP_logo-02-qerbb46xbq3u2888ng5v6m44e3nrwdlefmzdj64wlc.png"},

    # ── Require manual download (blocked / not found) ─────────────────────────
    {"org": "Environmental Protection Department",          "short": "EPD",        "file": "epd.png",        "url": None, "manual": "https://www.epd.gov.hk"},
    {"org": "Marine Department",                            "short": "MarineDept", "file": "marine_dept.png","url": None, "manual": "https://www.mardep.gov.hk"},
    {"org": "Environment and Ecology Bureau",               "short": "EEB",        "file": "eeb.png",        "url": None, "manual": "https://www.eeb.gov.hk"},
    {"org": "Trade and Industry Department",                "short": "TID",        "file": "tid.png",        "url": None, "manual": "https://www.tid.gov.hk"},
    {"org": "Innovation and Technology Commission",         "short": "ITC",        "file": "itc.png",        "url": None, "manual": "https://www.itc.gov.hk  /  https://www.itf.gov.hk"},
    {"org": "Cyberport",                                    "short": "Cyberport",  "file": "cyberport.png",  "url": None, "manual": "https://www.cyberport.hk"},
    {"org": "Hong Kong Tourism Board",                      "short": "HKTB",       "file": "hktb.png",       "url": None, "manual": "https://www.discoverhongkong.com"},
    {"org": "Culture, Sports and Tourism Bureau",           "short": "CSTB",       "file": "cstb.png",       "url": None, "manual": "https://www.cstb.gov.hk"},
    {"org": "Cultural & Creative Industries Dev Agency",    "short": "CCIDA",      "file": "ccida.png",      "url": None, "manual": "https://www.ccidahk.gov.hk"},
    {"org": "Hong Kong Film Development Council",           "short": "FDC",        "file": "fdc.png",        "url": None, "manual": "https://www.fdc.gov.hk"},
    {"org": "HK Securities and Investment Institute",       "short": "HKSI",       "file": "hksi.png",       "url": None, "manual": "https://www.hksi.org.hk"},
    {"org": "Labour and Welfare Bureau",                    "short": "LWB",        "file": "lwb.png",        "url": None, "manual": "https://www.lwb.gov.hk"},
    {"org": "Social Welfare Department",                    "short": "SWD",        "file": "swd.png",        "url": None, "manual": "https://www.swd.gov.hk"},
    {"org": "Youth Development Commission",                 "short": "YDC",        "file": "ydc.png",        "url": None, "manual": "https://www.hyab.gov.hk"},
    {"org": "Transport and Logistics Bureau",               "short": "TLB",        "file": "tlb.png",        "url": None, "manual": "https://www.tlb.gov.hk"},
]

# ── Downloader ────────────────────────────────────────────────────────────────

def download(logo: dict) -> str:
    url = logo.get("url")
    dest = OUTPUT_DIR / logo["file"]

    if url is None:
        return f"  ⚠  SKIP  {logo['short']:12s} – manual download needed → {logo.get('manual', 'N/A')}"

    if dest.exists():
        return f"  ✓  EXISTS {logo['short']:12s} – {logo['file']}"

    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        dest.write_bytes(r.content)
        return f"  ✓  OK     {logo['short']:12s} – {logo['file']}  ({len(r.content):,} bytes)"
    except requests.HTTPError as e:
        return f"  ✗  ERROR  {logo['short']:12s} – HTTP {e.response.status_code}: {url}"
    except Exception as e:
        return f"  ✗  ERROR  {logo['short']:12s} – {e}"


def main():
    print(f"\n{'─'*65}")
    print(f"  HK Funding Scheme Logos – Downloader")
    print(f"  Saving to: {OUTPUT_DIR}")
    print(f"{'─'*65}\n")

    auto   = [l for l in LOGOS if l.get("url")]
    manual = [l for l in LOGOS if not l.get("url")]

    print(f"[AUTO-DOWNLOAD]  {len(auto)} logos with known URLs\n")
    for logo in auto:
        print(download(logo))
        time.sleep(0.3)   # be polite to servers

    print(f"\n[MANUAL NEEDED]  {len(manual)} logos blocked or not found\n")
    for logo in manual:
        print(f"  ⚠  {logo['short']:12s}  →  {logo.get('manual', 'N/A')}")

    print(f"\n{'─'*65}")
    found = sum(1 for l in LOGOS if l.get("url") and (OUTPUT_DIR / l["file"]).exists())
    print(f"  Done: {found}/{len(LOGOS)} logos in {OUTPUT_DIR}")
    print(f"{'─'*65}\n")


if __name__ == "__main__":
    main()
