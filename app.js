document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const newCaseBtn = document.getElementById('new-case-btn');
    
    // Configuration - REPLACE WITH YOUR API KEY
    const OPENAI_API_KEY = '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'; // Replace with your actual API key
    
    // Conversation context
    let conversationHistory = [];
    
    // Function to call the OpenAI API
    async function callGptApi(messages) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4', // You can change to gpt-3.5-turbo for lower cost
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 800
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Function to handle the New Case button
    async function handleNewCase() {
        // Enable input controls
        userInput.disabled = false;
        sendBtn.disabled = false;
        
        // Clear chat messages except for the first welcome message
        chatMessages.innerHTML = '';
        
        // Create loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message assistant-message loading-message';
        loadingMessage.id = 'loading-message';
        loadingMessage.textContent = 'Generating new case...';
        chatMessages.appendChild(loadingMessage);
        
        try {
            // Reset conversation history with system message
            const systemMessage = `You are a training system designed to help aspiring neurologists develop diagnostic skills through realistic patient simulations. Your responsibility is to create and present individuals with neurological symptoms in a way that mirrors real clinical encounters - incomplete information, uncertainty, and the need for skilled questioning to reveal the complete picture.

Create a new neurological case with medium complexity (not too easy, not too hard).

At the beginning of your response and throughout the conversation, include italicized descriptions of the patient's physical behaviors, expressions, and nonverbal cues using *asterisks*.

Begin by introducing the patient with their name, age, and chief complaint. Use first person perspective as the patient, but don't reveal the diagnosis.`;

            conversationHistory = [
                { role: "system", content: systemMessage }
            ];
            
            // Call the API
            const initialResponse = await callGptApi(conversationHistory);
            
            // Add response to conversation history
            conversationHistory.push({
                role: "assistant",
                content: initialResponse
            });
            
            // Remove loading message
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) loadingElement.remove();
            
            // Format and display the response
            displayMessage(initialResponse, 'assistant');
            
        } catch (error) {
            // Handle error
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.textContent = `Error: ${error.message}. Please check your API key and try again.`;
            }
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to handle sending a message
    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message || conversationHistory.length === 0) return;
        
        // Add user message to chat
        displayMessage(message, 'user');
        
        // Add to conversation history
        conversationHistory.push({
            role: "user",
            content: message
        });
        
        // Clear input field
        userInput.value = '';
        
        // Create loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message assistant-message loading-message';
        loadingMessage.id = 'loading-message';
        loadingMessage.textContent = 'Thinking...';
        chatMessages.appendChild(loadingMessage);
        
        // Scroll to show loading message
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // Call the API
            const response = await callGptApi(conversationHistory);
            
            // Add response to conversation history
            conversationHistory.push({
                role: "assistant",
                content: response
            });
            
            // Remove loading message
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) loadingElement.remove();
            
            // Format and display the response
            displayMessage(response, 'assistant');
            
        } catch (error) {
            // Handle error
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.textContent = `Error: ${error.message}. Please try again.`;
            }
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to display messages with formatting
    function displayMessage(content, role) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        
        if (role === 'assistant') {
            // Process text for markdown-like formatting
            let formattedText = content;
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Split by paragraphs
            const paragraphs = formattedText.split("\n\n");
            let htmlContent = '';
            
            paragraphs.forEach(paragraph => {
                if (paragraph.trim()) {
                    htmlContent += `<p>${paragraph}</p>`;
                }
            });
            
            messageElement.innerHTML = htmlContent || formattedText;
        } else {
            messageElement.textContent = content;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Event listeners
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }
    
    if (newCaseBtn) {
        newCaseBtn.addEventListener('click', handleNewCase);
    }
});
