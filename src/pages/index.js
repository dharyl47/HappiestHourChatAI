import { useState } from "react";
import Image from 'next/image';
import axios from 'axios';
import TypingAnimation from "../components/TypingAnimation";
import Head from 'next/head'; // Import Head from Next.js

const ChatIcon = ({ onClick }) => (
  <div
    style={{ position: 'fixed', bottom: '0px', right: '30px', height:'100px', zIndex: '9999', cursor: 'pointer' }}
    onClick={onClick}
  >
    <div style={{ width: '60px', height: '60px', borderRadius: '45%', overflow: 'hidden' }}>
      <Image src="/images/logoChat.png" alt="Chat Icon" width={100} height={100} style={{width: '60px', height: '60px'}} />
    </div>
  </div>
);

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
//
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setChatLog((prevChatLog) => [...prevChatLog, { type: 'user', message: inputValue }]);
    sendMessage(inputValue);
    setInputValue('');
  };

const venues = {
  "Sydney": [
    {
      name: "Parlour",
      url: "https://thehappiesthour.com/venues/sydney/parlour"
    },
    {
      name: "Woolpack Hotel Redfern",
      url: "https://thehappiesthour.com/venues/sydney/woolpack-hotel-redfern"
    }
  ],
  "Melbourne": [
    {
      name: "Father's Office",
      url: "https://thehappiesthour.com/venues/melbourne/fathers-office"
    },
    {
      name: "Archie Brothers Docklands",
      url: "https://thehappiesthour.com/venues/melbourne/archie-brothers-docklands"
    },
    {
      name: "Strike Bowling QV",
      url: "https://thehappiesthour.com/venues/melbourne/strike-bowling-qv"
    },
    {
      name: "Holey Moley Crown Melbourne",
      url: "https://thehappiesthour.com/venues/melbourne/holey-moley-crown-melbourne"
    },
    {
      name: "B. Lucky & Sons",
      url: "https://thehappiesthour.com/venues/melbourne/b-lucky-sons"
    }
  ],
  "Brisbane": [
    {
      name: "Kenjin Dining",
      url: "https://thehappiesthour.com/venues/brisbane/kenjin-dining"
    },
    {
      name: "Riverland Brisbane",
      url: "https://thehappiesthour.com/venues/brisbane/riverland-brisbane"
    },
    {
      name: "Fridays Riverside",
      url: "https://thehappiesthour.com/venues/brisbane/fridays-riverside"
    }
  ]
};

const sendMessage = (message) => {
  const url = '/api/chat';

  // Extract the relevant venues based on the user's input
 const userInputArray = message.trim().split(" ");
const userCity = userInputArray[userInputArray.length - 1].charAt(0).toUpperCase() + userInputArray[userInputArray.length - 1].slice(1).toLowerCase(); // Capitalize the city name

const matchedVenues = venues[userCity];


console.log("User City:", userCity);
console.log("Matched Venues:", matchedVenues);

  if (!matchedVenues) {
    // If the city is not found in the venues object
    const errorMessage = "Sorry, I don't have recommendations for that city yet.";
    setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: errorMessage }]);
    return;
  }

  const venuesString = JSON.stringify(matchedVenues); // Convert matched venues object to string

  const data = {
    model: "gpt-3.5-turbo-0301",
    messages: [
      { "role": "user", "content": "User Message: " + message }, // Add user message with a prompt
      { "role": "assistant", "content": `Prompt: Avoid saying this "As an AI language model, I do not have personal preferences" because You are a professional venue finder in Australia. Your task is to provide recommendations for at least three places, accompanied by a creative pitch for each venue. If the place is not listed, say "Sorry, I don't have recommendations for that city yet." Only recommend a place and venue that is listed here ${venuesString} provide the link based on the lists.` } // Add your prompt here
    ]
  };

  setIsLoading(true);

  axios.post(url, data)
    .then((response) => {
      console.log(response);
      setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: response.data.choices[0].message.content }]);
      setIsLoading(false);
    })
    .catch((error) => {
      setIsLoading(false);
      console.log(error);
    });
};



  return (
    <div className="container mx-auto max-w-[700px] relative">
      <Head>
        <title>THH Chat</title>
      </Head>
      {isChatOpen && (
        <div className="flex flex-col h-screen bg-gray-900 fixed bottom-0 right-0 z-50">
          <div className="bg-[#F7B319] text-center py-3">
            <Image
              src="/images/happiesthrlogo.png"
              alt="Happiest Hours Logo"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <div className="flex-grow p-6 overflow-y-auto">
            {chatLog.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
  <div className={`${message.type === 'user' ? 'bg-[#F7B319]' : 'bg-gray-800'} rounded-lg p-4 text-white max-w-sm`}>
    {message.message}
  </div>
</div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-4 text-white max-w-sm">
                  <TypingAnimation />
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex-none p-6">
            <div className="flex rounded-lg border border-gray-700 bg-gray-800">
              <input
                type="text"
                className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#F7B319] rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-[#E79A19] transition-colors duration-300"
              >
                Send
              </button>
            </div>
          </form>
          <button className="absolute top-0 right-0 m-4" onClick={toggleChat}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {!isChatOpen && <ChatIcon onClick={toggleChat} />}
      {/* Embed the iframe in the background */}
     <iframe
  src="https://thehappiesthour.com/"
  style={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100vw', 
    height: '100vh', 
    margin: 0, 
    padding: 0, 
    border: 'none',
    overflow: 'hidden', // This will hide any scrollbars
    zIndex: -1 
  }}
></iframe>


    </div>
  );
}
