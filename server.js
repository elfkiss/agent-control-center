const http = require('http');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 8899;
const OPENCLAW_CONTAINER = process.env.OPENCLAW_CONTAINER || 'OpenClaw';
const USE_DOCKER = process.env.USE_DOCKER === 'true';

// Execute command (directly or via docker exec)
function execCmd(cmd) {
    try {
        if (USE_DOCKER) {
            const fullCmd = `docker exec ${OPENCLAW_CONTAINER} /bin/sh -c '${cmd}'`;
            const stdout = execSync(fullCmd, { 
                encoding: 'utf8',
                timeout: 15000,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            return { stdout, stderr: '' };
        } else {
            const fullCmd = `/bin/sh -c '${cmd}'`;
            const stdout = execSync(fullCmd, { 
                encoding: 'utf8',
                timeout: 15000 
            });
            return { stdout, stderr: '' };
        }
    } catch (error) {
        // Return error message in stdout so we can debug
        return { stdout: '', stderr: error.message };
    }
}

// Parse cron list from CLI output
function getCronJobs() {
    try {
        const { stdout, stderr } = execCmd('openclaw cron list 2>/dev/null');
        if (!stdout && stderr) {
            console.error('Cron error:', stderr);
            return { jobs: [], error: stderr };
        }
        
        const lines = stdout.trim().split('\n');
        const jobs = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.includes('ID  Name')) continue;
            
            const parts = line.split(/\s{2,}/).filter(p => p.trim());
            if (parts.length >= 6) {
                jobs.push({
                    id: parts[0],
                    name: parts[1],
                    schedule: parts[2],
                    next: parts[3],
                    last: parts[4],
                    status: parts[5],
                    target: parts[6] || '-',
                    agentId: parts[7] || '-',
                    model: parts[8] || '-'
                });
            }
        }
        
        return { jobs };
    } catch (e) {
        console.error('Cron error:', e.message);
        return { jobs: [], error: e.message };
    }
}

// Get health status
function getHealth() {
    try {
        const { stdout, stderr } = execCmd('openclaw health 2>/dev/null');
        return { output: stdout || stderr };
    } catch (e) {
        return { output: '', error: e.message };
    }
}

// Get status
function getStatus() {
    try {
        const { stdout, stderr } = execCmd('openclaw status 2>/dev/null');
        return { output: stdout || stderr };
    } catch (e) {
        return { output: '', error: e.message };
    }
}

// Combined dashboard data
function getDashboardData() {
    const cron = getCronJobs();
    const health = getHealth();
    const status = getStatus();
    
    return { cron, health, status };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    const url = req.url;
    
    try {
        if (url === '/api/health') {
            const data = getHealth();
            res.writeHead(200);
            res.end(JSON.stringify(data));
        } else if (url === '/api/cron') {
            const data = getCronJobs();
            res.writeHead(200);
            res.end(JSON.stringify(data));
        } else if (url === '/api/status') {
            const data = getStatus();
            res.writeHead(200);
            res.end(JSON.stringify(data));
        } else if (url === '/api/dashboard') {
            const data = getDashboardData();
            res.writeHead(200);
            res.end(JSON.stringify(data));
        } else if (url === '/' || url === '/index.html' || url === '/dashboard') {
            const fs = require('fs');
            const path = require('path');
            const htmlPath = path.join(__dirname, 'index.html');
            const html = fs.readFileSync(htmlPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    } catch (e) {
        console.error('Server error:', e);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
});

server.listen(PORT, () => {
    console.log(`🚀 OpenClaw 监控看板 running on http://localhost:${PORT}`);
    console.log(`   Dashboard: http://localhost:${PORT}/`);
    console.log(`   API: http://localhost:${PORT}/api/dashboard`);
    console.log(`   Docker mode: ${USE_DOCKER}, Container: ${OPENCLAW_CONTAINER}`);
});
