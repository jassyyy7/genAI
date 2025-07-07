import pandas as pd

# 1. CSV-Datei laden
df = pd.read_csv("protected-terrestrial-biodiversity-sites.csv")

# 2. Europäische Länder
european_countries = [
    "Albania","Andorra","Armenia","Austria","Azerbaijan","Belarus","Belgium",
    "Bosnia and Herzegovina","Bulgaria","Croatia","Cyprus","Czechia","Denmark",
    "Estonia","Finland","France","Georgia","Germany","Greece","Hungary",
    "Iceland","Ireland","Italy","Kazakhstan","Kosovo","Latvia","Lithuania",
    "Luxembourg","Malta","Moldova","Monaco","Montenegro","Netherlands",
    "North Macedonia","Norway","Poland","Portugal","Romania","Russia",
    "San Marino","Serbia","Slovakia","Slovenia","Spain","Sweden",
    "Switzerland","Turkey","Ukraine","United Kingdom","Vatican"
]

# 3. Nur relevante Spalten
print(df.columns.tolist())  # zur Kontrolle
df = df[["Entity", "Year", "15.1.2 - Average proportion of Terrestrial Key Biodiversity Areas (KBAs) covered by protected areas (%) - ER_PTD_TERR"]]
df.columns = ["country", "year", "kba_pct"]

# 4. Filter: europäische Länder + aktuelle Jahre (z. B. ab 2020)
df = df[df.country.isin(european_countries) & (df.year >= 2020)]

# 5. Letzter Wert pro Land
latest = df.sort_values("year").groupby("country").tail(1)

# 6. In JS-Datei umwandeln
output = "const biodiversityData = {\n"
for _, r in latest.iterrows():
    output += f'    "{r.country}": {{ kba_pct: {r.kba_pct:.1f} }},\n'
output += "};\nexport default biodiversityData;"

with open("../public/biodiversity.js", "w", encoding="utf-8") as f:
    f.write(output)

print("✅ biodiversity.js generiert –", len(latest), "Länder")
