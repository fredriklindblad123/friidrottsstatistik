function switchTab(tabId) {
    // Update Navigation
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + tabId).classList.add('active');

    // Update Views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + tabId).classList.add('active');

    // Reset Athlete view to list when switching tabs
    if (tabId === 'athletes') {
        showAthleteList();
    }

    // Load data if switching to records view
    // Load data if switching to records view
    // Load data if switching to records view
    // Load data if switching to records view
    if (tabId === 'national') {
        fetchSvenskaRecords();
    } else {
        // Default to Year's Best if not already loaded
        if (allRecords.length === 0) fetchRecords();
    }
}

// Global data store
let allRecords = [];

async function fetchRecords() {
    try {
        const response = await fetch('data/records.json');
        if (!response.ok) throw new Error('Failed to load data');
        const data = await response.json();
        allRecords = data.records; // Store globally
        allRecords = data.records; // Store globally
        setupFilters();
        applyFilters();
        updateDashboardRank(allRecords);
    } catch (error) {
        console.error('Error fetching records:', error);
    }
}

async function fetchSvenskaRecords() {
    try {
        const response = await fetch('data/swe_records.json');
        if (!response.ok) throw new Error('Failed to load records');
        const data = await response.json();
        renderSvenskaRecords(data.records);
    } catch (error) {
        console.error('Error fetching records:', error);
    }
}

function renderSvenskaRecords(records) {
    const tbody = document.querySelector('#view-records tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    records.forEach(record => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

        row.innerHTML = `
            <td style="padding: 1rem; font-weight: bold; color: var(--color-accent);">${record.event}</td>
            <td style="padding: 1rem; font-family: monospace; font-size: 1.1rem; color: var(--color-accent-gold);">${record.result}</td>
            <td style="padding: 1rem; color: white;">${record.name}</td>
            <td style="padding: 1rem; color: var(--color-text-secondary);">${record.category === 'M' ? 'Män' : 'Kvinnor'}</td>
            <td style="padding: 1rem; color: var(--color-text-secondary);">SR</td>
        `;
        tbody.appendChild(row);
    });
}



function setupFilters() {
    ['filter-gender', 'filter-age', 'filter-event', 'filter-season'].forEach(id => {
        document.getElementById(id).addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const gender = document.getElementById('filter-gender').value;
    const age = document.getElementById('filter-age').value;
    const event = document.getElementById('filter-event').value;
    const season = document.getElementById('filter-season').value;

    const filtered = allRecords.filter(r => {
        // Gender (strict match)
        if (gender !== 'all' && r.gender !== gender) return false;

        // Age (partial match logic needed? or strict?)
        // Scraper uses "F17", "P17", "M", "K".
        // Filter values: "17", "Senior", "all"
        if (age !== 'all') {
            if (age === 'Senior') {
                if (r.age_class !== 'M' && r.age_class !== 'K') return false;
            } else {
                // Check if age class contains the number (e.g. "P17" contains "17")
                if (!r.age_class.includes(age)) return false;
            }
        }

        // Event
        if (event !== 'all' && r.event !== event) return false;

        // Season
        if (season !== 'both' && r.season !== season) return false;

        return true;
    });

    renderRecords(filtered);
}

function renderRecords(records) {
    const tbody = document.querySelector('#view-records tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Limit to 100 to avoid freezing DOM
    records.slice(0, 100).forEach(record => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        row.onclick = () => showAthleteProfile(record.name);
        row.style.cursor = 'pointer';

        const isMe = record.name === "Anna Andersson";
        if (isMe) {
            row.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
            row.style.borderLeft = '4px solid var(--color-accent)';
        }

        row.innerHTML = `
            <td style="padding: 1rem; font-weight: bold;">
                <span style="color: ${isMe ? 'var(--color-accent)' : '#94a3b8'}; font-family: var(--font-display);">#${record.rank}</span>
            </td>
            <td style="padding: 1rem; font-weight: bold; color: var(--color-accent);">${record.event}</td>
            <td style="padding: 1rem; font-family: monospace; font-size: 1.1rem; color: var(--color-accent-gold);">${record.result}</td>
            <td style="padding: 1rem; font-weight: ${isMe ? 'bold' : 'normal'}; color: ${isMe ? 'white' : 'inherit'};">
                ${record.name}
            </td>
            <td style="padding: 1rem; color: var(--color-text-secondary);">${record.club}</td>
            <td style="padding: 1rem; color: var(--color-text-secondary);">${record.date}</td>
            <td style="padding: 1rem; color: var(--color-text-secondary);">${record.location}</td>
        `;
        tbody.appendChild(row);
    });

    if (records.length === 0) {
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #94a3b8;">Inga resultat hittades för valda filter.</td></tr>';
        }
    }
}

function updateDashboardRank(records) {
    // Find my rank
    const myRecord = records.find(r => r.name === "Anna Andersson");
    if (myRecord) {
        // Find existing or create new widget
        // logic: find the "Club Pulse" card (2nd card in dashboard)
        const cards = document.querySelectorAll('#view-dashboard .card');
        if (cards.length >= 2) {
            const clubPulseCard = cards[1];
            clubPulseCard.innerHTML = `
                <h2>Din Ranking (Top 50)</h2>
                <div style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 1rem;">F16 800m - Sverige</div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                    <span style="font-size: 3rem; font-weight: bold; color: var(--color-accent); font-family: var(--font-display);">#${myRecord.rank}</span>
                    <div style="text-align: right;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: white;">${myRecord.result}</div>
                        <div style="font-size: 0.8rem; color: #4ade80;">Top 10%</div>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.3rem;">Nästa rygg att ta:</div>
                    <div style="font-weight: bold; color: white;">Maja Mästare (#4)</div>
                    <div style="font-size: 0.8rem; color: var(--color-accent-gold);">0.45 sek bort</div>
                </div>
            `;
        }
    }
}

function showAthleteProfile(name) {
    // Ensure we have data
    if (allRecords.length === 0) fetchRecords(); // Try fetch if empty, though async issues might occur. Ideally call ensuring promise.

    // Filter records for this athlete name
    // Sorting by date (Newest first)
    const athleteRecords = allRecords.filter(r => r.name === name).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (athleteRecords.length === 0) return; // Should not happen in demo

    const latest = athleteRecords[0];

    // Update Header
    document.querySelector('.profile-info h1').textContent = latest.name;
    document.querySelector('.profile-meta').textContent = `Född ${latest.birth_year} | ${latest.age_class} | ${latest.club}`;
    document.querySelector('.avatar-placeholder').textContent = latest.name.split(' ').map(n => n[0]).join('').substring(0, 2); // Initials

    // Update PBs List
    const pbContainer = document.querySelector('.grid .card:last-child'); // The PB card
    // Reset to header
    pbContainer.innerHTML = '<h2>Resultathistorik</h2>';

    athleteRecords.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'record-item';
        div.innerHTML = `
            <div>
                <div style="font-weight: bold;">800m</div>
                <div style="font-size: 0.875rem; color: var(--color-text-secondary);">${rec.location} (${rec.date.substring(0, 4)})</div>
            </div>
            <div class="record-time">${rec.result}</div>
        `;
        pbContainer.appendChild(div);
    });

    // Update Chart
    renderChart(athleteRecords);

    // Switch View
    document.getElementById('athlete-list-view').style.display = 'none';
    document.getElementById('athlete-profile-view').style.display = 'block';
    window.scrollTo(0, 0);
}

