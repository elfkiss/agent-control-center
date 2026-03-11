// AI Agent 控制中心 - 主逻辑

class AgentControlCenter {
    constructor() {
        this.apiUrl = localStorage.getItem('apiUrl') || 'http://10.10.10.35:18789';
        this.apiToken = localStorage.getItem('apiToken') || '';
        this.currentAgent = 'main';
        this.messages = [];
        this.agents = [
            { id: 'main', name: 'AI Assistant', emoji: '🤖', status: '在线' },
            { id: 'coder', name: 'Coder Agent', emoji: '💻', status: '空闲' },
            { id: 'writer', name: 'Writer Agent', emoji: '✍️', status: '空闲' },
            { id: 'researcher', name: 'Researcher', emoji: '🔬', status: '空闲' },
            { id: 'analyst', name: 'Data Analyst', emoji: '📊', status: '空闲' },
            { id: 'designer', name: 'Designer', emoji: '🎨', status: '空闲' },
            { id: 'translator', name: 'Translator', emoji: '🌍', status: '空闲' },
            { id: 'planner', name: 'Planner', emoji: '📝', status: '空闲' },
        ];
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.renderAgentList();
        this.bindEvents();
        this.checkConnection();
    }
    
    loadSettings() {
        document.getElementById('apiUrl').value = this.apiUrl;
        document.getElementById('apiToken').value = this.apiToken;
        document.getElementById('systemPrompt').value = localStorage.getItem('systemPrompt') || '你是一个专业的 AI 助手。';
        document.getElementById('modelSelect').value = localStorage.getItem('model') || 'custom/minimax-m2.5';
    }
    
    saveSettings() {
        this.apiUrl = document.getElementById('apiUrl').value;
        this.apiToken = document.getElementById('apiToken').value;
        localStorage.setItem('apiUrl', this.apiUrl);
        localStorage.setItem('apiToken', this.apiToken);
        localStorage.setItem('systemPrompt', document.getElementById('systemPrompt').value);
        localStorage.setItem('model', document.getElementById('modelSelect').value);
    }
    
    renderAgentList() {
        const list = document.getElementById('agentList');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        list.innerHTML = this.agents
            .filter(a => a.name.toLowerCase().includes(searchTerm))
            .map(a => `
                <div class="agent-item ${a.id === this.currentAgent ? 'active' : ''}" data-id="${a.id}">
                    <div class="agent-avatar">${a.emoji}</div>
                    <div class="agent-info">
                        <div class="agent-name">${a.name}</div>
                        <div class="agent-status">${a.status}</div>
                    </div>
                    <div class="status-dot"></div>
                </div>
            `).join('');
    }
    
    bindEvents() {
        // 搜索
        document.getElementById('searchInput').addEventListener('input', () => this.renderAgentList());
        
        // Agent 选择
        document.getElementById('agentList').addEventListener('click', (e) => {
            const item = e.target.closest('.agent-item');
            if (item) {
                this.currentAgent = item.dataset.id;
                this.renderAgentList();
                document.getElementById('chatTitle').textContent = this.agents.find(a => a.id === this.currentAgent)?.emoji + ' ' + this.agents.find(a => a.id === this.currentAgent)?.name;
            }
        });
        
        // 发送消息
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 清空对话
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.messages = [];
            this.renderMessages();
            this.updateStats();
        });
        
        // 连接
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.saveSettings();
            this.checkConnection();
        });
    }
    
    async checkConnection() {
        const statusEl = document.getElementById('connectionStatus');
        
        try {
            const response = await fetch(`${this.apiUrl}/v1/models`, {
                headers: { 'Authorization': `Bearer ${this.apiToken}` }
            });
            
            if (response.ok) {
                statusEl.className = 'connection-status connected';
                statusEl.innerHTML = '<span class="status-dot"></span><span>已连接</span>';
            } else {
                throw new Error('API 返回错误');
            }
        } catch (e) {
            statusEl.className = 'connection-status disconnected';
            statusEl.innerHTML = '<span class="status-dot"></span><span>未连接</span>';
        }
    }
    
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        
        if (!content) return;
        
        // 添加用户消息
        this.messages.push({ role: 'user', content });
        this.renderMessages();
        input.value = '';
        
        // 显示加载状态
        this.showTyping();
        
        try {
            const model = localStorage.getItem('model') || 'custom/minimax-m2.5';
            const systemPrompt = localStorage.getItem('systemPrompt') || '你是一个专业的 AI 助手。';
            
            const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiToken}`,
                    'x-openclaw-agent-id': this.currentAgent
                },
                body: JSON.stringify({
                    model: `openclaw:${this.currentAgent}`,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.messages
                    ],
                    stream: false
                })
            });
            
            this.hideTyping();
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;
            
            this.messages.push({ role: 'assistant', content: assistantMessage });
            this.renderMessages();
            this.updateStats();
            
        } catch (error) {
            this.hideTyping();
            this.messages.push({ 
                role: 'assistant', 
                content: `❌ 请求失败: ${error.message}\n\n请检查 API 设置是否正确。` 
            });
            this.renderMessages();
        }
    }
    
    showTyping() {
        const messages = document.getElementById('messages');
        const typing = document.createElement('div');
        typing.id = 'typingIndicator';
        typing.className = 'message';
        typing.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
    }
    
    hideTyping() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
    
    renderMessages() {
        const container = document.getElementById('messages');
        
        container.innerHTML = this.messages.map(m => `
            <div class="message ${m.role}">
                <div class="message-avatar">${m.role === 'user' ? '👤' : '🤖'}</div>
                <div class="message-content">${this.escapeHtml(m.content)}</div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    }
    
    updateStats() {
        document.getElementById('msgCount').textContent = this.messages.length;
        // 估算 token (简单估算)
        const totalChars = this.messages.reduce((sum, m) => sum + m.content.length, 0);
        document.getElementById('tokenCount').textContent = Math.ceil(totalChars / 4);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AgentControlCenter();
});
