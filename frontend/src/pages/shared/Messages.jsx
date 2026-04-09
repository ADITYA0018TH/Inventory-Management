import { useState, useEffect, useRef } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Send, User, Search, X, MessageSquare, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

function Avatar({ name, size = 36, color = '#6366f1' }) {
    const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: color + '20', color, fontWeight: 700,
            fontSize: size * 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1.5px solid ${color}30`
        }}>{initials}</div>
    );
}

const AVATAR_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function Messages() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showNewChat, setShowNewChat] = useState(false);
    const [search, setSearch] = useState('');
    const scrollRef = useRef();
    const inputRef = useRef();

    useEffect(() => { loadConversations(); }, []);
    useEffect(() => { if (activeChat) loadMessages(activeChat.user._id); }, [activeChat]);
    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await API.get('/messages/conversations');
            setConversations(res.data);
        } catch { /* silent */ }
    };

    const loadMessages = async (userId) => {
        try {
            const res = await API.get(`/messages/${userId}`);
            setMessages(res.data);
            setTimeout(() => inputRef.current?.focus(), 100);
        } catch { /* silent */ }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;
        try {
            const res = await API.post('/messages', { receiverId: activeChat.user._id, content: newMessage });
            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
            loadConversations();
        } catch { toast.error('Failed to send'); }
    };

    const startNewChat = (targetUser) => {
        const existing = conversations.find(c => c.user._id === targetUser._id);
        if (existing) {
            setActiveChat(existing);
        } else {
            setMessages([]);
            setConversations(prev => [{ user: targetUser, lastMessage: '', unread: 0 }, ...prev]);
            setActiveChat({ user: targetUser });
        }
        setShowNewChat(false);
    };

    const loadAvailableUsers = async () => {
        try {
            const res = await API.get('/messages/users');
            setAvailableUsers(res.data);
            setShowNewChat(true);
        } catch { toast.error('Failed to load users'); }
    };

    const filtered = conversations.filter(c =>
        c.user.name?.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', gap: 0 }}>

            {/* Sidebar */}
            <div style={{
                width: 300, flexShrink: 0, background: '#fff',
                borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Messages</h2>
                        <button onClick={loadAvailableUsers} style={{
                            width: 32, height: 32, borderRadius: 8, background: '#6366f1',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Plus size={16} />
                        </button>
                    </div>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search conversations..."
                            style={{
                                width: '100%', boxSizing: 'border-box', paddingLeft: 32,
                                height: 36, fontSize: 13, background: '#f8fafc',
                                border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a'
                            }}
                        />
                    </div>
                </div>

                {/* Conversation list */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filtered.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                            <MessageSquare size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                            <div style={{ fontSize: 13 }}>No conversations yet</div>
                        </div>
                    ) : filtered.map(c => {
                        const isActive = activeChat?.user._id === c.user._id;
                        const color = getColor(c.user.name);
                        return (
                            <div key={c.user._id} onClick={() => setActiveChat(c)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 16px', cursor: 'pointer',
                                    background: isActive ? '#f5f3ff' : 'transparent',
                                    borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                                    transition: 'all 0.15s'
                                }}>
                                <Avatar name={c.user.name} color={color} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.user.name}</span>
                                        {c.lastMessageAt && (
                                            <span style={{ fontSize: 10, color: '#94a3b8' }}>{formatTime(c.lastMessageAt)}</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {c.lastMessage || <span style={{ color: '#c7d2fe', fontStyle: 'italic' }}>Start a conversation</span>}
                                    </div>
                                </div>
                                {c.unread > 0 && (
                                    <span style={{ background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, flexShrink: 0 }}>
                                        {c.unread}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', minWidth: 0 }}>
                {activeChat ? (
                    <>
                        {/* Chat header */}
                        <div style={{
                            padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', gap: 12
                        }}>
                            <Avatar name={activeChat.user.name} color={getColor(activeChat.user.name)} size={38} />
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{activeChat.user.name}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>
                                    {activeChat.user.companyName || activeChat.user.role}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>
                                    <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                    <div style={{ fontSize: 13 }}>No messages yet — say hello!</div>
                                </div>
                            )}
                            {messages.map((m, i) => {
                                const isMine = m.senderId === user?.id || m.senderId?._id === user?.id;
                                return (
                                    <div key={m._id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '68%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            background: isMine ? '#6366f1' : '#fff',
                                            color: isMine ? '#fff' : '#0f172a',
                                            fontSize: 13, lineHeight: 1.5,
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                            border: isMine ? 'none' : '1px solid #e2e8f0'
                                        }}>
                                            {m.content}
                                            <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: 'right' }}>
                                                {formatTime(m.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} style={{
                            padding: '12px 20px', background: '#fff', borderTop: '1px solid #e2e8f0',
                            display: 'flex', gap: 10, alignItems: 'center'
                        }}>
                            <input
                                ref={inputRef}
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, height: 42, padding: '0 16px', borderRadius: 10,
                                    border: '1px solid #e2e8f0', fontSize: 13, background: '#f8fafc',
                                    color: '#0f172a', outline: 'none'
                                }}
                                onFocus={e => e.target.style.borderColor = '#6366f1'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button type="submit" disabled={!newMessage.trim()} style={{
                                width: 42, height: 42, borderRadius: 10, border: 'none',
                                background: newMessage.trim() ? '#6366f1' : '#e2e8f0',
                                color: newMessage.trim() ? '#fff' : '#94a3b8',
                                cursor: newMessage.trim() ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s', flexShrink: 0
                            }}>
                                <Send size={16} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={28} color="#6366f1" />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Your Messages</div>
                        <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', maxWidth: 260 }}>
                            Select a conversation from the sidebar or start a new one
                        </div>
                        <button onClick={loadAvailableUsers} className="btn btn-primary" style={{ marginTop: 8 }}>
                            <Plus size={15} /> New Message
                        </button>
                    </div>
                )}
            </div>

            {/* New chat modal */}
            {showNewChat && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                    onClick={() => setShowNewChat(false)}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 360, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>New Message</h3>
                            <button onClick={() => setShowNewChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {availableUsers.map(u => {
                                const color = getColor(u.name);
                                return (
                                    <div key={u._id} onClick={() => startNewChat(u)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Avatar name={u.name} color={color} size={38} />
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>{u.companyName || u.role}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
