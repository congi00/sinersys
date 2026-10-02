#!/usr/bin/env python3
"""
Allinea en.json, de.json, fr.json alla versione italiana aggiornata.

Uso:
    python update_translations.py en.json de.json fr.json
(il file viene riconosciuto dal nome: en / de / fr; sovrascrive in place,
 crea un backup <nome>.bak)
"""
import json, shutil, sys, os

KEYWORDS = {
    "en": "electric motor, APWEC, renewable energy, Sinersys, 6-phase engine, renewable energy generator, continuous energy, innovative electric motor, Italian energy patent, energy generator, green generator, green energy",
    "fr": "moteur électrique, APWEC, énergie renouvelable, Sinersys, moteur à 6 phases, générateur d'énergie renouvelable, énergie continue, moteur électrique innovant, brevet italien énergie, générateur d'énergie, générateur vert, énergie verte",
}

PATCHES = {
"en": {
 "apwec": {
  "static": {"f1": {"description": "APWEC's architecture allows the plant to be sized according to the user's energy needs."}},
  "howItWorks": {"shell1": {"desc": "A high-speed trigger jet enters the first annular Induction Chamber. The pressure difference generated according to Bernoulli's Principle draws atmospheric air from outside, progressively amplifying the airflow at each successive I.C. The material of the three vessels is steel, aluminium or reinforced plastic depending on the model, for maximum construction flexibility and cost reduction."}},
  "advantages": {
   "intro": "The basic concept is Simplicity. \nSimplicity of calculation, construction and operation.\nThe comparison between APWEC® and large conventional wind turbines highlights structural advantages that impact construction, maintenance, installation and operating costs. APWEC, a next-generation generator designed according to the automotive construction philosophy.",
   "a2": {"title": "Fewer components, large-series \"automotive\"-type production"},
   "a4": {"desc": "APWEC® can be installed inside buildings or outdoors. Installation adjacent to the end user reduces transmission losses and grid connection costs."},
   "vsDesc": "Large wind turbines exclusively exploit the dynamic pressure of external wind and require wind, tall towers, variable pitch mechanisms and maintenance at height.\nAPWEC® operates with a controlled internal flow, at ground level, regardless of external atmospheric conditions — a technically distinct and complementary category in the landscape of distributed renewable energy generation."
  }
 },
 "motore6fasi": {
  "slide0": {"subtitle": "The Italian constant-volume combustion engine with rotating connecting rod and semi-floating piston; compared with state-of-the-art engines, the M6F offers: more power, lower consumption, lower emissions."},
  "slide1": {"title": "The thermodynamic cycle reinvented: engine with isochoric function."},
  "slide3": {"suptitle": "Multiple Applications", "title": "Combustion efficiency improvement"},
  "static": {
   "p1": "The Motor Union Italia 6-Phase Engine is an internal combustion engine that realises a thermodynamic cycle in six phases over two revolutions of the crankshaft. The heart of the invention is the new crankshaft system: a predetermined-profile eccentric. This eliminates the classic dead centres and allows the kinematic law of the piston to be precisely defined.",
   "f2": {"description": "Integrated with the stepless automatic transmission, a further innovation, in manual version. The system adopts an innovative two-stroke engine with a 6-phase crank mechanism, operating with oil recovery."}
  }
 }
},
"de": {
 "apwec": {
  "static": {"f1": {"description": "Die Architektur von APWEC ermöglicht es, die Anlage entsprechend dem Energiebedarf des Benutzers zu dimensionieren."}},
  "howItWorks": {"shell1": {"desc": "Ein Hochgeschwindigkeits-Auslösestrahl tritt in die erste ringförmige Induktionskammer ein. Der gemäß dem Bernoulli-Prinzip erzeugte Druckunterschied zieht Außenluft von außen an und verstärkt die Luftstromrate an jeder nachfolgenden I.K. progressiv. Das Material der drei Vessels ist je nach Modell Stahl, Aluminium oder verstärkter Kunststoff, für maximale Konstruktionsflexibilität und Kostensenkung."}},
  "advantages": {
   "intro": "Das grundlegende Konzept ist Einfachheit. \nEinfachheit in Berechnung, Konstruktion und Betrieb.\nDer Vergleich zwischen APWEC® und großen konventionellen Windkraftanlagen zeigt strukturelle Vorteile, die sich auf Bau-, Wartungs-, Installations- und Betriebskosten auswirken. APWEC, ein Generator der neuesten Generation, nach der Automobilbauphilosophie konzipiert.",
   "a2": {"title": "Weniger Komponenten, Großserienproduktion nach \"Automotive\"-Art"},
   "a4": {"desc": "APWEC® kann in Gebäuden oder im Freien installiert werden. Die Installation in der Nähe des Endnutzers reduziert Übertragungsverluste und Netzanschlusskosten."},
   "vsDesc": "Große Windkraftanlagen nutzen ausschließlich den dynamischen Druck des Außenwinds und benötigen Wind, hohe Türme, Blattwinkelverstellmechanismen und Wartung in der Höhe.\nAPWEC® arbeitet mit einem kontrollierten internen Strom auf Bodenniveau, unabhängig von den äußeren atmosphärischen Bedingungen — eine technisch eigenständige und komplementäre Kategorie in der Landschaft der verteilten Erzeugung erneuerbarer Energie."
  }
 },
 "motore6fasi": {
  "slide0": {"subtitle": "Der italienische Antrieb mit Verbrennung bei konstantem Volumen, rotierender Pleuelstange und halbschwimmendem Kolben; der M6F bietet gegenüber modernen Motoren: mehr Leistung, weniger Verbrauch, weniger Emissionen."},
  "slide1": {"title": "Der thermodynamische Zyklus neu erfunden: Motor mit isochorer Funktion."},
  "slide3": {"suptitle": "Vielfältige Anwendungen", "title": "Effizienzsteigerung der Verbrennung"},
  "static": {
   "p1": "Der Motor Union Italia 6-Phasen-Motor ist ein Verbrennungsmotor, der in zwei Umdrehungen der Kurbelwelle einen thermodynamischen Zyklus in sechs Phasen realisiert. Das Herzstück der Erfindung ist das neue Kurbelwellensystem: ein Exzenter mit vorbestimmtem Profil. Dies eliminiert die klassischen Totpunkte und ermöglicht es, das kinematische Gesetz des Kolbens präzise zu definieren.",
   "f2": {"description": "Integriert mit dem stufenlosen Automatikgetriebe, einer weiteren Innovation, in manueller Version. Das System verwendet einen innovativen Zweitaktmotor mit 6-Phasen-Kurbeltrieb, der mit Ölrückgewinnung arbeitet."}
  }
 }
},
"fr": {
 "apwec": {
  "static": {"f1": {"description": "L'architecture d'APWEC permet de dimensionner l'installation selon les besoins énergétiques de l'utilisateur."}},
  "howItWorks": {"shell1": {"desc": "Un jet d'amorçage à haute vitesse entre dans la première Chambre d'Induction annulaire. La différence de pression générée selon le Principe de Bernoulli aspire l'air atmosphérique de l'extérieur, amplifiant progressivement le débit du flux-air à chaque C.d.I. successive. Le matériau des trois vessels est l'acier, l'aluminium ou le plastique renforcé selon le modèle, pour une flexibilité de construction maximale et une réduction des coûts."}},
  "advantages": {
   "intro": "Le concept de base est la Simplicité. \nSimplicité de calcul, de construction et de fonctionnement.\nLa comparaison entre APWEC® et les grands aérogénérateurs conventionnels met en évidence des avantages structurels qui impactent les coûts de construction, de maintenance, d'installation et d'exploitation. APWEC, générateur de toute nouvelle génération conçu selon la philosophie constructive automobile.",
   "a2": {"title": "Moins de composants, production en grande série de type « automotive »"},
   "a4": {"desc": "APWEC® peut être installé à l'intérieur de bâtiments ou en plein air. L'installation à proximité de l'utilisateur final réduit les pertes de transmission et les coûts de connexion au réseau."},
   "vsDesc": "Les grands aérogénérateurs exploitent exclusivement la pression dynamique du vent extérieur et nécessitent du vent, des tours élevées, des mécanismes à pas variable et une maintenance en hauteur.\nAPWEC® fonctionne avec un flux interne contrôlé, au niveau du sol, indépendamment des conditions atmosphériques extérieures — une catégorie techniquement distincte et complémentaire dans le panorama de la génération distribuée d'énergie renouvelable."
  }
 },
 "motore6fasi": {
  "slide0": {"subtitle": "Le propulseur italien à combustion à volume constant avec bielle rotative et piston semi-flottant ; par rapport aux moteurs de l'état de l'art, le M6F offre : plus de puissance, moins de consommation, moins d'émissions."},
  "slide1": {"title": "Le cycle thermodynamique réinventé : moteur à fonction isochore."},
  "slide3": {"suptitle": "Applications multiples", "title": "Amélioration de l'efficacité de la combustion"},
  "static": {
   "p1": "Le Moteur à 6 Phases de Motor Union Italia est un moteur à combustion interne qui réalise un cycle thermodynamique en six phases sur deux tours du vilebrequin. Le cœur de l'invention est le nouveau système de vilebrequin : un excentrique à profil prédéterminé. Ceci élimine les points morts classiques et permet de définir avec précision la loi cinématique du piston.",
   "f2": {"description": "Intégré à la transmission automatique stepless, autre innovation, en version manuelle. Le système adopte un moteur à deux temps innovant avec vilebrequin à 6 phases, fonctionnant avec récupération de l'huile."}
  }
 }
},
}


def deep_merge(dst, src):
    for k, v in src.items():
        if isinstance(v, dict) and isinstance(dst.get(k), dict):
            deep_merge(dst[k], v)
        else:
            dst[k] = v


def main(paths):
    for p in paths:
        stem = os.path.basename(p).lower()
        lang = next((l for l in ("en", "de", "fr") if stem.startswith(l)), None)
        if not lang:
            print(f"SKIP {p}: impossibile riconoscere la lingua dal nome")
            continue
        with open(p, encoding="utf-8") as f:
            data = json.load(f)
        shutil.copy(p, p + ".bak")
        deep_merge(data, PATCHES[lang])
        if lang in KEYWORDS:
            for section in ("homepage", "aboutus", "apwec", "motore6fasi"):
                data[section]["keywords"] = KEYWORDS[lang]
        with open(p, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"OK {p} ({lang}) aggiornato")


if __name__ == "__main__":
    main(sys.argv[1:])
