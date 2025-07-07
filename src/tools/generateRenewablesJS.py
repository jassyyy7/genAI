import pandas as pd

# 1. Datei einlesen
df = pd.read_csv("renewable-share-energy.csv")

# 2. Relevante Spalten auswählen
df = df[["Entity", "Year", "Renewables (% equivalent primary energy)"]]
df.columns = ["country", "year", "renewables"]

# 3. Nur Europa, Jahr >= 2022
european = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
            "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
            "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia",
            "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro",
            "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal",
            "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia",
            "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom"]
df = df[df["country"].isin(european) & (df["year"] >= 2022)]

# 4. Neueste Werte pro Land auswählen
df = df.sort_values(["country", "year"]).drop_duplicates("country", keep="last")

# 5. JSON-Ausgabe erzeugen
js = "const renewablesData = " + df.set_index("country")["renewables"].to_json() + ";\nexport default renewablesData;"
with open("../public/renewables.js", "w", encoding="utf-8") as f:
    f.write(js)

print("✅ renewables.js generiert –", len(df), "Länder")
