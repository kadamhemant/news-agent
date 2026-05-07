# News Agent Dashboard

A live demo dashboard powered by GitHub Pages, displaying real-time market data and curated news headlines.

## 🚀 Features

- **Live Stock Market Data**: Real-time updates for S&P 500, Dow Jones, NASDAQ, and Bitcoin
- **Curated News Headlines**: AI/tech, finance, and trending topics from top sources
- **Interactive Charts**: 
  - Category distribution (Doughnut chart)
  - News timeline over time (Bar chart with D3)
- **Auto-Updates**: GitHub Actions cron job updates data every hour
- **Responsive Design**: Works beautifully on desktop and mobile

## 📊 Live Demo

Visit the dashboard at: **https://kadamhemant.github.io/news-agent/**

## 🛠️ Setup

### 1. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Select **Deploy from a branch**
4. Choose `main` branch and `/ (root)` folder
5. Click **Save**

### 2. Configure Data Updates

The dashboard includes a GitHub Actions workflow that updates data automatically. To customize:

1. Edit `.github/workflows/update-dashboard.yml`
2. Modify the data fetching scripts in Python
3. Integrate with real APIs (see below)

### 3. Integrate Real APIs (Optional)

Replace the sample data with real API calls:

```python
# Example: Fetch stock data from Alpha Vantage
import requests

def get_stock_data():
    api_key = 'YOUR_API_KEY'
    response = requests.get(
        f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}'
    )
    return response.json()

# Example: Fetch news from NewsAPI
def get_news_data():
    api_key = 'YOUR_API_KEY'
    response = requests.get(
        f'https://newsapi.org/v2/everything?q=technology&sortBy=publishedAt&apiKey={api_key}'
    )
    return response.json()
```

## 📁 File Structure

```
news-agent/
├── index.html              # Main dashboard HTML
├── styles.css              # Modern dark theme CSS
├── dashboard.js            # Frontend JavaScript logic
├── data/
│   ├── market.json         # Stock market data (auto-updated)
│   └── news.json           # News headlines (auto-updated)
└── .github/
    └── workflows/
        └── update-dashboard.yml  # Auto-update cron job
```

## 🎨 Customization

### Colors and Theme

Edit `styles.css` to customize:
- Primary colors (currently `#6366f1` - indigo)
- Background colors
- Fonts and spacing

### Data Sources

Modify in `.github/workflows/update-dashboard.yml`:
- Replace sample market data with real API calls
- Integrate with your news aggregation backend
- Fetch from your Hermes Agent cron job outputs

### Chart Types

`dashboard.js` uses:
- **Chart.js** for category distribution
- **D3.js** for timeline visualization

Replace or add custom chart types as needed.

## 🔧 Maintenance

### Manual Update

Trigger a manual data update:
1. Go to **Actions** tab in GitHub
2. Select "Update News Dashboard"
3. Click **Run workflow**

### Update Schedule

Default: Every hour at minute `0`
```yaml
- cron: '0 * * * *'
```

Customize in `.github/workflows/update-dashboard.yml`

## 🌟 Deployment Checklist

Before going live:

- [ ] Enable GitHub Pages in repository settings
- [ ] Replace sample data with real API integration
- [ ] Update logo and branding
- [ ] Test responsive design on mobile
- [ ] Verify auto-updates work correctly
- [ ] Add custom domain (optional)
- [ ] Set up monitoring/alerts

## 📈 Performance Tips

1. **Caching**: Browser auto-caches JSON files; add cache headers if needed
2. **Minification**: Run CSS/JS through minifiers for production
3. **CDN**: Use GitHub Pages CDN (automatic, fast globally)
4. **Refresh Rate**: Balance between freshness and API limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the dashboard locally (`python -m http.server`)
5. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

---

**Built with ❤️ using Hermes Agent & GitHub Actions**

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/kadamhemant/news-agent/update-dashboard.yml?branch=main)](https://github.com/kadamhemant/news-agent/actions)
[![GitHub Pages](https://img.shields.io/badge/Powered%20by-GitHub%20Pages-blue?logo=github)](https://pages.github.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
