import styles from './page.module.scss';
import Image from 'next/image';
import Record from '@/app/_components/Record'

type Player = {
  tag: string
  name: string
  nameColor: string
  iconId: number
  currentRank: number
  trophies: number
  highestTrophies: number
  vs3Victories: number
  soloVictories: number
  club: {
    tag: string
    name: string
    badgeId: number
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params;
  console.log("tag: ", tag);

  const res = await fetch(`http://app:3000/api/v1/players/${encodeURIComponent(tag)}`);
  console.log(`res: ${res.status} - ${res.body}`)
  const data: Player = await res.json();
  console.log("data: ", data);

  const appendToEightDigits = (base: number, num: number) => {
    const baseStr =  base.toString();
    const numStr = num.toString();

    return (baseStr.slice(0, 8 - numStr.length) + numStr);
  }


  return (
    <>
      <div className={styles.container}>
        <div className={styles.basicInfoContainer}>
          <div className={styles.iconContainer}>
            <Image
              src={`https://cdn.brawlify.com/profile-icons/regular/${data.iconId}.png`}
              alt="icon"
              width={80}
              height={80}
            />
            <h3>{data.tag}</h3>
          </div>
          <div className={styles.nameAndRankContainer}>
            <h1>{data.name}</h1>
            {data.currentRank &&
              <Image
                src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, data.currentRank)}.png`}
                alt="rank"
                height={60}
                width={60}
                style={{ height: "60px", width: "auto" }}
              />
            }
          </div>
        </div>
        <div className={styles.recordsContainer}>
          <Record label='シーズン記録' imagePath='/icon_trophy1.png' value={data.trophies} />
          <Record label='最多トロフィー数' imagePath='/icon_trophy1.png' value={data.trophies} />
          <Record label='3対3勝利数' imagePath='/3vs3.png' value={data.vs3Victories} />
          <Record label='勝利数' imagePath='https://cdn.brawlify.com/game-modes/regular/48000006.png' value={data.soloVictories} />
        </div>
        <div className={styles.clubContainer}>
          {
            data?.club?.badgeId ?
              <Image
                src={`https://cdn.brawlify.com/club-badges/regular/${data.club.badgeId}.png`}
                alt=''
                width={32}
                height={36}
              />
            : <div>?</div>
          }
          <div className={styles.clubNameContainer}>
            {data?.club?.name}
          </div>
        </div>
      </div>
    </>
  )
}
