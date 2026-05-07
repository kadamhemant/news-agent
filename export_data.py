#!/usr/bin/env python3
"""
Data Export Script for News Agent Dashboard
Extracts data from Hermes Agent cron jobs and exports to JSON
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Get the correct data directory (adjacent to this script's parent)
BASE_DIR = Path(__file__).parent
if BASE_DIR.name != 'news-agent':
    BASE_DIR = BASE_DIR.parent

DASHBOARD_DIR = BASE_DIR / "data"
HERMES_DIR = Path.home() / ".hermes"
CRON_OUTPUT_DIR = HERMES_DIR / "cron" / "output"

def extract_daily_ai_news():
    """Extract data from daily-ai-news-digest cron job"""
    job_id = "9b46a4c3ca0f"
    job_dir = CRON_OUTPUT_DIR / job_id
    
    news_items = []
    
    if job_dir.exists():
        for item in job_dir.iterdir():
            if item.is_dir():
                for file in item.iterdir():
                    if file.suffix in ['.txt', '.md', '.json']:
                        try:
                            content = file.read_text()
                            news_items.append({
                                "title": "AI News - " + file.stem,
                                "source": "Hermes Agent - Daily AI News Digest",
                                "category": "ai",
                                "excerpt": content[:200] + "..." if len(content) > 200 else content,
                                "url": f"#",
                                "date": datetime.now().strftime('%b %d, %I:%M %p'),
                                "timestamp": datetime.now().isoformat()
                            })
                        except Exception as e:
                            print(f"Error reading {file}: {e}", file=sys.stderr)
    
    return news_items

def extract_morning_briefing():
    """Extract data from morning-briefing-bot cron job"""
    job_id = "62e8a1463612"
    job_dir = CRON_OUTPUT_DIR / job_id
    
    brief_items = []
    
    if job_dir.exists():
        for item in job_dir.iterdir():
            if item.is_dir():
                for file in item.iterdir():
                    if file.suffix in ['.txt', '.md']:
                        try:
                            content = file.read_text()
                            brief_items.append({
                                "title": f"Morning Briefing - {file.stem}",
                                "source": "Hermes Agent - Morning Briefing Bot",
                                "category": "tech",
                                "excerpt": content[:200] + "..." if len(content) > 200 else content,
                                "url": f"#",
                                "date": datetime.now().strftime('%b %d, %I:%M %p'),
                                "timestamp": datetime.now().isoformat()
                            })
                        except Exception as e:
                            print(f"Error reading {file}: {e}", file=sys.stderr)
    
    return brief_items

def get_fallback_news():
    """Fallback sample news data"""
    now = datetime.now()
    return [
        {
            "title": "OpenAI Announces GPT-5 with Revolutionary Reasoning",
            "source": "TechCrunch",
            "category": "ai",
            "excerpt": "OpenAI has unveiled GPT-5, featuring unprecedented reasoning abilities and multi-modal understanding...",
            "url": "#",
            "date": now.strftime('%b %d, %I:%M %p'),
            "timestamp": now.isoformat()
        },
        {
            "title": "Federal Reserve Signals Interest Rate Cut",
            "source": "Reuters",
            "category": "finance",
            "excerpt": "Fed Chair Powell hints at potential rate reduction as inflation shows signs of cooling...",
            "url": "#",
            "date": now.strftime('%b %d, %I:%M %p'),
            "timestamp": now.isoformat()
        }
    ]

def get_sample_market_data():
    """Sample stock market data"""
    return [
        {"name": "S&P 500", "value": "5,234.18", "change": "+1.24%", "positive": True},
        {"name": "Dow Jones", "value": "41,087.13", "change": "+0.89%", "positive": True},
        {"name": "NASDAQ", "value": "16,447.20", "change": "+1.42%", "positive": True},
        {"name": "BTC-USD", "value": "$67,234.50", "change": "-2.15%", "positive": False}
    ]

def export_data():
    """Export all data to JSON files"""
    DASHBOARD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Get real data from Hermes Agent
    news_data = extract_daily_ai_news() + extract_morning_briefing()
    
    # Use fallback if no data found
    if not news_data:
        print("⚠️ No Hermes Agent data found, using fallback data", file=sys.stderr)
        news_data = get_fallback_news()
    
    # Export news
    news_file = DASHBOARD_DIR / "news.json"
    with open(news_file, 'w') as f:
        json.dump(news_data, f, indent=2)
    print(f"✅ Exported {len(news_data)} news items to {news_file}")
    
    # Export market data
    market_data = get_sample_market_data()
    market_file = DASHBOARD_DIR / "market.json"
    with open(market_file, 'w') as f:
        json.dump(market_data, f, indent=2)
    print(f"✅ Exported {len(market_data)} market items to {market_file}")
    
    return news_data, market_data

if __name__ == "__main__":
    print("🚀 Exporting Hermes Agent data to dashboard...")
    export_data()
    print("✅ Done!")
