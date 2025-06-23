# Date Filtering Update for AI News Aggregator

## Summary of Changes

I've analyzed and updated the RSS feed fetching script to address the issue of old articles from 2023-2024 being included in the news feed. Here are the key improvements:

### 1. Date Filtering Implementation

**Location**: `/scripts/fetch-news.js`

Added date filtering to only include articles from the last 7 days:
- Articles older than 7 days are now filtered out
- Articles with future dates are also filtered out (to handle RSS feeds with incorrect timestamps)

**Code changes**:
```javascript
// Calculate date range
const now = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

// Filter logic
if (articleDate < sevenDaysAgo || articleDate > now) {
  continue; // Skip this article
}
```

### 2. Improved RSS Feed Sources

Reorganized and prioritized RSS feeds based on update frequency:
- Added more frequently updated AI-specific news sources
- Prioritized feeds that publish multiple times daily
- Added specialized AI news feeds like:
  - `https://venturebeat.com/ai/feed/` (AI section specific)
  - `https://www.theverge.com/ai-artificial-intelligence/rss/index.xml`
  - `https://www.theregister.com/software/ai/headlines.atom`

### 3. Testing Tool

Created a new test script to verify date filtering:
- **File**: `/scripts/test-date-filter.js`
- **Usage**: `npm run test-date-filter`

This script tests a few RSS feeds and shows:
- How many articles are within the 7-day window
- How many are too old
- How many have future dates

## How to Use

1. **Update news with date filtering**:
   ```bash
   npm run update-news
   ```

2. **Test date filtering**:
   ```bash
   npm run test-date-filter
   ```

## Benefits

1. **Fresher Content**: Only shows articles from the last 7 days
2. **Better Sources**: Prioritized feeds that update frequently
3. **Data Validation**: Filters out articles with invalid future dates
4. **Transparency**: Console output now shows the date range being used

## Recommended RSS Feeds for Current AI News

Here are the best sources for real-time AI news (already added to the script):

1. **TechCrunch AI**: Daily updates on AI startups and technology
2. **VentureBeat AI**: Frequent business-focused AI news
3. **The Verge AI**: Consumer-focused AI news and reviews
4. **Marktechpost**: Very active, technical AI news
5. **AI News**: Dedicated AI news aggregator
6. **The Register AI**: Enterprise and technical AI coverage

## Next Steps

If you want to further customize the date range:
- Modify the `7` in `sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)` to any number of days
- For example, use `3` for last 3 days or `14` for last 2 weeks

The script will now ensure you only get recent, relevant AI news!