function renderChart(records) {
    // Sort oldest to newest for chart
    const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Parse times to seconds for Y-axis
    const dataPoints = sorted.map(r => {
        const parts = r.result.split(':');
        const seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
        return { date: r.date.substring(0, 4), value: seconds, display: r.result };
    });

    // Determine scale
    const minVal = Math.min(...dataPoints.map(d => d.value)) - 2;
    const maxVal = Math.max(...dataPoints.map(d => d.value)) + 2;
    const height = 300;
    const width = 800; // Viewbox width
    const paddingX = 50;
    const paddingY = 50;
    const usableHeight = height - (paddingY * 2);
    const usableWidth = width - (paddingX * 2);

    // Map points to SVG coordinates
    const points = dataPoints.map((d, i) => {
        const x = paddingX + (i / (dataPoints.length - 1 || 1)) * usableWidth;
        const normalizedValue = (d.value - minVal) / (maxVal - minVal);
        const y = (height - paddingY) - (normalizedValue * usableHeight); // Invert Y because SVG 0 is top
        return `${x},${y}`;
    }).join(' ');

    // Update SVG
    const svg = document.querySelector('.chart-container svg');
    svg.innerHTML = ''; // Wipe clean

    // Grid (simple)
    for (let i = 0; i <= 3; i++) {
        const y = paddingY + (i / 3) * usableHeight;
        svg.innerHTML += `<line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" class="chart-grid" />`;
    }

    // Line
    svg.innerHTML += `<polyline points="${points}" class="chart-line" />`;

    // Dots and Labels
    dataPoints.forEach((d, i) => {
        const x = paddingX + (i / (dataPoints.length - 1 || 1)) * usableWidth;
        const normalizedValue = (d.value - minVal) / (maxVal - minVal);
        const y = (height - paddingY) - (normalizedValue * usableHeight);

        svg.innerHTML += `<circle cx="${x}" cy="${y}" class="chart-dot" />`;
        svg.innerHTML += `<text x="${x}" y="${280}" fill="#64748b" font-size="12" text-anchor="middle">${d.date}</text>`;

        // Value label above dot
        svg.innerHTML += `<text x="${x}" y="${y - 15}" fill="var(--color-accent)" font-weight="bold" font-size="12" text-anchor="middle">${d.display}</text>`;
    });

    // Y Axis Labels (Min/Max)
    // Simplified for demo
}

function showAthleteList() {
    document.getElementById('athlete-list-view').style.display = 'block';
    document.getElementById('athlete-profile-view').style.display = 'none';
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof fetchRecords === 'function') {
        fetchRecords();
    }
});
