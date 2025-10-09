# Rank System Documentation

## Overview
The application tracks player ranks from Brawl Stars solo ranked battles. The `rank` field in the database stores the **rank tier** (0-21), not the raw trophy count.

## Rank Tiers
Brawl Stars uses a tiered ranking system where trophy count determines the rank tier:

| Trophy Range | Rank Tier |
|--------------|-----------|
| 0 - 99       | 0         |
| 100 - 199    | 1         |
| 200 - 299    | 2         |
| 300 - 399    | 3         |
| 400 - 499    | 4         |
| 500 - 599    | 5         |
| 600 - 699    | 6         |
| 700 - 799    | 7         |
| 800 - 899    | 8         |
| 900 - 999    | 9         |
| 1000 - 1099  | 10        |
| 1100 - 1199  | 11        |
| 1200 - 1299  | 12        |
| 1300 - 1399  | 13        |
| 1400 - 1499  | 14        |
| 1500 - 1599  | 15        |
| 1600 - 1699  | 16        |
| 1700 - 1799  | 17        |
| 1800 - 1899  | 18        |
| 1900 - 1999  | 19        |
| 2000 - 2099  | 20        |
| 2100+        | 21        |

## Implementation

### Backend
- `PlayerFetcher#trophies_to_rank_tier(trophies)` converts trophy count to rank tier
- `PlayerFetcher#calculate_latest_solo_ranked_trophies` extracts trophies from battle log and converts to tier
- `UpdateSoloRankedRanksJob` updates player ranks asynchronously after battles

### Frontend
- Search results display rank tier icon using `player.rank` (0-21)
- Player details display rank tier icon using `player.currentRank` (0-21)
- Both values come from the same database field and should always match

## Bug Fix
Previously, the system was storing raw trophy counts (0-10000+) in the `rank` field instead of rank tiers (0-21). This caused:
1. Incorrect rank icons displayed in the UI
2. Rank search filtering to not work properly (searching for rank 5 would only find players with 5 trophies)
3. Mismatch between search results and player details

The fix converts trophy counts to rank tiers before storing them in the database.
