const normal = ["SHELLY"];

const rare = [
  "NITA",
  "COLT",
  "BULL",
  "BROCK",
  "EL PRIMO",
  "BARLEY",
  "POCO",
  "ROSA",
];

const superRare = [
  "JESSIE",
  "DYNAMIKE",
  "TICK",
  "8-BIT",
  "RICO",
  "DARRYL",
  "PENNY",
  "CARL",
  "JACKY",
  "GUS",
];

const hyperRare = [
  "BO",
  "EMZ",
  "STU",
  "PIPER",
  "PAM",
  "FRANK",
  "BIBI",
  "BEA",
  "NANI",
  "EDGAR",
  "GRIFF",
  "GROM",
  "BONNIE",
  "GALE",
  "COLETTE",
  "BELLE",
  "ASH",
  "LOLA",
  "SAM",
  "MANDY",
  "MAISIE",
  "HANK",
  "PEARL",
  "LARRY & LAWRIE",
  "ANGELO",
  "BERRY",
  "SHADE",
  "MEEPLE",
  "TRUNK",
];

const ultraRare = [
  "MORTIS",
  "TARA",
  "GENE",
  "MAX",
  "MR. P",
  "SPROUT",
  "BYRON",
  "SQUEAK",
  "LOU",
  "RUFFS",
  "BUZZ",
  "FANG",
  "EVE",
  "JANET",
  "OTIS",
  "BUSTER",
  "GRAY",
  "R-T",
  "WILLOW",
  "DOUG",
  "CHUCK",
  "CHARLIE",
  "MICO",
  "MELODIE",
  "LILY",
  "CLANCY",
  "MOE",
  "JUJU",
  "OLLIE",
  "LUMI",
  "MINA",
  "FINX",
  "JAE-YONG",
  "ALLI",
];

const legendary = [
  "SPIKE",
  "CROW",
  "LEON",
  "SANDY",
  "AMBER",
  "MEG",
  "SURGE",
  "CHESTER",
  "CORDELIUS",
  "KIT",
  "DRACO",
  "KENJI",
];

const ultraLegendary = ["KAZE"];

export const brawlerBgColor = (name: string) => {
  if (normal.includes(name)) return "var(--brawler-normal) !important";
  if (rare.includes(name)) return "var(--brawler-rare) !important";
  if (superRare.includes(name)) return "var(--brawler-super-rare) !important";
  if (hyperRare.includes(name)) return "var(--brawler-hyper-rare) !important";
  if (ultraRare.includes(name)) return "var(--brawler-ultra-rare) !important";
  if (legendary.includes(name)) return "var(--brawler-legendary) !important";
  return "var(--blue-black)";
};
