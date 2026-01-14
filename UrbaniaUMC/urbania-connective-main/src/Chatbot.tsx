import { useState, useRef, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import "./chatbot.css";

function IslamicChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
    const [rateLimitRemaining, setRateLimitRemaining] = useState<number>(0);
    const isConfigured = Boolean(import.meta.env.VITE_GLM_API_KEY);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initializeConversation();
        }
    }, [isOpen]);

    // Countdown for rate limit
    useEffect(() => {
        if (!rateLimitedUntil) {
            setRateLimitRemaining(0);
            return;
        }
        const update = () => {
            const remaining = Math.max(0, Math.ceil((rateLimitedUntil - Date.now()) / 1000));
            setRateLimitRemaining(remaining);
            if (remaining <= 0) setRateLimitedUntil(null);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [rateLimitedUntil]);

    useEffect(() => {
        if (isOpen) {
            endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const toggleChat = () => {
        setIsOpen((prev) => !prev);
    };

    const delay = (ms: number | undefined) => new Promise((resolve) => setTimeout(resolve, ms));

    const showAiMessageWithDelay = async (text: string) => {
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

    const fetchIslamicKnowledge = async (query: string) => {
        // Call server proxy endpoint which uses Groq SDK and streams SSE
        try {
            const resp = await fetch('/api/groq/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: "You are an Islamic knowledge assistant. Answer only questions related to Islam, the Quran, Hadith, Islamic history, theology, jurisprudence (fiqh), and related topics. If a question is unrelated to Islam, politely refuse and reply: 'I'm sorry, I can only answer questions related to Islam and the Quran.' Do not provide information on unrelated topics, and do not attempt to answer general knowledge or opinion questions that are outside Islamic teachings." },
                        { role: 'user', content: query }
                    ],
                    model: 'openai/gpt-oss-120b',
                    temperature: 1,
                    max_completion_tokens: 8192,
                    stream: true
                })
            });

            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(txt || 'Server error from chat proxy');
            }

            if (!resp.body) {
                throw new Error('Response body is empty');
            }

            // Read SSE-style stream from server and collect text deltas
            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let done = false;
            let full = '';

            while (!done) {
                const { value, done: d } = await reader.read();
                done = d;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    // Split events by double newline
                    const parts = buffer.split('\n\n');
                    buffer = parts.pop() || '';
                    for (const part of parts) {
                        const line = part.trim();
                        if (!line) continue;
                        // Expect lines like "data: {...}"
                        if (line.startsWith('data:')) {
                            const payload = line.replace(/^data:\s*/, '');
                            try {
                                const obj = JSON.parse(payload);
                                const delta = obj.choices?.[0]?.delta?.content;
                                if (delta) {
                                    full += delta;
                                }
                            } catch (e) {
                                // ignore non-JSON data
                            }
                        }
                        // handle server events
                        if (line.startsWith('event:')) {
                            // could parse event types (done/error)
                        }
                    }
                }
            }

            // If we didn't receive any streamed content, fallback to reading body as text
            if (!full) {
                const text = buffer.trim();
                if (text) full = text;
            }

            return full || "Sorry, I couldn't find relevant information.";
        } catch (err) {
            console.error('fetchIslamicKnowledge proxy error:', err);
            // If server indicated rate limiting, propagate a rate_limited error shape
            if (err instanceof Error && err.message.toLowerCase().includes('rate')) {
                const e = new Error('rate_limited');
                (e as any).isRateLimit = true;
                (e as any).retryAfter = 60;
                throw e;
            }
            return "Sorry, an error occurred while retrieving the information.";
        }
    };



    const handleSend = async () => {
        if (input.trim() === "") return;
        if (isRequesting) return; // prevent duplicate sends

        const userMessage = { sender: "user", text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");

        setIsRequesting(true);
        try {
            const response = await fetchIslamicKnowledge(input);
            await showAiMessageWithDelay(response);
        } catch (err) {
            console.error("Unhandled error in handleSend:", err);
            // If it's a rate-limit error thrown from fetch helper, set cooldown state
            if ((err as any)?.isRateLimit && (err as any).retryAfter) {
                const retryAfter = (err as any).retryAfter as number;
                const until = Date.now() + retryAfter * 1000;
                setRateLimitedUntil(until);
                setRateLimitRemaining(retryAfter);
                await showAiMessageWithDelay(`The knowledge service is temporarily busy (rate limit). Please try again in ${retryAfter} seconds.`);
            } else {
                await showAiMessageWithDelay("Sorry, an unexpected error occurred. Please try again later.");
            }
        } finally {
            setIsRequesting(false);
        }
    };

    const handleKeyDown = (e: { key: string; preventDefault: () => void; }) => {
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
                        <div>
                            <span className="chat-header-name" style={{ color: "white" }}>Islamic صديق</span>
                            {!isConfigured && (
                                <div className="text-xs mt-1 text-yellow-100" style={{ opacity: 0.95 }}>
                                    Knowledge service not configured — add VITE_GLM_API_KEY in the frontend .env
                                </div>
                            )}
                            {isConfigured && rateLimitedUntil && (
                                <div className="text-xs mt-1 text-yellow-100" style={{ opacity: 0.95 }}>
                                    Rate limited — retry in {rateLimitRemaining}s
                                </div>
                            )}
                        </div>
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
                            placeholder={isConfigured ? "Ask about Islam..." : "Service not configured"}
                            disabled={!isConfigured || isRequesting || Boolean(rateLimitedUntil)}
                        />
                        <button onClick={handleSend} disabled={!isConfigured || isRequesting || Boolean(rateLimitedUntil)}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IslamicChatbot;
