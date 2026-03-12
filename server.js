const http = require('http');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const PORT = process.env.PORT || 8899;
const OPENCLAW_CONTAINER = process.env.OPENCLAW_CONTAINER || 'openclaw-gateway';
const USE_DOCKER = process.env.USE_DOCKER === 'true';

// Execute command (directly or via docker exec)
async function execCmd(cmd) {
    if (USE_DOCKER) {
        const { exec: dockerExec } = require('child_process').promisify(require('child_process').exec);
        const fullCmd = `docker exec ${OPENCLAW_CONTAINER} ${cmd}`;
        return dockerExec(fullCmd, { timeout: 15000 });
    } else {
        return execPromise(cmd);
    }
}

// Parse cron list from CLI output
async function getCronJobs() {
    try {
        const { stdout } = await execCmd(`openclaw cron list 2>/dev/null`);
        const lines = stdout.trim().split('\n');
        const jobs = [];
        
        // Parse each line - output format is space-separated with wide columns
        // ID  Name  Schedule  Next  Last  Status  Target  Agent ID  Model
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.includes('ID  Name')) continue;
            
            // Use regex to properly parse the columns by position
            // The output uses wide spacing, try to extract meaningful parts
            const match = line.match(/^(\S+)\s+(\S+(?:\s+\S+)?)\s+(cron\s+.+?)\s+(in\s+\d+[mh]|\d+\w+\s+ago)\s+(\d+\w+\s+ago|in\s+\d+[mh])\s+(ok|running|error)\s+(\S+)\s+(\S+)?\s*(\S+)?/);
            
            if (match) {
                jobs.push({
                    id: match[1],
                    name: match[2],
                    schedule: match[3],
                    next: match[4],
                    last: match[5],
                    status: match[6],
                    target: match[7] || '-',
                    agentId: match[8] || '-',
                    model: match[9] || '-'
                });
            } else {
                // Fallback: simple split
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
        }
        
        return { jobs };
    } catch (e) {
        console.error('Cron error:', e.message);
        return { jobs: [], error: e.message };
    }
}

// Get health status
async function getHealth() {
    try {
        const { stdout } = await execCmd(`openclaw health 2>/dev/null`);
        return { output: stdout };
    } catch (e) {
        return { output: '', error: e.message };
    }
}

// Get status
async function getStatus() {
    try {
        const { stdout } = await execCmd(`openclaw status 2>/dev/null`);
        return { output: stdout };
    } catch (e) {
        return { output: '', error: e.message };
    }
}

// Combined dashboard data
async function getDashboardData() {
    const [cron, health, status] = await Promise.all([
        getCronJobs(),
        getHealth(),
        getStatus()
    ]);
    
    return { cron, health, status };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    // CORS
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
            const data = await getHealth();
            res.writeHead(200);
            res.end(JSON.stringify(data));
        } else if (url === '/api/cron') {
            const data = await getCronJobs();
            res.writeHead(200);
            res.end(JSON.stringify(data));
        } else if (url === '/api/status') {
            const data = await getStatus();
            res.writeHead(200);
            res.end(JSON.stringify(data));
        } else if (url === '/api/dashboard') {
            const data = await getDashboardData();
            res.writeHead(200);
            res.end(JSON.stringify(data));
        } else if (url === '/' || url === '/index.html' || url === '/dashboard') {
            // Serve static HTML
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
});
