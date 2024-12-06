// Define message sets
const greetings = [
    { sender: 'den', text: 'Amir!' },
    { sender: 'amir', text: 'Den!' }
];

const conversation = [
    { sender: 'den', text: 'Vaguely?' },
    { sender: 'amir', text: 'Vaguely.' },
    { sender: 'den', text: 'Vaguely.' },
    { sender: 'amir', text: 'Vaguely?' },
    { sender: 'den', text: 'Vaguely.' },
    { sender: 'amir', text: 'Haha! No man.' },
    { sender: 'den', text: 'There\'s a disconnect here.' },
    { sender: 'amir', text: 'Consider it dumb.' },
    { sender: 'den', text: 'Play it by year?' },
    { sender: 'amir', text: 'What year?' },
    { sender: 'den', text: 'Play it by one year?' },
    { sender: 'amir', text: 'What year?' },
    { sender: 'den', text: 'Hey what year is it?' },
    { sender: 'amir', text: '2010.' },
    { sender: 'den', text: '2011? Wanna play it by that?' },
    { sender: 'amir', text: 'Consider it dumb.' },
    { sender: 'den', text: 'Absurd.' },
    { sender: 'amir', text: 'Den!' },
    { sender: 'den', text: 'There\'s a disconnect here.' },
    { sender: 'amir', text: 'Vaguely.' }
];

const goodbye = [
    { sender: 'den', text: 'Bye.' },
    { sender: 'amir', text: 'Den!' },
    { sender: 'amir', text: 'https://www.youtube.com/watch?v=wspnO_wg0S8' }

];

const fullChat = [...greetings, ...conversation, ...goodbye];

const chatWindow = document.getElementById('chat-window');
let messageIndex = 0;
let lastSender = null;

const macWindow = document.querySelector('.mac-window');
const titlebar = macWindow.querySelector('.mac-titlebar');

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

titlebar.addEventListener('mousedown', (e) => {
    isDragging = true;
    // Calculate the offset from the mouse to the top-left corner of the window
    offsetX = e.clientX - macWindow.offsetLeft;
    offsetY = e.clientY - macWindow.offsetTop;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        // Move the window to follow the mouse, minus the original offset
        macWindow.style.left = (e.clientX - offsetX) + 'px';
        macWindow.style.top = (e.clientY - offsetY) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});



function addMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', message.sender);

    // Regex to match URLs in the message
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let match;
    let lastIndex = 0;
    let contentFragments = [];

    // Go through all matches of URLs in the message
    while ((match = urlRegex.exec(message.text)) !== null) {
        const url = match[0];

        // Text before the URL
        const textBefore = message.text.slice(lastIndex, match.index);
        if (textBefore) {
            contentFragments.push(document.createTextNode(textBefore));
        }

        // Create the link element
        const link = document.createElement('a');
        link.href = url;
        link.textContent = url;
        link.target = '_blank'; // Open in a new tab
        // Optional styling for link
        link.style.color = message.sender === 'amir' ? '#fff' : '#007bff';
        link.style.textDecoration = 'underline';

        contentFragments.push(link);
        lastIndex = urlRegex.lastIndex;
    }

    // Add any remaining text after the last URL
    if (lastIndex < message.text.length) {
        contentFragments.push(document.createTextNode(message.text.slice(lastIndex)));
    }

    // If no URL was found, just show the text
    if (contentFragments.length === 0) {
        contentFragments.push(document.createTextNode(message.text));
    }

    // Append all parts to the message div
    contentFragments.forEach(node => msgDiv.appendChild(node));

    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


function addTypingIndicator(sender) {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing";
    typingDiv.innerHTML = `
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `;
    const isLeft = (sender === 'den');
    typingDiv.classList.add(isLeft ? "left" : "right");
    chatWindow.appendChild(typingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return typingDiv;
}

function simulateChat() {
    if (messageIndex < fullChat.length) {
        const message = fullChat[messageIndex];

        if (lastSender && lastSender !== message.sender) {
            // Different sender, show typing indicator first
            const typingDiv = addTypingIndicator(message.sender);
            setTimeout(() => {
                typingDiv.remove();
                addMessage(message);
                lastSender = message.sender;
                messageIndex++;
                setTimeout(simulateChat, 600);
            }, 1000);
        } else {
            // Same sender or first message
            addMessage(message);
            lastSender = message.sender;
            messageIndex++;
            setTimeout(simulateChat, 600);
        }
    }
}

// Start the simulation after a short initial delay
setTimeout(simulateChat, 1000);

