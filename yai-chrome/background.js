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
  const url = tab.url;
  const summaryResponse = await fetchSummary(token, url);
  console.log(summaryResponse);
});

function getToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["userText"], (result) => {
      if (result.userText) {
        resolve(result.userText);
      } else {
        reject(new Error("No token"));
      }
    });
  });
}

async function fetchSummary(token, url) {
  const articleResponse = await fetch("https://300.ya.ru/api/sharing-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `OAuth ${token}`,
    },
    body: JSON.stringify({ article_url: url }),
  });
  const json = articleResponse.json();
  console.log(json);
}
