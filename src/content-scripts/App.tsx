import { Bot, X } from "lucide-react";
import { useState } from "react";

function App() {
  const [showPopup, setShowPopup] = useState(false);

  const handleMessage = (message: any) => {
    chrome.runtime.sendMessage(message);
  };

  const sendEmail = () => {
    const replySpan = Array.from(document.querySelectorAll("span")).find(
      (span) => span.innerText === "Reply"
    );
    if (replySpan) {
      replySpan.click();
    }
    const emailElement = document.querySelector(".adn.ads") as HTMLDivElement;
    const titleElement = document.querySelector(".ha > h2") as HTMLDivElement;
    if (emailElement && titleElement) {
      handleMessage({email: emailElement.innerText, url: window.location.href, title: titleElement.innerText });
    }
  };

  const togglePopup = () => {
    handleMessage({ type: showPopup ? "closeSidebar" : "openSidebar" });
    setShowPopup((prev) => {
      if (!prev) {
        // If the popup is opening, set a timeout to send the email
        setTimeout(sendEmail, 2000); // Run sendEmail after 5 seconds
      }
      return !prev; // Toggle the popup state
    });
  };

  return (
    <div className="fixed bottom-10 right-10 z-50">
      <div
        className="h-16 w-16 rounded-full bg-red-400 flex items-center justify-center cursor-pointer transition-transform transform hover:scale-105"
        onClick={togglePopup}
      >
        {showPopup ? (
          <X className="h-8 w-8 text-white" />
        ) : (
          <Bot className="h-8 w-8 text-white" />
        )}
      </div>
    </div>
  );
}

export default App;
