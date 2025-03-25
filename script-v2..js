(async () => {
  // Lưu trữ các hàm gốc của setTimeout và setInterval
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;

  // Hàm chặn phát hiện: inject đoạn mã chống phát hiện
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

  // Hàm gỡ chặn: reload trang để khôi phục trạng thái ban đầu
  function removeAntiDetection() {
    location.reload();
  }

  // Hàm tạm ngưng bộ đếm thời gian: ghi đè setTimeout và setInterval thành hàm không làm gì
  function pauseTimers() {
    window.setTimeout = () => 0;
    window.setInterval = () => 0;
    console.log("Timers paused");
  }

  // Hàm khôi phục bộ đếm thời gian: phục hồi các hàm gốc
  function resumeTimers() {
    window.setTimeout = originalSetTimeout;
    window.setInterval = originalSetInterval;
    console.log("Timers resumed");
  }

  // Lấy nội dung hiển thị trên trang
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

  // Gửi request đến API
  const response = await fetch("https://d329-113-180-71-84.ngrok-free.app/solve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content: visibleContent })
  });

  if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

  const result = await response.json();
  console.log("Phản hồi từ API:", result);

  // Xóa khung kết quả cũ nếu có
  let oldDiv = document.getElementById("hiddenResult");
  if (oldDiv) oldDiv.remove();

  // Tạo khung kết quả mới với giao diện hiện đại, animation, Light/Dark mode,
  // ẩn/hiện, switch Inject Anti-Detection và switch Pause Timer.
  // Các switch được đưa vào một div bên trái.
  let resultDiv = document.createElement("div");
  resultDiv.id = "hiddenResult";
  resultDiv.innerHTML = `
    <style>
      @keyframes fadeInScale {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes fadeOutScale {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
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
        box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
        border-radius: 8px;
        font-size: 14px;
        padding: 15px;
        z-index: 9999;
        display: flex;
        flex-direction: row;
        overflow: hidden;
        animation: fadeInScale 0.5s ease-out;
        transition: background 0.3s, color 0.3s, border 0.3s;
      }
      #hiddenResult.removing { animation: fadeOutScale 0.3s ease-in; }
      /* Div chứa switch bên trái */
      #switchContainer {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-right: 10px;
        border-right: 1px solid #ccc;
        margin-right: 10px;
      }
      /* Switch style chung */
      .switch {
        display: flex;
        align-items: center;
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
      input:checked + .slider { background-color: #66bb6a; }
      input:checked + .slider:before { transform: translateX(26px) scale(1.1); }
      input:checked + .modeSlider { background-color: #2196F3; }
      input:checked + .modeSlider:before { transform: translateX(26px) scale(1.1); }
      input:checked + .injectSlider { background-color: #ff9800; }
      input:checked + .injectSlider:before { transform: translateX(26px) scale(1.1); }
      input:checked + .timerSlider { background-color: #9c27b0; }
      input:checked + .timerSlider:before { transform: translateX(26px) scale(1.1); }
      /* Khu vực hiển thị kết quả */
      #resultContent {
        flex: 1;
        overflow-y: auto;
        max-height: 300px;
        padding-left: 10px;
      }
      /* Close button style */
      #closeButton {
        background: transparent;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: inherit;
        transition: transform 0.2s ease, opacity 0.2s ease;
        align-self: flex-start;
      }
      #closeButton:hover { transform: scale(1.2); opacity: 0.8; }
    </style>
    <div id="switchContainer">
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
    <div id="resultContent">
      ${result.result.replace(/\n/g, "<br>")}
    </div>
  `;

  // Gán mode mặc định là Light Mode
  resultDiv.classList.add("light-mode");
  document.body.appendChild(resultDiv);

  // Sự kiện đóng khung kết quả với hiệu ứng fade-out scale
  document.getElementById("closeButton").addEventListener("click", () => {
    let resultBox = document.getElementById("hiddenResult");
    resultBox.classList.add("removing");
    setTimeout(() => resultBox.remove(), 300);
  });

  // Sự kiện ẩn/hiện nội dung kết quả khi toggle switch
  document.getElementById("toggleResult").addEventListener("change", (e) => {
    const resultContentDiv = document.getElementById("resultContent");
    resultContentDiv.style.display = e.target.checked ? "none" : "block";
  });

  // Sự kiện chuyển đổi Light/Dark mode với hiệu ứng mượt mà
  document.getElementById("toggleMode").addEventListener("change", (e) => {
    if (e.target.checked) {
      resultDiv.classList.remove("light-mode");
      resultDiv.classList.add("dark-mode");
    } else {
      resultDiv.classList.remove("dark-mode");
      resultDiv.classList.add("light-mode");
    }
  });

  // Sự kiện kích hoạt/tắt đoạn mã chống phát hiện
  document.getElementById("toggleInject").addEventListener("change", (e) => {
    if (e.target.checked) {
      injectAntiDetection();
    } else {
      removeAntiDetection();
    }
  });

  // Sự kiện tạm ngưng/khôi phục bộ đếm thời gian
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
