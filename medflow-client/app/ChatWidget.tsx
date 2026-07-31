// app/ChatWidget.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  sender: "bot" | "user";
  text: string;
  suggestions?: string[];
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hàm đóng chat dùng chung: đóng khung + xóa input đang gõ dở
  const closeChat = useCallback(() => {
    setIsOpen(false);
    setInputValue("");
  }, []);

  // Lắng nghe sự kiện mở chat từ các component khác
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  // Lắng nghe phím Esc để đóng chat khi đang mở
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeChat();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeChat]);

  const defaultGreeting: Message = {
    sender: "bot",
    text: "Xin chào, tôi là trợ lí ảo của phòng khám BKMed.\nTôi có thể hỗ trợ Anh/Chị các vấn đề sau:\n1. **Điều trị & Xử lý:** Hướng dẫn sơ cứu, tư vấn dùng thuốc và hướng giải quyết triệu chứng.\n2. **Nguyên nhân:** Giải đáp lý do gây bệnh hoặc tác dụng phụ của các loại thuốc.\n3. **Mức độ nghiêm trọng:** Đánh giá độ nguy hiểm của triệu chứng và đưa ra cảnh báo khẩn cấp.\n4. **Chẩn đoán:** Giải thích sơ bộ ý nghĩa của các triệu chứng và kết quả thủ thuật y khoa.",
    suggestions: [
      "Tôi bị đau đầu và sốt cao",
      "Tác dụng phụ của Paracetamol",
      "Đau ngực khó thở có nguy hiểm không?",
    ],
  };

  const [messages, setMessages] = useState<Message[]>([defaultGreeting]);

  // 1. Kiểm tra Role và ID của người dùng từ localStorage
  useEffect(() => {
    const checkUserContext = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserRole(user.role || "PATIENT");
          setUserId(user.id || user.email || "guest");
        } else {
          // Khách ghé thăm chưa đăng nhập mặc định được hỗ trợ như Bệnh nhân tiềm năng
          setUserRole("PATIENT");
          setUserId("guest");
        }
      } catch (e) {
        setUserRole("PATIENT");
        setUserId("guest");
      }
    };

    checkUserContext();
    window.addEventListener("storage", checkUserContext);
    return () => window.removeEventListener("storage", checkUserContext);
  }, []);

  // 2. Quản lý Session độc lập cho từng User ID và khôi phục lịch sử chat
  useEffect(() => {
    if (!userId) return;
    const sessionKey = `bkmed_chat_session_${userId}`;
    let savedSessionId = localStorage.getItem(sessionKey);
    
    if (!savedSessionId) {
      savedSessionId = (window.crypto && window.crypto.randomUUID) 
        ? window.crypto.randomUUID() 
        : (Math.random().toString(36).substring(2) + Date.now().toString(36));
      localStorage.setItem(sessionKey, savedSessionId);
    }
    
    setSessionId(savedSessionId);

    // Khôi phục tin nhắn
    const msgKey = `bkmed_chat_messages_${userId}`;
    const savedMsgStr = localStorage.getItem(msgKey);
    if (savedMsgStr) {
      try {
        const savedMsg = JSON.parse(savedMsgStr);
        if (Array.isArray(savedMsg) && savedMsg.length > 0) {
          setMessages(savedMsg);
        } else {
          setMessages([defaultGreeting]);
        }
      } catch (e) {
        setMessages([defaultGreeting]);
      }
    } else {
      setMessages([defaultGreeting]);
    }
  }, [userId]);

  // 3. Lưu tin nhắn vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    if (!userId || messages.length === 0) return;
    const msgKey = `bkmed_chat_messages_${userId}`;
    localStorage.setItem(msgKey, JSON.stringify(messages));
  }, [messages, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Tính năng bắt đầu hội thoại mới
  const handleResetChat = () => {
    if (isStreaming || !userId) return;
    const newSessionId = crypto.randomUUID();
    const sessionKey = `bkmed_chat_session_${userId}`;
    const msgKey = `bkmed_chat_messages_${userId}`;
    
    localStorage.setItem(sessionKey, newSessionId);
    localStorage.removeItem(msgKey); // Xóa lịch sử cũ
    localStorage.removeItem('aiTriage'); // Xóa luôn gợi ý khoa cũ
    localStorage.removeItem('chatSessionId');
    
    setSessionId(newSessionId);
    setMessages([defaultGreeting]);
  };

  const handleSend = async (arg?: string | React.FormEvent) => {
    if (arg && typeof arg !== "string" && "preventDefault" in arg) {
      arg.preventDefault();
    }
    const textToSend = typeof arg === "string" ? arg : undefined;
    const text = textToSend || inputValue;
    if (!text.trim() || isStreaming || !sessionId) return;

    setInputValue("");
    setMessages((prev) => [
      ...prev,
      { sender: "user", text },
      { sender: "bot", text: "" },
    ]);
    setIsStreaming(true);

    const apiUrl =
      process.env.NEXT_PUBLIC_CHATBOT_API_URL || "http://localhost:8080/api/chat";

    try {
      const response = await fetch(
        `${apiUrl}?session_id=${sessionId}&message=${encodeURIComponent(text)}`,
        {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
          },
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Không thể kết nối đến máy chủ AI Backend");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const tokenStr = line.replace("data: ", "");
              let token = tokenStr;
              try {
                token = JSON.parse(tokenStr);
              } catch (e) {
                // Không phải chuỗi JSON thì giữ nguyên string
              }

              setMessages((prev) => {
                const newArr = [...prev];
                const lastIdx = newArr.length - 1;
                if (lastIdx >= 0 && newArr[lastIdx].sender === "bot") {
                  let updatedText = newArr[lastIdx].text + token;

                  newArr[lastIdx] = {
                    ...newArr[lastIdx],
                    text: updatedText,
                  };
                }
                return newArr;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi SSE Streaming:", error);
      setMessages((prev) => {
        const newArr = [...prev];
        const lastIdx = newArr.length - 1;
        if (lastIdx >= 0 && newArr[lastIdx].sender === "bot") {
          newArr[lastIdx] = {
            ...newArr[lastIdx],
            text:
              newArr[lastIdx].text ||
              "⚠️ Lỗi kết nối đến máy chủ AI Backend (cổng 8080). Vui lòng đảm bảo dịch vụ AI (start_ai.bat) đang hoạt động.",
          };
        }
        return newArr;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  // Helper xử lý định dạng inline: **bold**, __bold__, [link](url)
  const parseInlineMarkdown = (content: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIdx) {
        parts.push(content.substring(lastIdx, match.index));
      }

      if (match[1] && match[2]) {
        // Link
        parts.push(
          <a
            key={`link-${parts.length}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 transition-colors inline-flex items-center gap-0.5"
          >
            {match[1]} <span className="text-xs">↗</span>
          </a>
        );
      } else if (match[3] || match[4]) {
        // Bold
        const boldText = match[3] || match[4];
        parts.push(
          <strong key={`bold-${parts.length}`} className="font-bold text-gray-900 dark:text-white">
            {boldText}
          </strong>
        );
      }

      lastIdx = regex.lastIndex;
    }

    if (lastIdx < content.length) {
      parts.push(content.substring(lastIdx));
    }

    return parts.length > 0 ? parts : content;
  };

  // Helper function: Parse raw markdown to clean paragraphs and lists
  const renderFormattedMessage = (text: string, isUser: boolean) => {
    if (isUser) {
      return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
    }

    if (!text) return null;

    // Phân tách theo đoạn văn (paragraph blocks) dựa trên 2 dấu xuống dòng hoặc nhiều hơn
    const blocks = text.split(/\n\n+/);

    return (
      <div className="flex flex-col gap-3 text-gray-800 dark:text-zinc-100 leading-relaxed text-sm sm:text-[15px]">
        {blocks.map((block, bIdx) => {
          const lines = block.split(/\n/);
          
          return (
            <div key={bIdx} className="flex flex-col gap-1.5">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                // Tiêu đề (Heading ### hoặc ## hoặc #)
                const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
                if (headingMatch) {
                  return (
                    <h4 key={lIdx} className="font-bold text-blue-600 dark:text-blue-400 text-base sm:text-lg mt-1">
                      {parseInlineMarkdown(headingMatch[2])}
                    </h4>
                  );
                }

                // Danh sách (Bullet hoặc Numbered list: "1. ", "- ", "* ")
                const listMatch = trimmed.match(/^(\d+\.|[-*•])\s+(.*)$/);
                if (listMatch) {
                  const bullet = listMatch[1];
                  const content = listMatch[2];
                  return (
                    <div key={lIdx} className="flex items-start gap-2.5 ml-1">
                      <span className="font-bold text-blue-500 min-w-[20px] select-none">{bullet}</span>
                      <span className="flex-1">{parseInlineMarkdown(content)}</span>
                    </div>
                  );
                }

                // Đoạn văn bản thông thường
                return (
                  <p key={lIdx} className="leading-relaxed">
                    {parseInlineMarkdown(trimmed)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999999] flex flex-col items-end pointer-events-none">
      {/* 1. KHUNG CHAT BOX (Mở ra khi isOpen === true) */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden flex flex-col h-[480px]">
          {/* Header Widget */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white select-none">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                🤖
              </div>
              <div>
                <h4 className="text-base font-bold">BKMed AI Assistant</h4>
                <p className="text-xs text-blue-100">
                  {isStreaming ? "AI đang trả lời..." : "Online • Trợ lý 24/7"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetChat}
                disabled={isStreaming}
                title="Bắt đầu cuộc hội thoại mới"
                className="rounded px-2 py-1 text-xs font-semibold bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                🔄 Mới
              </button>
              <button
                type="button"
                onClick={closeChat}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer text-base font-bold"
                title="Đóng chat (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Nội dung Tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[90%] rounded-2xl px-4 py-3.5 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none text-sm sm:text-[15px]"
                      : "bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-none"
                  }`}
                >
                  {msg.text
                    ? renderFormattedMessage(msg.text, msg.sender === "user")
                    : isStreaming && idx === messages.length - 1
                    ? <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">⏳ AI đang phân tích...</span>
                    : ""}
                </div>

                {msg.suggestions && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        disabled={isStreaming}
                        onClick={() => handleSend(sug)}
                        className="rounded-full border border-gray-300 bg-white px-3.5 py-1 text-[11px] sm:text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-all shadow-2xs hover:shadow-xs hover:border-blue-500 cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Nhập tin nhắn */}
          <form
            onSubmit={handleSend}
            className="border-t border-gray-100 p-2.5 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={isStreaming ? "AI đang trả lời..." : "Nhập triệu chứng của bạn..."}
              disabled={isStreaming}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming}
              className="rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 font-semibold text-xs"
            >
              Gửi ➤
            </button>
          </form>
        </div>
      )}

      {/* 2. NÚT TRÒN BONG BÓNG (NẮM QUYỀN MỞ/TẮT) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer select-none"
        title={isOpen ? "Đóng chat" : "Mở chat AI Triage"}
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>
    </div>
  );
}
