#!/bin/bash
# Auto-extract data from Hermes Agent cron jobs and deploy dashboard

echo "🚀 Updating dashboard with fresh data..."

# Export data from cron jobs
python3 ~/news-agent/generate_data.py

if [ $? -eq 0 ]; then
    echo "✅ Data generated successfully"
    
    # Commit and push
    cd ~/news-agent
    git add data/
    git commit -m "Auto-update from Hermes Agent [skip ci]"
    git push origin main
    
    echo "✅ Dashboard committed & pushed!"
else
    echo "❌ Data generation failed"
    exit 1
fi

echo "🎉 Dashboard update complete!"
