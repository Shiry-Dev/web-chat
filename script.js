let socket;
let role;

function createSession() {
    role = 'owner';
    socket = new WebSocket('ws://localhost:8080');
    //socket = new WebSocket('https://b7352ef738e2.ngrok-free.app');
    socket.onopen = () => socket.send(JSON.stringify({ type: 'init' }));
    setupSocket();
}

function joinSession() {
    role = 'guest';
    const sessionId = document.getElementById('joinKey').value;
    socket = new WebSocket('ws://localhost:8080');
    //socket = new WebSocket('https://b7352ef738e2.ngrok-free.app');
    socket.onopen = () => socket.send(JSON.stringify({ type: 'join', sessionId }));
    setupSocket();
}

document.getElementById('joinKey').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        joinSession();
    }
});

function setupSocket() {
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'session_created') {
            document.getElementById('status').innerText = `Session ID: ${data.sessionId}`;
        } else if (data.type === 'joined' || data.type === 'guest_joined') {
            document.getElementById('chat').style.display = 'block';
        } else if (data.type === 'message') {
	    const messages = document.getElementById('messages');
            const isOwnMessage = data.from === role;
            messages.innerHTML += `<div class="message ${isOwnMessage ? 'sent' : 'received'}">
                <b>${data.from}:</b> ${data.content}
            </div>`;
            messages.scrollTop = messages.scrollHeight;
        } else if (data.type === 'info') {
            leaveChat();
        }
    };
}

function sendMessage() {
    const msg = document.getElementById('msg').value;
    socket.send(JSON.stringify({ type: 'message', content: msg }));

    const messages = document.getElementById('messages');
    messages.innerHTML += `<div class="message sent"><b>${role}:</b> ${msg}</div>`;
    messages.scrollTop = messages.scrollHeight;

    document.getElementById('msg').value = '';
}

document.getElementById('msg').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

function leaveChat() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
    location.reload();
}

function toggleTheme() {
    const body = document.body;
    const button = document.querySelector('button[onclick="toggleTheme()"]');

    body.classList.toggle('dark');

    if (body.classList.contains('dark')) {
        button.innerText = '☀️  Modo Claro';
    } else {
        button.innerText = '🌙 Modo Escuro';
    }
}
