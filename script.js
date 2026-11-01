(() => {
    'use strict';
    const outputArea = document.getElementById('jarvis-output'); // Исправлено
    const inputField = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const API_URL = 'https://jarvis-bot-0k1j.onrender.com/api/chat';
    
    let webHistory = [];
    let globalAudio = new Audio();

    function printUser(text) {
        const div = document.createElement('div');
        div.className = 'user-command';
        div.innerHTML = `<strong>You</strong>${text}`;
        outputArea.appendChild(div);
        outputArea.scrollTop = outputArea.scrollHeight;
    }

    function printJarvis(text, audioBase64 = null) {
        const div = document.createElement('div');
        div.className = 'jarvis-response';
        div.textContent = text;
        outputArea.appendChild(div);
        outputArea.scrollTop = outputArea.scrollHeight;

        if (audioBase64) {
            globalAudio.src = `data:audio/mp3;base64,${audioBase64}`;
            globalAudio.play().catch(e => console.log('Аудио заблокировано браузером:', e));
        }
    }

    async function handleSubmit() {
        const raw = inputField.value.trim();
        if (!raw) return;
        
        printUser(raw);
        inputField.value = '';
        
        const loading = document.createElement('div');
        loading.className = 'jarvis-response';
        loading.textContent = '...';
        outputArea.appendChild(loading);
        outputArea.scrollTop = outputArea.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: raw, history: webHistory })
            });
            const data = await response.json();
            
            outputArea.removeChild(loading);
            printJarvis(data.response, data.audio);

            webHistory.push({ role: 'user', content: raw });
            webHistory.push({ role: 'assistant', content: data.response });
            if (webHistory.length > 10) webHistory.splice(0, 2);
        } catch (error) {
            outputArea.removeChild(loading);
            printJarvis("Сэр, связь с сервером потеряна.");
        }
    }

    sendBtn.addEventListener('click', handleSubmit);
    inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSubmit(); });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.onresult = (e) => { 
            inputField.value = e.results[0][0].transcript; 
            handleSubmit(); 
        };
        micBtn.addEventListener('click', () => recognition.start());
    } else {
        micBtn.style.display = 'none';
    }
})();
