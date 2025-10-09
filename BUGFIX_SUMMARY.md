# Bug Fix Summary: Rank Display Issue

## Issue Description (Japanese)
**名前検索結果画面のプレイヤーリストのランクとプレイヤー詳細のランクが異なっている**

検索に指定したランクがプレイヤーリストのランクで表示されている。
ちゃんとランクで絞り込んで検索できてなさそう。

## Issue Translation
The rank shown in the player list on the name search results screen differs from the rank in the player details. The rank specified in the search appears to be displayed as the rank in the player list, and it seems like filtering by rank in the search is not working properly.

## Root Cause

### Before Fix
The `rank` column in the database was storing **raw trophy counts** (0-10000+) from solo ranked battles:

```ruby
# player_fetcher.rb (BEFORE)
brawler_trophies = player.dig('brawler', 'trophies')  # e.g., 1234 trophies
return brawler_trophies  # Stored 1234 in rank column ❌
```

This caused multiple problems:

1. **Display Issue**: Frontend tried to display rank tier icon for trophy count
   ```tsx
   // Tried to show icon for rank 1234 instead of rank 12
   <Image src={`.../${player.rank}.png`} />  // player.rank = 1234 ❌
   ```

2. **Search Filter Issue**: Rank search filter expected 0-21 but database had 0-10000+
   ```ruby
   # Searched for players with rank 0-3 (tiers)
   Player.where(rank: 0..3)
   # But actually found players with 0-3 trophies ❌
   ```

### After Fix
The `rank` column now stores **rank tiers** (0-21) derived from trophy counts:

```ruby
# player_fetcher.rb (AFTER)
brawler_trophies = player.dig('brawler', 'trophies')  # e.g., 1234 trophies
rank_tier = trophies_to_rank_tier(brawler_trophies)  # Converts to tier 12 ✅
return rank_tier  # Stored 12 in rank column ✅
```

## Trophy to Rank Tier Mapping

| Trophy Count | Rank Tier | Example |
|--------------|-----------|---------|
| 0-99         | 0         | New player |
| 100-199      | 1         | |
| 500-599      | 5         | |
| 1000-1099    | 10        | Mid-tier |
| 1500-1599    | 15        | |
| 2000-2099    | 20        | High-tier |
| 2100+        | 21        | Highest tier |

## Example Scenario

### Before Fix ❌
1. Player has 1234 trophies in solo ranked
2. System stores `rank = 1234` in database
3. Search for "rank 12" (tier 12, expecting 1200-1299 trophies)
4. Query: `WHERE rank BETWEEN 9 AND 15`
5. Result: No match (1234 is not between 9 and 15)
6. Frontend tries to display icon for rank 1234 (doesn't exist)

### After Fix ✅
1. Player has 1234 trophies in solo ranked
2. System converts: 1234 trophies → rank tier 12
3. System stores `rank = 12` in database
4. Search for "rank 12" (tier 12)
5. Query: `WHERE rank BETWEEN 9 AND 15`
6. Result: Match! (12 is between 9 and 15)
7. Frontend displays correct icon for rank tier 12

## Files Changed

### Backend
- `app/services/player_fetcher.rb`: Added `trophies_to_rank_tier()` method
- `app/jobs/update_solo_ranked_ranks_job.rb`: Uses conversion for async updates
- `app/models/player.rb`: Added validation for rank range 0-21

### Frontend
- `app/players/search/page.tsx`: Added `SearchResultPlayer` TypeScript type

### Tests
- `spec/services/player_fetcher_spec.rb`: Unit tests for conversion
- `spec/requests/players_search_rank_consistency_spec.rb`: Integration tests

### Documentation
- `RANK_SYSTEM.md`: Complete documentation of rank tier system
- `BUGFIX_SUMMARY.md`: This file

## Verification

To verify the fix works:

1. **Check stored values**: Rank values in database should be 0-21
2. **Test search**: Searching for rank 10 should return players with ~1000-1099 trophies
3. **Check display**: Rank icons should display correctly in both search list and player details
4. **Consistency**: Same player's rank should match in search results and detail view

## Migration Note

Existing data in the database may have incorrect rank values (trophy counts instead of tiers). A migration script may be needed to:
1. Identify players with rank > 21
2. Convert their rank values to proper tiers
3. Update the database

Example migration:
```ruby
Player.where('rank > 21').find_each do |player|
  # Assume the current rank value is actually trophy count
  trophy_count = player.rank
  rank_tier = trophies_to_rank_tier(trophy_count)
  player.update(rank: rank_tier)
end
```
