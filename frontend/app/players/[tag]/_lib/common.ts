export const shortenMapName = (mapName: string) => {
  const shortenMapName = mapName.length > 18 ? mapName.slice(0, 18) + '...' : mapName;
  return shortenMapName;
}

export const shortenPlayerName = (name: string) => {
   const shortenName = name && Array.from(name).length > 4
    ? Array.from(name).slice(0,4).join('')+ '...'
    : name;
  return shortenName;
}

export const appendToEightDigits = (base: number, num: number) => {
  const baseStr = base.toString();
  const numStr = num.toString();

  return (baseStr.slice(0, 8 - numStr.length) + numStr);
}
