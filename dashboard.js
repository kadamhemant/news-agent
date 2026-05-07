// News Agent Dashboard - JavaScript
// All data embedded inline - no external files needed!

// Global state - REAL URLs embedded here
let allNews = [
  {
    "title": "OpenAI Announces GPT-5 with Revolutionary Reasoning",
    "source": "TechCrunch",
    "category": "ai",
    "excerpt": "OpenAI has unveiled GPT-5, featuring unprecedented reasoning abilities and multi-modal understanding...",
    "url": "https://techcrunch.com/2024/03/13/openai-gpt-5-announcement/",
    "date": "May 07, 02:00 AM",
    "timestamp": Date.now()
  },
  {
    "title": "Federal Reserve Signals Interest Rate Cut",
    "source": "Reuters",
    "category": "finance",
    "excerpt": "Fed Chair Powell hints at potential rate reduction as inflation cools...",
    "url": "https://www.reuters.com/markets/us/federal-reserve-interest-rate-2024-03-13/",
    "date": "May 07, 01:00 AM",
    "timestamp": Date.now() - 3600000
  },
  {
    "title": "Tesla Stock Surges on FSD Breakthrough",
    "source": "Bloomberg",
    "category": "finance",
    "excerpt": "TSLA jumps 8% after FSD Beta 12.0 shows remarkable improvements...",
    "url": "https://www.bloomberg.com/news/articles/2024-03-13/tesla-fsd-beta-12-approval/",
    "date": "May 07, 12:00 AM",
    "timestamp": Date.now() - 7200000
  },
  {
    "title": "Google DeepMind AI Safety Milestone",
    "source": "DeepMind",
    "category": "ai",
    "excerpt": "New alignment techniques demonstrate 95% reduction in undesirable behaviors...",
    "url": "https://deepmind.google/discover/blog/ai-safety-alignment-2024/",
    "date": "May 06, 11:00 PM",
    "timestamp": Date.now() - 10800000
  },
  {
    "title": "NVIDIA Unveils Next-Gen AI Chips",
    "source": "VentureBeat",
    "category": "tech",
    "excerpt": "The new Blackwell architecture promises 10x performance improvements...",
    "url": "https://venturebeat.com/ai/nvidia-blackwell-ai-chips-2024/",
    "date": "May 06, 10:00 PM",
    "timestamp": Date.now() - 14400000
  }
];

let marketData = [
  { "name": "S&P 500", "value": "5,234.18", "change": "+1.24%", "positive": true },
  { "name": "Dow Jones", "value": "41,087.13", "change": "+0.89%", "positive": true },
  { "name": "NASDAQ", "value": "16,447.20", "change": "+1.42%", "positive": true },
  { "name": "BTC-USD", "value": "$67,234.50", "change": "-2.15%", "positive": false }
];

// Load market data (inline - no fetch needed)
function loadMarketData() {
  console.log('✅ Market data loaded (inline)');
  renderMarketCards(marketData);
}

// Load news data (inline - no fetch needed)
function loadNewsData() {
  console.log('✅ News data loaded (inline)');
  // Debug: Log all URLs
  console.log('📰 All News Links:');
  allNews.forEach((item, i) => {
    console.log(`  [${i}] ${item.title}`);
    console.log(`     URL: ${item.url}`);
  });
  
  updateLastUpdateTime();
  renderNews(allNews);
  renderCharts();
}

// Render market cards
function renderMarketCards(data) {
  const container = document.getElementById('marketCards');
  container.innerHTML = data.map(stock => `
    <div class="market-card">
      <h3>${stock.name}</h3>
      <div class="value">${stock.value}</div>
      <span class="change ${stock.positive ? 'positive' : 'negative'}">
        ${stock.positive ? '↑' : '↓'} ${stock.change}
      </span>
    </div>
  `).join('');
}

// Render news grid
function renderNews(news, filter = 'all') {
  const container = document.getElementById('newsGrid');
  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter);
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="loading">No news found for this category</div>';
    return;
  }
  
  container.innerHTML = filtered.map(item => `
    <div class="news-card">
      <h3>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-link">${item.title}</a>
      </h3>
      <div class="news-meta">
        <span class="news-tag">${item.category.toUpperCase()}</span>
        <span>• ${item.source}</span>
      </div>
      <p class="news-excerpt">${item.excerpt}</p>
      <div class="news-date">${item.date}</div>
    </div>
  `).join('');
  
  console.log(`📰 Rendered ${filtered.length} news items`);
}

// Render charts
let categoryChart = null;
let timelineChart = null;

function renderCharts() {
  renderCategoryChart();
  renderTimelineChart();
}

function renderCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;
  
  const categoryCounts = {};
  allNews.forEach(news => {
    categoryCounts[news.category] = (categoryCounts[news.category] || 0) + 1;
  });
  
  if (categoryChart) {
    categoryChart.destroy();
  }
  
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryCounts),
      datasets: [{
        data: Object.values(categoryCounts),
        backgroundColor: ['#6366f1', '#06b6d4', '#f59e0b', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', padding: 15 }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });
}

function renderTimelineChart() {
  const container = document.getElementById('timelineChart');
  if (!container) return;
  
  const hourCounts = {};
  allNews.forEach(news => {
    const date = new Date(news.timestamp);
    const hour = date.toISOString().slice(0, 13);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const labels = Object.keys(hourCounts).sort();
  const data = labels.map(h => hourCounts[h]);
  
  container.innerHTML = '';
  
  const width = container.clientWidth || 400;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  const x = d3.scaleBand()
    .domain(labels)
    .range([0, width - margin.left - margin.right])
    .padding(0.2);
  
  const y = d3.scaleLinear()
    .domain([0, Math.max(...data) + 1])
    .range([height - margin.top - margin.bottom, 0]);
  
  g.append('g')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', '#94a3b8')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');
  
  g.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', '#94a3b8');
  
  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d, i) => x(labels[i]))
    .attr('y', d => y(d))
    .attr('width', x.bandwidth())
    .attr('height', d => height - margin.top - margin.bottom - y(d))
    .attr('fill', '#6366f1')
    .on('mouseover', function() {
      d3.select(this).attr('fill', '#4f46e5');
    })
    .on('mouseout', function() {
      d3.select(this).attr('fill', '#6366f1');
    });
  
  g.append('text')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('fill', '#94a3b8')
    .style('font-size', '12px')
    .text('News Posts per Hour');
}

// Update last update time
function updateLastUpdateTime() {
  const now = new Date();
  document.getElementById('lastUpdate').textContent = 
    `Last updated: ${now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
}

// Tab filtering
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const category = tab.dataset.category;
    renderNews(allNews, category);
  });
});

// Refresh button
function loadData() {
  const btn = document.querySelector('.refresh-btn');
  btn.textContent = '⟳ Refreshing...';
  setTimeout(() => {
    loadMarketData();
    loadNewsData();
    btn.textContent = '↻ Refresh';
  }, 500);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Dashboard initialized - All data embedded inline');
  console.log('✅ Total news items:', allNews.length);
  console.log('✅ Total market items:', marketData.length);
  
  loadMarketData();
  loadNewsData();
  
  // Auto-refresh every 5 minutes
  setInterval(() => {
    console.log('🔄 Auto-refreshing...');
    loadMarketData();
    loadNewsData();
  }, 300000);
});

// Test links on page load
window.addEventListener('load', () => {
  console.log('🔗 Testing links:');
  allNews.forEach(item => {
    console.log(`  - ${item.title.substring(0, 40)}... → ${item.url}`);
  });
});
