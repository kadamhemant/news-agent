// News Agent Dashboard - JavaScript
// This file fetches and displays news data from the API

// Global state
let allNews = [];
let marketData = [];

// Sample data generator (replace with real API calls)
function getSampleMarketData() {
    return [
        { name: 'S&P 500', value: '5,234.18', change: '+1.24%', positive: true, trend: [5150, 5180, 5200, 5220, 5234] },
        { name: 'Dow Jones', value: '41,087.13', change: '+0.89%', positive: true, trend: [40700, 40850, 40950, 41020, 41087] },
        { name: 'NASDAQ', value: '16,447.20', change: '+1.42%', positive: true, trend: [16200, 16300, 16380, 16420, 16447] },
        { name: 'BTC-USD', value: '$67,234.50', change: '-2.15%', positive: false, trend: [68500, 68000, 67500, 67100, 67234] }
    ];
}

function getSampleNews() {
    return [
        {
            title: 'OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities',
            source: 'TechCrunch',
            category: 'ai',
            excerpt: 'OpenAI has unveiled GPT-5, featuring unprecedented reasoning abilities and multi-modal understanding...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now()
        },
        {
            title: 'Federal Reserve Signals Interest Rate Cut in Q3 2026',
            source: 'Reuters',
            category: 'finance',
            excerpt: 'Fed Chair Powell hints at potential rate reduction as inflation shows signs of cooling...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 3600000
        },
        {
            title: 'Tesla Stock Surges on Autonomous Vehicle Breakthrough',
            source: 'Bloomberg',
            category: 'finance',
            excerpt: 'TSLA jumps 8% after FSD Beta 12.0 shows remarkable improvements in complex driving scenarios...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 7200000
        },
        {
            title: 'Google DeepMind Achieves Major AI Safety Milestone',
            source: 'AI Research Blog',
            category: 'ai',
            excerpt: 'New alignment techniques demonstrate 95% reduction in undesirable model behaviors...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 10800000
        },
        {
            title: 'NVIDIA Unveils Next-Gen AI Chips for Large Language Models',
            source: 'VentureBeat',
            category: 'tech',
            excerpt: 'The new Blackwell architecture promises 10x performance improvements for LLM training...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 14400000
        },
        {
            title: 'SpaceX Starship Successfully Completes Orbital Refueling Test',
            source: 'Space.com',
            category: 'tech',
            excerpt: 'Major milestone achieved as SpaceX demonstrates critical technology for Mars missions...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 18000000
        },
        {
            title: 'Apple Vision Pro 2 Receives FDA Approval for Medical Applications',
            source: 'The Verge',
            category: 'tech',
            excerpt: 'New use cases in surgical training and telemedicine open up fresh market opportunities...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 21600000
        },
        {
            title: 'Crypto Market Sees Institutional Adoption surge',
            source: 'CoinDesk',
            category: 'finance',
            excerpt: 'Major pension funds allocate 5% of portfolios to digital assets following regulatory clarity...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 25200000
        },
        {
            title: 'Anthropic Releases Claude 3.5 with Enhanced Coding Abilities',
            source: 'Hacker News',
            category: 'ai',
            excerpt: 'New model scores 92% on human coding benchmarks, surpassing previous versions significantly...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 28800000
        },
        {
            title: 'Microsoft Invests $10B in AI Infrastructure Expansion',
            source: 'TechCrunch',
            category: 'tech',
            excerpt: 'Cloud giant announces massive datacenter buildout across three continents...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 32400000
        },
        {
            title: 'JPMorgan Launches AI-Powered Trading Platform',
            source: 'Financial Times',
            category: 'finance',
            excerpt: 'Wall Street bank deploys machine learning models for high-frequency trading strategies...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 36000000
        },
        {
            title: 'Meta Announces Open Source Llama 4 Series',
            source: 'AI Research Blog',
            category: 'ai',
            excerpt: 'New models available under permissive license, competing directly with closed source alternatives...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 39600000
        },
        {
            title: 'Quantum Computing Breakthrough: 1000-Qubit Processor Achieved',
            source: 'Nature',
            category: 'tech',
            excerpt: 'Researchers demonstrate error-corrected quantum computation at scale for the first time...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 43200000
        },
        {
            title: 'Bitcoin ETFs See Record $2B Weekly Inflows',
            source: 'Bloomberg',
            category: 'finance',
            excerpt: 'Institutional demand for Bitcoin exposure reaches all-time high post-approval...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 46800000
        },
        {
            title: 'Stability AI Releases Image Generation Model with Photorealistic Quality',
            source: 'MIT Technology Review',
            category: 'ai',
            excerpt: 'New diffusion model achieves human-level visual fidelity in benchmark tests...',
            url: '#',
            date: new Date().toISOString(),
            timestamp: Date.now() - 50400000
        }
    ].map(news => ({
        ...news,
        date: new Date(news.timestamp).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }));
}

// Load market data
async function loadMarketData() {
    try {
        // Try to fetch from local data file first, fallback to sample
        try {
            const response = await fetch('/data/market.json');
            if (response.ok) {
                marketData = await response.json();
            }
        } catch (e) {
            console.log('Using sample market data');
            marketData = getSampleMarketData();
        }
        
        renderMarketCards(marketData);
    } catch (error) {
        console.error('Error loading market data:', error);
        marketData = getSampleMarketData();
        renderMarketCards(marketData);
    }
}

// Load news data
async function loadNewsData() {
    try {
        // Try to fetch from local data file first, fallback to sample
        try {
            const response = await fetch('/data/news.json');
            if (response.ok) {
                allNews = await response.json();
            }
        } catch (e) {
            console.log('Using sample news data');
            allNews = getSampleNews();
        }
        
        updateLastUpdateTime();
        renderNews(allNews);
        renderCharts();
    } catch (error) {
        console.error('Error loading news data:', error);
        allNews = getSampleNews();
        updateLastUpdateTime();
        renderNews(allNews);
        renderCharts();
    }
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
        <div class="news-card" onclick="window.open('${item.url}', '_blank')">
            <h3><a href="${item.url}" target="_blank">${item.title}</a></h3>
            <div class="news-meta">
                <span class="news-tag">${item.category.toUpperCase()}</span>
                <span>• ${item.source}</span>
            </div>
            <p class="news-excerpt">${item.excerpt}</p>
            <div class="news-date">${item.date}</div>
        </div>
    `).join('');
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
    
    // Count news by category
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
                backgroundColor: [
                    '#6366f1', // indigo
                    '#06b6d4', // cyan
                    '#f59e0b', // amber
                    '#10b981'  // emerald
                ],
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
    
    // Group news by hour
    const hourCounts = {};
    allNews.forEach(news => {
        const date = new Date(news.timestamp);
        const hour = date.toISOString().slice(0, 13);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const labels = Object.keys(hourCounts).sort();
    const data = labels.map(h => hourCounts[h]);
    
    container.innerHTML = '';
    
    // Create D3 timeline chart
    const width = container.clientWidth || 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
        .domain(labels)
        .range([0, width - margin.left - margin.right])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, Math.max(...data) + 1])
        .range([height - margin.top - margin.bottom, 0]);
    
    // X axis
    g.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#94a3b8')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    // Y axis
    g.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#94a3b8');
    
    // Bars
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
    
    // Title
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
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Filter news
        const category = tab.dataset.category;
        renderNews(allNews, category);
    });
});

// Refresh button
function loadData() {
    const btn = document.querySelector('.refresh-btn');
    btn.textContent = '⟳ Loading...';
    loadData();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMarketData();
    loadNewsData();
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
        loadMarketData();
        loadNewsData();
    }, 300000);
});
