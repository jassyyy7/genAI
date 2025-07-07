import pandas as pd

# CSV laden
df = pd.read_csv("average-exposure-pm25-pollution.csv")



# Relevante Spalten auswählen
print(df.columns.tolist())  # Nur zur Kontrolle
df = df[["Entity", "Year", "PM2.5 air pollution, mean annual exposure (micrograms per cubic meter)"]]
df.columns = ["country", "year", "pm25"]


# Europäische Länder definieren
european_countries = [
  "Albania","Andorra","Armenia","Austria","Azerbaijan","Belarus","Belgium",
  "Bulgaria","Croatia","Cyprus","Czechia","Denmark","Estonia","Finland",
  "France","Georgia","Germany","Greece","Hungary","Iceland","Ireland",
  "Italy","Kazakhstan","Kosovo","Latvia","Lithuania","Luxembourg","Malta",
  "Moldova","Monaco","Montenegro","Netherlands","North Macedonia","Norway",
  "Poland","Portugal","Romania","Russia","San Marino","Serbia","Slovakia",
  "Slovenia","Spain","Sweden","Switzerland","Turkey","Ukraine","United Kingdom","Vatican"
]


# Auf Europa & neueste Daten filtern (>= 2022)
df = df[df.country.isin(european_countries)]


# Neuesten Jahreswert pro Land herausholen
latest = df.sort_values("year").groupby("country").tail(1)

# JS-Datei schreiben
output = "const airData = {\n"
for _, r in latest.iterrows():
    output += f'  "{r.country}": {{ air: {r.pm25:.1f} }},\n'
output += "};\nexport default airData;"

with open("../public/air.js","w",encoding="utf-8") as f:
    f.write(output)

print("✅ air.js generiert –", len(latest), "Länder")
