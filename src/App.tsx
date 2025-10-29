import React, { useState, useEffect, useMemo, memo, useRef } from "react";

interface ChatMessage {
  From: string;
  "Media Type": string;
  Created: string;
  Content: string;
  "Conversation Title": string | null;
  IsSender: boolean;
  "Created(microseconds)": number;
  IsSaved: boolean;
  "Media IDs": string;
}

type ChatData = Record<string, ChatMessage[]>;

// Memoized chat message row
const ChatMessageRow = memo(({ msg }: { msg: ChatMessage }) => (
  <div
    className={`flex mb-2 px-2 ${
      msg.IsSender ? "justify-end" : "justify-start"
    }`}
  >
    <div
      className={`p-3 max-w-[70%] break-words text-sm ${
        msg.IsSender ? "bg-yellow-400 text-black" : "bg-gray-200 text-black"
      } rounded-lg`}
    >
      <p className="font-semibold mb-1">{msg.From}</p>
      <p>{msg.Content}</p>
      <p className="text-xs text-gray-600 mt-1 text-right">
        {new Date(msg["Created(microseconds)"]).toLocaleString("en-GB")}
      </p>
    </div>
  </div>
));

function App() {
  const [data, setData] = useState<ChatData | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true); // Track scroll position

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setData(json);
      } catch {
        alert("Invalid JSON file!");
      }
    };
    reader.readAsText(file);
  };

  const filteredMessages = useMemo(() => {
    if (!selectedUser || !data) return [];
    const messages = data[selectedUser]
      .slice()
      .sort((a, b) => a["Created(microseconds)"] - b["Created(microseconds)"]);
    if (!searchTerm) return messages;
    const term = searchTerm.toLowerCase();
    return messages.filter((msg) => msg.Content.toLowerCase().includes(term));
  }, [data, selectedUser, searchTerm]);

  // Scroll functions
  const scrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
      setIsAtBottom(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  // Initial scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current && filteredMessages.length) {
      scrollToBottom();
    }
  }, [filteredMessages.length, selectedUser]);

  // Button click handler
  const handleScrollToggle = () => {
    if (isAtBottom) scrollToTop();
    else scrollToBottom();
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Snapchat Chat Viewer</h1>

      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="mb-4 px-3 py-2 border rounded shadow-sm w-full max-w-full sm:max-w-2xl lg:max-w-4xl"
      />

      {data && (
        <select
          value={selectedUser || ""}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="mb-4 px-3 py-2 border rounded shadow-sm w-full max-w-full sm:max-w-2xl lg:max-w-4xl"
        >
          <option value="" disabled>
            Select a user
          </option>
          {Object.keys(data).map((username) => (
            <option key={username} value={username}>
              {username}
            </option>
          ))}
        </select>
      )}

      {selectedUser && data && (
        <>
          <div className="flex items-center justify-between mb-2 w-full max-w-full sm:max-w-2xl lg:max-w-4xl">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded shadow-sm w-full mr-2"
            />
            <button
              onClick={handleScrollToggle}
              className="px-3 py-2 border rounded shadow-sm bg-blue-500 text-white hover:bg-blue-600 whitespace-nowrap"
            >
              {isAtBottom ? "Scroll to top" : "Scroll to bottom"}
            </button>
          </div>

          {searchTerm && (
            <p className="mb-2 text-gray-700 w-full max-w-full sm:max-w-2xl lg:max-w-4xl">
              Matches: {filteredMessages.length}
            </p>
          )}

          <div
            ref={chatContainerRef}
            className="flex-1 w-full max-w-full sm:max-w-2xl lg:max-w-4xl bg-white rounded-lg shadow overflow-y-auto p-4"
          >
            {filteredMessages.map((msg, index) => (
              <ChatMessageRow key={index} msg={msg} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
