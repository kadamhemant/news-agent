// News Agent Dashboard - Live Data Edition
// Fetches data from data/news.json and data/market.json (auto-updated by GitHub Actions)

let allNews = [];
let marketData = [];
let categoryChart = null;

// Fetch live data from JSON files (cache-busted with timestamp)
async function fetchLiveData() {
  const cacheBust = `?t=${Date.now()}`;

  try {
    const [newsRes, marketRes] = await Promise.all([
      fetch(`data/news.json${cacheBust}`, { cache: 'no-store' }),
      fetch(`data/market.json${cacheBust}`, { cache: 'no-store' })
    ]);

    if (!newsRes.ok || !marketRes.ok) {
      throw new Error('Failed to fetch data files');
    }

    allNews = await newsRes.json();
    marketData = await marketRes.json();

    console.log(`✅ Loaded ${allNews.length} news items and ${marketData.length} market prices`);
    return true;
  } catch (err) {
    console.error('❌ Failed to load live data:', err);
    return false;
  }
}

// Render market cards
function renderMarketCards(data) {
  const container = document.getElementById('marketCards');
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="loading">Loading market data...</div>';
    return;
  }
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
  if (!news || news.length === 0) {
    container.innerHTML = '<div class="loading">Loading news...</div>';
    return;
  }

  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="loading">No news found for this category</div>';
    return;
  }

  container.innerHTML = '';

  filtered.forEach(item => {
    const newsCard = document.createElement('div');
    newsCard.className = 'news-card';

    // Support both new (url) and legacy (full_url) data formats
    const articleUrl = item.url || item.full_url || '#';

    const link = document.createElement('a');
    link.href = articleUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'news-link';
    link.textContent = item.title;

    newsCard.innerHTML = `
      <h3></h3>
      <div class="news-meta">
        <span class="news-tag"></span>
        <span></span>
      </div>
      <p class="news-excerpt"></p>
      <div class="news-date"></div>
    `;

    newsCard.querySelector('h3').appendChild(link);
    newsCard.querySelector('.news-tag').textContent = (item.category || 'NEWS').toUpperCase();
    newsCard.querySelector('.news-meta').children[1].textContent = '• ' + (item.source || 'Unknown');
    newsCard.querySelector('.news-excerpt').textContent = item.excerpt || '';
    newsCard.querySelector('.news-date').textContent = item.date || '';

    container.appendChild(newsCard);
  });

  console.log(`📰 Rendered ${filtered.length} news items`);
}

function renderCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;

  const categoryCounts = {};
  allNews.forEach(news => {
    const cat = news.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
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
      animation: { animateScale: true, animateRotate: true }
    }
  });
}

function renderTimelineChart() {
  const container = document.getElementById('timelineChart');
  if (!container) return;

  const hourCounts = {};
  allNews.forEach(news => {
    if (!news.timestamp) return;
    const date = new Date(news.timestamp);
    const hour = date.toISOString().slice(0, 13);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const labels = Object.keys(hourCounts).sort();
  const data = labels.map(h => hourCounts[h]);

  container.innerHTML = '';

  if (labels.length === 0) {
    container.innerHTML = '<div class="loading">No timeline data available</div>';
    return;
  }

  const width = container.clientWidth || 400;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const svg = d3.select(container).append('svg')
    .attr('width', width).attr('height', height);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

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

  g.append('g').call(d3.axisLeft(y))
    .selectAll('text').style('fill', '#94a3b8');

  g.selectAll('.bar')
    .data(data).enter().append('rect')
    .attr('class', 'bar')
    .attr('x', (d, i) => x(labels[i]))
    .attr('y', d => y(d))
    .attr('width', x.bandwidth())
    .attr('height', d => height - margin.top - margin.bottom - y(d))
    .attr('fill', '#6366f1');
}

function renderCharts() {
  renderCategoryChart();
  renderTimelineChart();
}

function updateLastUpdateTime() {
  const now = new Date();
  document.getElementById('lastUpdate').textContent =
    `Last updated: ${now.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}`;
}

// Refresh button - re-fetches live data
async function loadData() {
  const btn = document.querySelector('.refresh-btn');
  const originalText = btn.textContent;
  btn.textContent = '⟳ Refreshing...';
  btn.disabled = true;

  const success = await fetchLiveData();
  if (success) {
    renderMarketCards(marketData);
    renderNews(allNews, getActiveFilter());
    renderCharts();
    updateLastUpdateTime();
  }

  btn.textContent = originalText;
  btn.disabled = false;
}

function getActiveFilter() {
  const activeTab = document.querySelector('.tab.active');
  return activeTab ? activeTab.dataset.category : 'all';
}

// Tab filtering
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderNews(allNews, tab.dataset.category);
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Dashboard initializing — fetching live data...');

  await fetchLiveData();

  renderMarketCards(marketData);
  renderNews(allNews);
  renderCharts();
  updateLastUpdateTime();

  // Auto-refresh every 5 minutes
  setInterval(async () => {
    console.log('🔄 Auto-refreshing live data...');
    await fetchLiveData();
    renderMarketCards(marketData);
    renderNews(allNews, getActiveFilter());
    renderCharts();
    updateLastUpdateTime();
  }, 300000);
});
