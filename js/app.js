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
    if (tabId === 'records') {
        fetchRecords();
    }
}

async function fetchRecords() {
    try {
        const response = await fetch('data/test_friidrott_data.json');
        if (!response.ok) throw new Error('Failed to load data');
        const data = await response.json();
        renderRecords(data.records);
        updateDashboardRank(data.records);
    } catch (error) {
        console.error('Error fetching records:', error);
    }
}

function renderRecords(records) {
    const tbody = document.querySelector('#view-records tbody');
    if (!tbody) return;
    tbody.innerHTML = ''; // Clear existing static rows

    records.forEach(record => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

        // Highlight logic
        const isMe = record.name === "Anna Andersson";
        if (isMe) {
            row.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
            row.style.borderLeft = '4px solid var(--color-accent)';
        }

        row.innerHTML = `
            <td style="padding: 1rem; font-weight: bold;">
                <span style="color: ${isMe ? 'var(--color-accent)' : '#94a3b8'}; font-family: var(--font-display);">#${record.rank}</span>
            </td>
            <td style="padding: 1rem; font-family: monospace; font-size: 1.1rem; color: var(--color-accent-gold);">${record.result}</td>
            <td style="padding: 1rem; font-weight: ${isMe ? 'bold' : 'normal'}; color: ${isMe ? 'white' : 'inherit'};">
                ${record.name} <span style="color: #64748b; font-size: 0.9em;">(${record.club})</span>
            </td>
            <td style="padding: 1rem; color: var(--color-text-secondary);">${record.date}</td>
            <td style="padding: 1rem; color: var(--color-text-secondary);">${record.location}</td>
        `;
        tbody.appendChild(row);
    });
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

function showAthleteProfile(id) {
    document.getElementById('athlete-list-view').style.display = 'none';
    document.getElementById('athlete-profile-view').style.display = 'block';
    window.scrollTo(0, 0);
}

function showAthleteList() {
    document.getElementById('athlete-list-view').style.display = 'block';
    document.getElementById('athlete-profile-view').style.display = 'none';
}
