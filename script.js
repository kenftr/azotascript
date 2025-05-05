(async () => {
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;
  function injectAntiDetection() {
    Object.defineProperty(document, "hidden", { get: () => false, configurable: true });
    Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
    document.addEventListener("visibilitychange", e => e.stopImmediatePropagation(), true);
    window.addEventListener("blur", e => e.stopImmediatePropagation(), true);
    window.addEventListener("focus", e => e.stopImmediatePropagation(), true);
    document.addEventListener("fullscreenchange", e => e.stopImmediatePropagation(), true);
    Object.defineProperty(document, "fullscreenElement", { get: () => document.documentElement, configurable: true });
    console.log("Anti-detection injected");
  }
  function removeAntiDetection() {
    location.reload();
  }
  function pauseTimers() {
    window.setTimeout = () => 0;
    window.setInterval = () => 0;
    console.log("Timers paused");
  }
  function resumeTimers() {
    window.setTimeout = originalSetTimeout;
    window.setInterval = originalSetInterval;
    console.log("Timers resumed");
  }
  const getVisibleText = () => {
    const elements = document.querySelectorAll("body *");
    let visibleText = [];
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0
      ) {
        const text = el.innerText.trim();
        if (text) visibleText.push(text);
      }
    });
    return visibleText.join("\n");
  };

  const visibleContent = getVisibleText();
  const api_key = "AIzaSyDuzCXcpNP6PDL7BTZ8WcBhqzMhQgcAkC8"; // Thay bằng API key thực của đệ
  const visibleContent = document.body.innerText.slice(0, 3000); // Lấy nội dung hiển thị (tối đa 3000 ký tự để an toàn)

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + api_key, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: visibleContent }]
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

  const result = await response.json();
  console.log("Phản hồi từ API:", result)
  let oldDiv = document.getElementById("hiddenResult");
  if (oldDiv) oldDiv.remove();
  let resultDiv = document.createElement("div");
  resultDiv.id = "hiddenResult";
  resultDiv.innerHTML = `
    <style>
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes fadeOutScale {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.9);
        }
      }
      :root {
        --bg-color-light: #ffffff;
        --text-color-light: #333333;
        --border-color-light: #ccc;
        --bg-color-dark: #2e2e2e;
        --text-color-dark: #f5f5f5;
        --border-color-dark: #555;
      }
      /* Light mode */
      #hiddenResult.light-mode {
        background: var(--bg-color-light);
        color: var(--text-color-light);
        border: 1px solid var(--border-color-light);
      }
      /* Dark mode */
      #hiddenResult.dark-mode {
        background: var(--bg-color-dark);
        color: var(--text-color-dark);
        border: 1px solid var(--border-color-dark);
      }
      #hiddenResult {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 500px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        font-size: 14px;
        padding: 15px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: fadeInScale 0.5s ease-out;
        transition: background 0.3s, color 0.3s, border 0.3s;
      }
      #hiddenResult.removing {
        animation: fadeOutScale 0.3s ease-in;
      }
      #resultHeader {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      /* Switch style chung */
      .switch {
        display: flex;
        align-items: center;
        margin-right: 10px;
      }
      .switch label {
        margin-left: 5px;
      }
      .toggleSwitch, .modeSwitch, .injectSwitch, .timerSwitch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }
      .toggleSwitch input,
      .modeSwitch input,
      .injectSwitch input,
      .timerSwitch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider, .modeSlider, .injectSlider, .timerSlider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: background-color 0.4s ease, transform 0.2s ease-in-out;
        border-radius: 34px;
      }
      .slider:before,
      .modeSlider:before,
      .injectSlider:before,
      .timerSlider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #66bb6a;
      }
      input:checked + .slider:before {
        transform: translateX(26px) scale(1.1);
      }
      input:checked + .modeSlider {
        background-color: #2196F3;
      }
      input:checked + .modeSlider:before {
        transform: translateX(26px) scale(1.1);
      }
      input:checked + .injectSlider {
        background-color: #ff9800;
      }
      input:checked + .injectSlider:before {
        transform: translateX(26px) scale(1.1);
      }
      input:checked + .timerSlider {
        background-color: #9c27b0;
      }
      input:checked + .timerSlider:before {
        transform: translateX(26px) scale(1.1);
      }
      /* Close button style */
      #closeButton {
        background: transparent;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: inherit;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      #closeButton:hover {
        transform: scale(1.2);
        opacity: 0.8;
      }
      /* Result text */
      #resultText {
        padding-left: 3px;
        overflow-y: auto;
        max-height: 300px;
      }
    </style>
    <div id="resultHeader">
      <div class="switch">
        <label class="toggleSwitch">
          <input type="checkbox" id="toggleResult">
          <span class="slider"></span>
        </label>
        <label for="toggleResult">Ẩn/Hiện</label>
      </div>
      <div class="switch">
        <label class="modeSwitch">
          <input type="checkbox" id="toggleMode">
          <span class="modeSlider"></span>
        </label>
        <label for="toggleMode">Light/Dark</label>
      </div>
      <div class="switch">
        <label class="injectSwitch">
          <input type="checkbox" id="toggleInject">
          <span class="injectSlider"></span>
        </label>
        <label for="toggleInject">Anti-Detection</label>
      </div>
      <div class="switch">
        <label class="timerSwitch">
          <input type="checkbox" id="toggleTimer">
          <span class="timerSlider"></span>
        </label>
        <label for="toggleTimer">Pause Timer</label>
      </div>
      <button id="closeButton">×</button>
    </div>
    <div id="resultText">
      ${result.result.replace(/\n/g, "<br>")}
    </div>
  `;
  resultDiv.classList.add("light-mode");
  document.body.appendChild(resultDiv);
  document.getElementById("closeButton").addEventListener("click", () => {
    let resultBox = document.getElementById("hiddenResult");
    resultBox.classList.add("removing");
    setTimeout(() => resultBox.remove(), 300);
  });
  document.getElementById("toggleResult").addEventListener("change", (e) => {
    const resultTextDiv = document.getElementById("resultText");
    resultTextDiv.style.display = e.target.checked ? "none" : "block";
  });
  document.getElementById("toggleMode").addEventListener("change", (e) => {
    if (e.target.checked) {
      resultDiv.classList.remove("light-mode");
      resultDiv.classList.add("dark-mode");
    } else {
      resultDiv.classList.remove("dark-mode");
      resultDiv.classList.add("light-mode");
    }
  });
  document.getElementById("toggleInject").addEventListener("change", (e) => {
    if (e.target.checked) {
      injectAntiDetection();
    } else {
      removeAntiDetection();
    }
  });
  document.getElementById("toggleTimer").addEventListener("change", (e) => {
    if (e.target.checked) {
      pauseTimers();
    } else {
      resumeTimers();
    }
  });
})().catch(error => {
  console.error("Đã xảy ra lỗi:", error);
  alert("Lỗi xảy ra: " + error.message);
});
