#!/usr/bin/env python3
"""
Live Data Generator for News Agent Dashboard
Fetches real-time news from NewsAPI and market data from Finnhub & CoinGecko
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime

# API Keys from environment variables
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY')

DASHBOARD_DIR = Path(__file__).parent / "data"

def fetch_live_news():
    """Fetch live news from NewsAPI"""
    try:
        if not NEWS_API_KEY:
            print("⚠️  NEWS_API_KEY not found, using sample data")
            return get_sample_news()

        url = "https://newsapi.org/v2/everything"
        params = {
            'q': 'technology OR AI OR finance OR stock market',
            'sortBy': 'publishedAt',
            'language': 'en',
            'pageSize': 10,
            'apiKey': NEWS_API_KEY
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        articles = data.get('articles', [])

        news_items = []
        for article in articles[:8]:  # Limit to 8 articles
            # Categorize based on title/description
            content = (article.get('title', '') + ' ' + article.get('description', '')).lower()
            if 'ai' in content or 'machine learning' in content or 'artificial' in content:
                category = 'ai'
            elif 'stock' in content or 'market' in content or 'finance' in content or 'bank' in content:
                category = 'finance'
            else:
                category = 'tech'

            news_item = {
                'title': article.get('title', 'News Item')[:100],
                'source': article.get('source', {}).get('name', 'News Source'),
                'category': category,
                'excerpt': article.get('description', article.get('content', ''))[:300],
                'url': article.get('url', 'https://www.google.com/search?q=news'),
                'date': datetime.now().strftime('%b %d, %I:%M %p'),
                'timestamp': datetime.now().isoformat(),
                'image': article.get('urlToImage')
            }
            news_items.append(news_item)

        print(f"✅ Fetched {len(news_items)} live news articles from NewsAPI")
        return news_items if news_items else get_sample_news()

    except Exception as e:
        print(f"❌ Error fetching news: {e}")
        return get_sample_news()

def fetch_live_market_data():
    """Fetch live market data from Finnhub and CoinGecko"""
    market_data = []

    try:
        if not FINNHUB_API_KEY:
            print("⚠️  FINNHUB_API_KEY not found, using sample market data")
            return get_sample_market_data()

        # Fetch US Index ETFs from Finnhub (free tier supports stocks/ETFs, not raw indices)
        indices = [
            {'symbol': 'SPY', 'name': 'S&P 500'},
            {'symbol': 'DIA', 'name': 'Dow Jones'},
            {'symbol': 'QQQ', 'name': 'NASDAQ'}
        ]

        for index in indices:
            try:
                url = f"https://finnhub.io/api/v1/quote"
                params = {
                    'symbol': index['symbol'],
                    'token': FINNHUB_API_KEY
                }

                response = requests.get(url, params=params, timeout=5)
                response.raise_for_status()

                quote = response.json()
                current_price = quote.get('c', 0)
                prev_close = quote.get('pc', 0)

                # Skip if data unavailable (Finnhub returns 0 for unsupported symbols)
                if current_price == 0 or prev_close == 0:
                    print(f"⚠️  No data available for {index['name']}, skipping")
                    continue

                change = current_price - prev_close
                change_percent = (change / prev_close * 100) if prev_close else 0

                market_data.append({
                    'name': index['name'],
                    'value': f"{current_price:,.2f}",
                    'change': f"{change_percent:+.2f}%",
                    'positive': change_percent >= 0
                })
            except Exception as e:
                print(f"⚠️  Could not fetch {index['name']}: {e}")

        # Fetch Bitcoin price from CoinGecko (no API key needed)
        try:
            url = "https://api.coingecko.com/api/v3/simple/price"
            params = {
                'ids': 'bitcoin',
                'vs_currencies': 'usd',
                'include_24hr_change': 'true'
            }

            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()

            data = response.json()
            btc_price = data.get('bitcoin', {}).get('usd', 0)
            btc_change = data.get('bitcoin', {}).get('usd_24h_change', 0)

            market_data.append({
                'name': 'BTC-USD',
                'value': f"${btc_price:,.2f}",
                'change': f"{btc_change:+.2f}%",
                'positive': btc_change >= 0
            })
        except Exception as e:
            print(f"⚠️  Could not fetch Bitcoin price: {e}")

        print(f"✅ Fetched {len(market_data)} live market prices")
        return market_data if market_data else get_sample_market_data()

    except Exception as e:
        print(f"❌ Error fetching market data: {e}")
        return get_sample_market_data()

def get_sample_news():
    """Fallback sample news data"""
    now = datetime.now()
    return [
        {
            "title": "OpenAI Announces GPT-5 with Revolutionary Reasoning",
            "source": "TechCrunch",
            "category": "ai",
            "excerpt": "OpenAI has unveiled GPT-5, featuring unprecedented reasoning abilities...",
            "url": "https://techcrunch.com/2024/03/13/openai-gpt-5-announcement/",
            "date": now.strftime('%b %d, %I:%M %p'),
            "timestamp": now.isoformat()
        },
        {
            "title": "Federal Reserve Signals Interest Rate Cut",
            "source": "Reuters",
            "category": "finance",
            "excerpt": "Fed Chair Powell hints at potential rate reduction as inflation cools...",
            "url": "https://www.reuters.com/markets/us/federal-reserve-interest-rate-2024-03-13/",
            "date": now.strftime('%b %d, %I:%M %p'),
            "timestamp": now.isoformat()
        },
        {
            "title": "Tesla Stock Surges on FSD Breakthrough",
            "source": "Bloomberg",
            "category": "finance",
            "excerpt": "TSLA jumps 8% after FSD Beta 12.0 shows remarkable improvements...",
            "url": "https://www.bloomberg.com/news/articles/2024-03-13/tesla-fsd-beta-12-approval/",
            "date": now.strftime('%b %d, %I:%M %p'),
            "timestamp": now.isoformat()
        },
        {
            "title": "NVIDIA Unveils Next-Gen AI Chips",
            "source": "VentureBeat",
            "category": "tech",
            "excerpt": "The new Blackwell architecture promises 10x performance improvements...",
            "url": "https://venturebeat.com/ai/nvidia-blackwell-ai-chips-2024/",
            "date": now.strftime('%b %d, %I:%M %p'),
            "timestamp": now.isoformat()
        }
    ]

def get_sample_market_data():
    """Fallback sample market data"""
    return [
        {"name": "S&P 500", "value": "5,234.18", "change": "+1.24%", "positive": True},
        {"name": "Dow Jones", "value": "41,087.13", "change": "+0.89%", "positive": True},
        {"name": "NASDAQ", "value": "16,447.20", "change": "+1.42%", "positive": True},
        {"name": "BTC-USD", "value": "$67,234.50", "change": "-2.15%", "positive": False}
    ]

def generate_dashboard_data():
    """Generate all dashboard data with live APIs"""
    DASHBOARD_DIR.mkdir(parents=True, exist_ok=True)

    # Fetch live news
    print("🚀 Fetching live news...")
    news_data = fetch_live_news()

    # Export news
    news_file = DASHBOARD_DIR / "news.json"
    with open(news_file, 'w') as f:
        json.dump(news_data, f, indent=2)
    print(f"✅ News data saved to {news_file}")

    # Fetch live market data
    print("📈 Fetching live market data...")
    market_data = fetch_live_market_data()

    # Export market data
    market_file = DASHBOARD_DIR / "market.json"
    with open(market_file, 'w') as f:
        json.dump(market_data, f, indent=2)
    print(f"✅ Market data saved to {market_file}")

    return news_data, market_data

if __name__ == "__main__":
    print("🌍 Generating dashboard data with live APIs...")
    generate_dashboard_data()
    print("✅ Done!")
