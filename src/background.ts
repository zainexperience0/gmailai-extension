const GMAIL_ORIGIN = "https://mail.google.com";
let gmailTabId: any;

// Function to set the side panel options based on the tab's URL
const setSidePanelOptions = async (tabId: number, enable: boolean) => {
  await chrome.sidePanel.setOptions({
    tabId,
    path: enable ? '../sidepanel.html' : undefined,
    enabled: enable
  });
};

// Listener for tab updates to enable or disable the side panel
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (!tab.url) return;

  const url = new URL(tab.url);
  if (url.origin === GMAIL_ORIGIN) {
    setSidePanelOptions(tabId, true);
  } else {
    setSidePanelOptions(tabId, false);
  }
});

// Function to query for the existing Gmail tab
const queryGmailTab = () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const gmailTab = tabs.find((tab) => tab.url?.includes("mail.google.com"));
    gmailTabId = gmailTab?.id || null;
    console.log(
      gmailTabId
        ? `Found existing Gmail tab: ${gmailTabId}`
        : "No Gmail tab is currently open."
    );
  });
};

// Open Gmail tab on action button click
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: GMAIL_ORIGIN }, (newTab) => {
    gmailTabId = newTab.id; // Store the ID of the newly created Gmail tab
    console.log("Opened new Gmail tab:", gmailTabId);
  });
});

// Run the Gmail tab query once when the extension is loaded
queryGmailTab();

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse) => {
  if (request.type === "openSidebar") {
    chrome.sidePanel.open({ tabId: sender?.tab?.id });
    return; // Early return to avoid further processing
  }

  // Handle reply request
  if (request.reply) {
    if (gmailTabId) {
      console.log("Received reply:", request.reply);
      chrome.scripting.executeScript({
        target: { tabId: gmailTabId },
        func: (reply: string) => {
          const gmailTextBox = document.querySelector("[role=textbox]") as HTMLInputElement;
          if (gmailTextBox) {
            gmailTextBox.innerText = reply; // Set the reply text
          }
        },
        args: [request.reply], // Pass the reply as an argument
      });
      sendResponse({ status: "ok" });
      return; // Early return to avoid further processing
    }
    sendResponse({
      status: "error",
      message: "No Gmail tab available.",
    });
  } else {
    sendResponse({
      status: "error",
      message: "Reply not received.",
    });
  }
});
