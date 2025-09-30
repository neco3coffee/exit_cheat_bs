const arenaMapNameList = [
  "Arena og Glory",
  "knockout Grounds",
  "Mirage Arena",
  "The Smackdome",
];

const hockeyMapNameList = [
  "Super Center",
  "Slippery Slap",
  "Bouncy Bowl",
  "Below Zero",
  "Cool Box",
  "Starr Garden",
  "Snowcone Square",
  "Massive Meltdown",
  "Frostbite Rink",
  "Cold Snap",
];

const dodgeBrawlMapNameList = [
  "Moonbark Meadow",
  "Rebound Ring",
  "Hug or Hurl",
  "Side Hustle",
  "Squish Court",
  "Whispwillow Ward",
  "Dodge or Die",
];

export function classifyModeByMapName(mapName: string) {
  if (arenaMapNameList.includes(mapName)) {
    return "arena";
  } else if (hockeyMapNameList.includes(mapName)) {
    return "hockey";
  } else if (dodgeBrawlMapNameList.includes(mapName)) {
    return "dodgeball";
  } else {
    return "unknown";
  }
}
