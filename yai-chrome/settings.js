document.addEventListener("DOMContentLoaded", () => {
  const userInput = document.getElementById("userInput");
  const saveButton = document.getElementById("saveButton");
  const status = document.getElementById("status");

  // Загрузка сохраненного значения при открытии попапа
  chrome.storage.sync.get(["userText"], (result) => {
    if (result.userText) {
      userInput.value = result.userText;
    }
  });

  userInput.addEventListener("input", () => {
    status.textContent = "";
  });

  // Сохранение значения при нажатии на кнопку
  saveButton.addEventListener("click", () => {
    status.textContent = "Saving...";
    const text = userInput.value;
    chrome.storage.sync.set({ userText: text }, () => {
      status.textContent = "Saved!";
      setTimeout(() => {
        status.textContent = "";
      }, 2000);
    });
  });
});
