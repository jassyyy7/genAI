import pandas as pd

# 1. Daten laden
df = pd.read_csv("mismanaged-plastic-waste-per-capita.csv")

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

# 3. Spalten prüfen & auswählen
print(df.columns.tolist())
df = df[["Entity", "Year", "Mismanaged plastic waste per capita (kg per year)"]]
df.columns = ["country", "year", "waste"]

# 4. Filter auf Europa, aktuellen Daten (z. B. ab 2015, wenn vorhanden)
df = df[df.country.isin(european_countries)]

# 5. Neuesten Jahr pro Land erhalten
latest = df.sort_values("year").groupby("country").tail(1)

# 6. JS-Datei erstellen
output = "const wasteData = {\n"
for _, r in latest.iterrows():
    output += f'    "{r.country}": {{ plasticWaste: {r.waste:.2f} }},\n'
output += "};\nexport default wasteData;"

with open("../public/waste.js","w",encoding="utf-8") as f:
    f.write(output)

print("✅ waste.js generiert –", len(latest), "Länder")
