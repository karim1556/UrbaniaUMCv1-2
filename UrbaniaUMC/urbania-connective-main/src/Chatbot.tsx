import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Markdown from "markdown-to-jsx";
import "./chatbot.css";

function IslamicChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initializeConversation();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const toggleChat = () => {
        setIsOpen((prev) => !prev);
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const showAiMessageWithDelay = async (text) => {
        setIsTyping(true);
        await delay(1000);
        setMessages((prevMessages) => [...prevMessages, { sender: "ai", text }]);
        setIsTyping(false);
    };

    const initializeConversation = async () => {
        const initialMessages = [
            "As-salamu alaykum! I am your Islamic Knowledge صديق.",
            "You can ask me about the Quran, Hadith, Islamic history, or general Islamic knowledge."
        ];

        for (const msg of initialMessages) {
            await showAiMessageWithDelay(msg);
        }
    };

    const fetchIslamicKnowledge = async (query) => {
        try {
            const API_KEY = "AIzaSyC6H43qonao9BCjw2n5S2ImP115W-k0P6o"; // Replace with your actual API key
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

            const requestBody = {
                contents: [
                    {
                        parts: [
                            {
                                text: `Answer only with Islamic and Quranic knowledge. If the question is unrelated to Islam, do not respond. Question: ${query}`
                            }
                        ]
                    }
                ]
            };

            const response = await axios.post(API_URL, requestBody, {
                headers: { "Content-Type": "application/json" }
            });

            if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
                return "Sorry, I couldn't find relevant information. Please ask something related to Islam or the Quran.";
            }

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Error fetching Islamic knowledge:", error);
            return "Sorry, an error occurred while retrieving the information.";
        }
    };



    const handleSend = async () => {
        if (input.trim() === "") return;

        const userMessage = { sender: "user", text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");

        setIsTyping(true);
        const response = await fetchIslamicKnowledge(input);
        await showAiMessageWithDelay(response);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div>
            <div className="chatbot-icon" onClick={toggleChat}>
                <img
                    src="images/chat.png"
                    width="50px"
                    height="50px"
                    alt="Chatbot Icon"
                />
            </div>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <span className="chat-header-name" style={{ color: "white" }}>Islamic صديق</span>
                        <button className="close-btn" onClick={toggleChat}>
                            <img
                                src="images/crossicon.png"
                                width="25px"
                                height="25px"
                                alt=""
                            />
                        </button>
                    </div>
                    <div className="chat-body">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <Markdown>{msg.text}</Markdown>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message ai typing">
                                <span className="dot">.</span>
                                <span className="dot">.</span>
                                <span className="dot">.</span>
                            </div>
                        )}
                        <div ref={endOfMessagesRef} />
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about Islam..."
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IslamicChatbot;
