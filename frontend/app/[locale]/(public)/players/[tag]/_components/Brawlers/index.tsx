"use client";
import Image from "next/image";
import { brawlerBgColor } from "@/app/_lib/brawlerRarity";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import styles from "./index.module.scss";

export default function Brawlers({ player }: { player: any }) {
  return (
    <div className={styles.brawlersContainer}>
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src={"/brawler.png"}
            alt="icon"
            width={55}
            height={55}
            sizes="55px"
            style={{
              width: "55px",
              height: "auto",
              marginLeft: "3px",
            }}
          />
        </SheetTrigger>
        <SheetContent side="left" className={styles.brawlerSheetContent}>
          <div className={styles.brawlSheetInner}>
            <SheetHeader className={styles.brawlerSheetHeader}>
              <SheetTitle>{`${player?.brawlers?.filter((brawler: any) => brawler.power === 11).length} brawlers`}</SheetTitle>
              <SheetDescription>Brawlers with Power 11</SheetDescription>
            </SheetHeader>
            <div className={styles.brawlerListContainer}>
              {player?.brawlers
                ?.filter((brawler: any) => brawler.power === 11)
                .map((brawler: any) => {
                  return (
                    <div
                      key={brawler.id}
                      className={
                        brawler.name === "KAZE"
                          ? styles.kaze
                          : styles.brawlerItemContainer
                      }
                      style={{
                        backgroundColor: brawlerBgColor(brawler.name),
                      }}
                    >
                      <Image
                        src={`https://cdn.brawlify.com/brawlers/portraits/${brawler.id}.png`}
                        alt={brawler.name}
                        width={137}
                        height={114}
                        sizes="137px"
                        style={{
                          height: "100%",
                          width: "auto",
                          paddingBottom: "30px",
                        }}
                      />
                      <div className={styles.gadgetContainer}>
                        {brawler.gadgets &&
                          brawler.gadgets.length > 0 &&
                          brawler.gadgets.map((gadget: any, _index: number) => (
                            <div
                              className={styles.gadgetImageContainer}
                              key={gadget.id}
                            >
                              <Image
                                src={`https://cdn.brawlify.com/gadgets/borderless/${gadget.id}.png`}
                                alt={gadget.name}
                                width={18}
                                height={18}
                                sizes="18px"
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  position: "absolute",
                                  top: "11px",
                                  left: "11px",
                                }}
                              />
                              <Image
                                src={`/gadgetBg.png`}
                                alt={gadget.name}
                                width={40}
                                height={40}
                                sizes="40px"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                }}
                              />
                            </div>
                          ))}
                      </div>
                      <div className={styles.starPowerContainer}>
                        {brawler.starPowers &&
                          brawler.starPowers.length > 0 &&
                          brawler.starPowers.map(
                            (starPower: any, _index: number) => (
                              <div
                                className={styles.starPowerImageContainer}
                                key={starPower.id}
                              >
                                <Image
                                  src={`https://cdn.brawlify.com/star-powers/borderless/${starPower.id}.png`}
                                  alt={starPower.name}
                                  width={18}
                                  height={18}
                                  sizes="18px"
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                  }}
                                  className={styles.starPower}
                                />
                                <Image
                                  src={`/starPowerBadge.png`}
                                  alt={starPower.name}
                                  width={40}
                                  height={40}
                                  sizes="40px"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                  }}
                                />
                              </div>
                            ),
                          )}
                      </div>
                      <div className={styles.gearContainer}>
                        {brawler.gears &&
                          brawler.gears.length > 0 &&
                          brawler.gears.map((gear: any, index: number) => (
                            <Image
                              key={gear.id}
                              src={`https://cdn.brawlify.com/gears/regular/${gear.id}.png`}
                              alt={gear.name}
                              width={24}
                              height={24}
                              sizes="24px"
                              style={{
                                width: "24px",
                                height: "24px",
                                marginLeft:
                                  index === 0 ? "0" : `-${index * 16}px`,
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
