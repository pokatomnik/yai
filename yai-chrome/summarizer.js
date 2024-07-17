export function getToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["userText"], (result) => {
      if (result.userText) {
        resolve(result.userText);
      } else {
        resolve(null);
      }
    });
  });
}

export async function fetchSummary(token, url) {
  try {
    const articleResponse = await fetch("https://300.ya.ru/api/sharing-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `OAuth ${token}`,
      },
      body: JSON.stringify({ article_url: url }),
    });
    const json = await articleResponse.json();
    return json.sharing_url || null;
  } catch {
    return null;
  }
}

export async function getSummary(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const content =
      html.match(/\<meta\s+name="description"\s+content\=\"([^"]*)\"/)?.[1] ||
      "";
    const contentItems = content
      .split("\n")
      .map((item) => {
        return item.replace("•", "").trim();
      })
      .filter(Boolean);
    return contentItems.join("\n");
  } catch (e) {
    return null;
  }
}
