# @Author: rogue-dev-studio
# @Date: 2026-08-03 12:40:00
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

SRC = Path(
    r"C:\Users\MSI THIN 15\.cursor\projects\d-ZonaKreatif-explore\agent-tools\a111a20d-3b7a-41db-8e01-220c5d44f721.txt"
)
OUT = Path(r"d:\ZonaKreatif\explore\project\sijama\backend\database\seeders\data")
OUT.mkdir(parents=True, exist_ok=True)

text = SRC.read_text(encoding="utf-8", errors="ignore")
names = []
seen = set()
skip = re.compile(
    r"(cari|peta|dataset|google|http|menampilkan|sumber|seluruh|tekan|contoh|artikel|terkini|kab /|provinsi$|masjid$|∞|✅|🗺️|🕌|الل)",
    re.I,
)
addr = re.compile(r"^(Jl\.|Gg\.|CPW|RT\.|RW\.)", re.I)

for line in text.splitlines():
    s = line.strip().strip('"')
    if not s or len(s) < 8 or len(s) > 100:
        continue
    if skip.search(s) or addr.search(s):
        continue
    if s.count(",") >= 3 and any(
        x in s.lower() for x in ["indonesia", "kec.", "kabupaten", "kota "]
    ):
        continue
    low = s.lower()
    if "ppm" in low or "pondok pesantren mahasiswa" in low:
        jenis = "ppm"
    elif "gsg" in low or "gedung serba" in low or "gedung serbaguna" in low:
        jenis = "gsg"
    elif "aula" in low:
        jenis = "aula"
    elif "dpd" in low or "dpw" in low or "dpp" in low or "dewan pimpinan" in low:
        jenis = "kantor"
    elif "masjid" in low or "ldii" in low:
        jenis = "masjid"
    else:
        continue
    key = re.sub(r"\s+", " ", low)
    if key in seen:
        continue
    seen.add(key)
    kode = "lok-" + hashlib.md5(key.encode()).hexdigest()[:10]
    names.append(
        {
            "kode": kode,
            "nama": s,
            "jenis": jenis,
            "kota": None,
            "alamat": None,
            "lat": None,
            "lng": None,
        }
    )

ppm = [
    ("PPM Nur Muhammad Malang", -7.759315, 112.607019, "Malang"),
    ("PPM Graha Cendikia Sleman", -7.258279, 110.571608, "Sleman"),
    ("PPM Bina Insan Mulia Tangerang", -5.970549, 106.726393, "Tangerang"),
    ("PPM Ar-Royyaan Baitul Hamdi Yogyakarta", -7.389040, 110.373854, "Yogyakarta"),
    ("PPM Al Hikmah Semarang", -6.560265, 110.307936, "Semarang"),
    ("PPM Bina Khoirul Insan Semarang", -6.451109, 110.307936, "Semarang"),
    ("PPM Sulthon Aulia Jakarta Timur", -5.884266, 107.347631, "Jakarta Timur"),
    ("PPM Al Kautsar Malang", -7.792756, 113.004212, "Malang"),
    ("PPM Baitul Hamdi Yogyakarta", -7.585893, 110.367493, "Yogyakarta"),
    ("PPM Al Musawwa Sukoharjo", -7.411615, 110.795960, "Sukoharjo"),
    ("PPM MINHAJUL HAQ Bandung", -6.684762, 107.977601, "Bandung"),
    ("PPM Baitul Ilmaini Bogor", -6.488314, 106.725159, "Bogor"),
    ("PPM Baitussalam Yogyakarta", -7.720213, 109.427796, "Yogyakarta"),
    ("PPM Jamiatul Amaliyah Palangkaraya", -1.938065, 114.856891, "Palangkaraya"),
    ("PPM Al Mukhlis Makassar", -4.940813, 120.232150, "Makassar"),
    ("PPM Khoirul Huda 3 Semampir Surabaya", -7.049944, 112.695745, "Surabaya"),
    ("PPM Roudhotul Jannah Solo", -7.414952, 111.451207, "Solo"),
    ("PPM Baitus Shodiq Lampung", -5.157615, 106.379192, "Lampung"),
    ("PPM Khoirul Huda 1 Nginden Surabaya", -7.242442, 113.092994, "Surabaya"),
    ("PPM Baitul Akbar Kota Palu", -0.852691, 120.472230, "Palu"),
    ("PPM Baitul Makmur Jetis Surabaya", -7.035554, 112.975753, "Surabaya"),
    ("PPM Baitul Jannah Klaseman Malang", -7.885226, 112.937301, "Malang"),
    ("PPM Nurul Islam Samarinda", -0.415182, 117.802164, "Samarinda"),
    ("PPM Al Faqih Mandiri Depok", -6.302180, 106.319125, "Depok"),
    ("PPM Hudatul Jannah Lidah Surabaya", -7.179238, 112.129159, "Surabaya"),
    ("PPM Khoirul Huda 2 Keputih Surabaya", -7.214326, 113.091466, "Surabaya"),
]

for nama, lat, lng, kota in ppm:
    key = nama.lower()
    found = False
    for row in names:
        if row["nama"].lower() == key:
            row["lat"] = lat
            row["lng"] = lng
            row["kota"] = kota
            row["jenis"] = "ppm"
            found = True
            break
    if found:
        continue
    if key in seen:
        continue
    seen.add(key)
    kode = "lok-" + hashlib.md5(key.encode()).hexdigest()[:10]
    names.append(
        {
            "kode": kode,
            "nama": nama,
            "jenis": "ppm",
            "kota": kota,
            "alamat": None,
            "lat": lat,
            "lng": lng,
        }
    )

extra = [
    {
        "kode": "lok-gsg-bandung-utara",
        "nama": "GSG LDII Bandung Utara",
        "jenis": "gsg",
        "kota": "Bandung",
        "alamat": None,
        "lat": None,
        "lng": None,
    },
    {
        "kode": "lok-masjid-al-ikhlas",
        "nama": "Masjid Al-Ikhlas (LDII)",
        "jenis": "masjid",
        "kota": "Bandung",
        "alamat": "Jl. Masjid No. 10",
        "lat": None,
        "lng": None,
    },
    {
        "kode": "lok-dpp-ldii",
        "nama": "Kantor DPP LDII Jakarta",
        "jenis": "kantor",
        "kota": "Jakarta Selatan",
        "alamat": "Jl. Tentara Pelajar No. 28 Patal Senayan",
        "lat": -6.2185,
        "lng": 106.7972,
    },
]
for item in extra:
    if item["nama"].lower() not in seen:
        names.append(item)
        seen.add(item["nama"].lower())

names = sorted(names, key=lambda x: (x["jenis"], x["nama"].lower()))
(OUT / "lokasi_ldii.json").write_text(
    json.dumps(names, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("total", len(names), dict(Counter(x["jenis"] for x in names)))
