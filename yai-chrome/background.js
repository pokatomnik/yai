import { fetchSummary, getToken, getSummary } from "./summarizer.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "setToken",
    title: "Set token",
    contexts: ["action"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "setToken") {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const token = await getToken();
  if (!token) {
    return chrome.tabs.sendMessage(tab.id, {
      action: "summary",
      content: "Please specify token first",
    });
  }
  const url = tab.url;
  const summaryUrl = await fetchSummary(token, url);
  if (summaryUrl) {
    const summary = await getSummary(summaryUrl);
    chrome.tabs.sendMessage(tab.id, { action: "summary", content: summary });
  } else {
    chrome.tabs.sendMessage(tab.id, { action: "summary", content: null });
  }
});
