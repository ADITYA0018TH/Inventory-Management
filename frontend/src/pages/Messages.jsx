import { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiUser, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Messages() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (activeChat) loadMessages(activeChat.user._id);
    }, [activeChat]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await API.get('/messages/conversations');
            setConversations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMessages = async (userId) => {
        try {
            const res = await API.get(`/messages/${userId}`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const res = await API.post('/messages', {
                receiverId: activeChat.user._id,
                content: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
            loadConversations(); // Update last message preview
        } catch (err) {
            toast.error('Failed to send');
        }
    };

    const startNewChat = async (targetUser) => {
        setActiveChat({ user: targetUser });
        setIsNewChatModalOpen(false);
        // Check if existing convo, else empty
        const existing = conversations.find(c => c.user._id === targetUser._id);
        if (existing) {
            setActiveChat(existing);
        } else {
            setMessages([]);
            setConversations([{ user: targetUser, lastMessage: '', unread: 0 }, ...conversations]);
        }
    };

    const loadAvailableUsers = async () => {
        const res = await API.get('/messages/users');
        setAvailableUsers(res.data);
        setIsNewChatModalOpen(true);
    };

    return (
        <div className="page" style={{ height: '100vh', overflow: 'hidden' }}>
            <div className="page-header">
                <h1>Messages</h1>
                <button className="btn btn-primary" onClick={loadAvailableUsers}><FiSearch /> New Message</button>
            </div>

            <div className="chat-container">
                <div className="chat-sidebar">
                    <div className="chat-search">
                        <input type="text" placeholder="Search conversations..." className="search-input" />
                    </div>
                    <div className="chat-list">
                        {conversations.map(c => (
                            <div key={c.user._id} className={`chat-item ${activeChat?.user._id === c.user._id ? 'active' : ''}`} onClick={() => setActiveChat(c)}>
                                <div className="chat-user-name">
                                    {c.user.name}
                                    {c.unread > 0 && <span className="badge badge-danger">{c.unread}</span>}
                                </div>
                                <div className="chat-preview">{c.lastMessage}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-main">
                    {activeChat ? (
                        <>
                            <div className="chat-header">
                                <FiUser /> {activeChat.user.name} <span className="text-muted">({activeChat.user.companyName || activeChat.user.role})</span>
                            </div>
                            <div className="chat-messages">
                                {messages.map(m => (
                                    <div key={m._id} className={`message ${m.senderId === user.id ? 'sent' : 'received'}`}>
                                        {m.content}
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                            <form className="chat-input-area" onSubmit={handleSend}>
                                <input
                                    className="chat-input"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary"><FiSend /></button>
                            </form>
                        </>
                    ) : (
                        <div className="empty-state">Select a conversation to start chatting</div>
                    )}
                </div>
            </div>

            {isNewChatModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Start New Chat</h2>
                        <div className="user-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {availableUsers.map(u => (
                                <div key={u._id} className="chat-item" onClick={() => startNewChat(u)}>
                                    <div className="chat-user-name">{u.name}</div>
                                    <div className="text-sm text-muted">{u.companyName || u.role}</div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-secondary btn-full mt-4" onClick={() => setIsNewChatModalOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
