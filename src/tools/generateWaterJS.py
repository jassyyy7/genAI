import pandas as pd

# 1. CSV lokal (nach dem Download) laden
df = pd.read_csv("water-withdrawals-per-capita.csv")

# 2. Europäische Länder wie gehabt
european_countries = [ ... ]  # gleiche Liste wie vorher

print(df.columns.tolist())


# 3. Nur relevante Spalten
# df.columns zeigt z.B: ['Entity', 'Code', 'Year', 'Water withdrawals per capita (m^3)']
df = df[["Entity", "Year", "Total water withdrawal per capita"]]
df.columns = ["country", "year", "water"]


european_countries = [
    "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium",
    "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark",
    "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland",
    "Ireland", "Italy", "Kazakhstan", "Kosovo", "Latvia", "Liechtenstein", "Lithuania",
    "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
    "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia",
    "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom", "Vatican"
]


# 4. Filter auf Europa + aktuelle Jahre
df = df[df.country.isin(european_countries)]


# 5. Für jedes Land den letzten Wert extrahieren
latest = df.sort_values("year").groupby("country").tail(1)

# 6. JS-Objekt schreiben
output = "const waterData = {\n"
for _, r in latest.iterrows():
    output += f'    "{r.country}": {{ water: {r.water:.1f} }},\n'
output += "};\nexport default waterData;"

with open("../public/water.js", "w", encoding="utf-8") as f:
    f.write(output)

print("✅ water.js generiert –", len(latest), "Länder")
