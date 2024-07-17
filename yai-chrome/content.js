chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summary") {
    if (request.content) {
      alert(request.content);
    } else {
      alert("Can't summarize this page");
    }
  }
});
