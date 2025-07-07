import pandas as pd

# 1. Daten von Our World in Data laden (CO₂ pro Kopf)
df = pd.read_csv("co2-per-capita.csv")


# 2. Liste europäischer Länder
european_countries = [
    "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina",
    "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany",
    "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kosovo", "Latvia", "Liechtenstein",
    "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
    "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia",
    "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom", "Vatican"
]

# 3. Nur relevante Spalten
df = df[["Entity", "Year", "Annual CO₂ emissions (per capita)"]]
df.columns = ["country", "year", "co2"]

# 4. Nur europäische Länder und Jahre >= 2022
df = df[df["country"].isin(european_countries)]
df = df[df["year"] >= 2022]

# 5. Neueste verfügbare Werte pro Land
latest = df.sort_values("year", ascending=False).drop_duplicates("country")

# 6. Speichern als JavaScript-Datei in public/countries.js
output_path = "../public/countries.js"
with open(output_path, "w", encoding="utf-8") as f:
    f.write("const countryData = {\n")
    for _, row in latest.iterrows():
        name = row["country"]
        co2 = round(row["co2"], 2)
        f.write(f'  "{name}": {{ co2: {co2} }},\n')
    f.write("};\n")

print(f"✅ countries.js erfolgreich geschrieben nach: {output_path}")
