#!/usr/bin/env python3
"""
News Pulse — Live Headlines Generator
Fetches general news across 5 categories: Tech, AI, Finance, Business, World.
"""

import os
import re
import json
import requests
from pathlib import Path
from datetime import datetime, timedelta

NEWS_API_KEY = os.getenv('NEWS_API_KEY')
DATA_DIR = Path(__file__).parent / "data"

CATEGORIES = {
    'tech': {
        'query': '("technology" OR "tech industry" OR "Apple" OR "Google" OR "Microsoft" OR "Meta" OR "NVIDIA" OR "Tesla" OR "startup")',
        'limit': 8
    },
    'ai': {
        'query': '("artificial intelligence" OR "AI" OR "ChatGPT" OR "OpenAI" OR "Anthropic" OR "machine learning" OR "LLM" OR "generative AI")',
        'limit': 8
    },
    'finance': {
        'query': '("stock market" OR "Federal Reserve" OR "interest rates" OR "inflation" OR "Wall Street" OR "S&P 500" OR "earnings" OR "cryptocurrency" OR "Bitcoin")',
        'limit': 6
    },
    'business': {
        'query': '("business" OR "corporate" OR "merger" OR "acquisition" OR "IPO" OR "CEO" OR "earnings report" OR "layoffs")',
        'limit': 6
    },
    'world': {
        'query': '("world news" OR "international" OR "global" OR "geopolitics" OR "diplomacy" OR "United Nations" OR "summit")',
        'limit': 6
    }
}

RELEVANCE_KEYWORDS = {
    'tech': ['tech', 'technology', 'apple', 'google', 'microsoft', 'meta', 'nvidia', 'tesla', 'startup', 'silicon valley', 'iphone', 'android', 'software', 'hardware'],
    'ai': ['ai', 'artificial intelligence', 'chatgpt', 'openai', 'anthropic', 'claude', 'machine learning', 'llm', 'generative', 'neural', 'gemini', 'gpt'],
    'finance': ['stock', 'market', 'fed', 'reserve', 'interest', 'rate', 'inflation', 'wall street', 'sp 500', 'earnings', 'crypto', 'bitcoin', 'investment', 'fund'],
    'business': ['business', 'corporate', 'merger', 'acquisition', 'ipo', 'ceo', 'earnings', 'layoff', 'company', 'firm', 'revenue', 'profit'],
    'world': ['world', 'international', 'global', 'geopolitics', 'diplomacy', 'united nations', 'summit', 'foreign', 'country', 'minister', 'president']
}


def is_relevant(article, category):
    keywords = RELEVANCE_KEYWORDS.get(category, [])
    if not keywords:
        return True
    text = (article.get('title', '') + ' ' + (article.get('description') or '')).lower()
    return any(kw in text for kw in keywords)


def fetch_category_news(category_key, query, limit):
    if not NEWS_API_KEY:
        print(f"⚠️  NEWS_API_KEY not set, skipping {category_key}")
        return []

    try:
        from_date = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')

        url = "https://newsapi.org/v2/everything"
        params = {
            'q': query,
            'sortBy': 'publishedAt',
            'language': 'en',
            'pageSize': min(limit * 3, 30),
            'from': from_date,
            'apiKey': NEWS_API_KEY
        }

        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()

        data = response.json()
        articles = data.get('articles', [])

        items = []
        for article in articles:
            if not article.get('title') or article.get('title') == '[Removed]':
                continue
            if not is_relevant(article, category_key):
                continue

            published_at = article.get('publishedAt', '')
            try:
                ts = datetime.fromisoformat(published_at.replace('Z', '+00:00')).isoformat()
            except Exception:
                ts = datetime.now().isoformat()

            items.append({
                'title': article.get('title', '')[:160],
                'source': article.get('source', {}).get('name', 'Unknown'),
                'category': category_key,
                'excerpt': (article.get('description') or article.get('content') or '')[:300],
                'url': article.get('url', '#'),
                'image': article.get('urlToImage'),
                'date': datetime.now().strftime('%b %d, %I:%M %p'),
                'timestamp': ts,
                'published_at': published_at
            })

        items = items[:limit]
        print(f"✅ {category_key}: {len(items)} relevant stories")
        return items

    except Exception as e:
        print(f"❌ {category_key}: {e}")
        return []


def deduplicate(articles):
    seen_urls = set()
    seen_titles = set()
    unique = []
    for article in articles:
        url = article['url']
        norm_title = re.sub(r'[^\w\s]', '', (article['title'] or '').lower()).strip()
        norm_title = re.sub(r'\s+', ' ', norm_title)

        if url in seen_urls or (norm_title and norm_title in seen_titles):
            continue
        seen_urls.add(url)
        if norm_title:
            seen_titles.add(norm_title)
        unique.append(article)
    return unique


def generate_news():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_file = DATA_DIR / "news.json"

    # Daily reset at 8am EST (= 13:00 UTC) — first scheduled run of the day
    # wipes yesterday's history so the page shows "today's stories" only.
    utc_hour = datetime.utcnow().hour
    is_morning_reset = utc_hour == 13

    # Load existing history (unless it's the morning reset)
    existing_articles = []
    if is_morning_reset:
        print("🌅 Morning reset (8am EST) — starting fresh for today\n")
    elif output_file.exists():
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                existing_articles = json.load(f)
            print(f"📚 Loaded {len(existing_articles)} stories from today's history\n")
        except Exception as e:
            print(f"⚠️  Could not load history: {e}\n")

    # Fetch fresh stories from APIs
    new_articles = []
    for category_key, config in CATEGORIES.items():
        articles = fetch_category_news(category_key, config['query'], config['limit'])
        new_articles.extend(articles)

    print(f"\n🆕 Fetched {len(new_articles)} new articles this run")

    # Merge new + existing history, dedup by URL/title, keep newest first
    combined = new_articles + existing_articles
    unique = deduplicate(combined)
    unique.sort(key=lambda x: x.get('published_at', ''), reverse=True)

    # Cap at 120 articles to prevent unbounded growth
    unique = unique[:120]

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique, f, indent=2, ensure_ascii=False)

    print(f"\n📊 Total: {len(unique)} stories saved (this run + today's history)")

    breakdown = {}
    for article in unique:
        cat = article['category']
        breakdown[cat] = breakdown.get(cat, 0) + 1

    print("\n📂 Breakdown:")
    for cat, count in sorted(breakdown.items()):
        print(f"   {cat}: {count}")

    return unique


if __name__ == "__main__":
    print("📰 News Pulse — fetching live headlines...\n")
    generate_news()
    print("\n✅ Done!")
