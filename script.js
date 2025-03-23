(async () => {
  // Hàm chặn phát hiện: inject đoạn mã chống phát hiện
  function injectAntiDetection() {
    // Override các thuộc tính và sự kiện để ẩn trạng thái ẩn của trang
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
  const response = await fetch("https://9829-113-178-136-136.ngrok-free.app/solve", {
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

  // Tạo khung kết quả mới với giao diện hiện đại, animation, Light/Dark mode, ẩn/hiện và switch inject anti-detection
  let resultDiv = document.createElement("div");
  resultDiv.id = "hiddenResult";
  resultDiv.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
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
        animation: fadeIn 0.5s ease;
        transition: background 0.3s, color 0.3s, border 0.3s;
      }
      #resultHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      /* Switch style cho ẩn/hiện kết quả */
      .toggleSwitch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 20px;
      }
      .toggleSwitch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 34px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
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
        transform: translateX(20px);
      }
      /* Switch cho Light/Dark mode */
      .modeSwitch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
        margin-left: 15px;
      }
      .modeSwitch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .modeSlider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 34px;
      }
      .modeSlider:before {
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
      input:checked + .modeSlider {
        background-color: #2196F3;
      }
      input:checked + .modeSlider:before {
        transform: translateX(26px);
      }
      /* Switch cho Anti-Detection */
      .injectSwitch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
        margin-left: 15px;
      }
      .injectSwitch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .injectSlider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 34px;
      }
      .injectSlider:before {
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
      input:checked + .injectSlider {
        background-color: #ff9800;
      }
      input:checked + .injectSlider:before {
        transform: translateX(26px);
      }
      /* Close button style */
      #closeButton {
        background: transparent;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: inherit;
      }
      #closeButton:hover {
        opacity: 0.7;
      }
      /* Result text */
      #resultText {
        padding-left: 3px;
        overflow-y: auto;
        max-height: 300px;
      }
    </style>
    <div id="resultHeader">
      <div style="display: flex; align-items: center;">
        <label class="toggleSwitch">
          <input type="checkbox" id="toggleResult">
          <span class="slider"></span>
        </label>
        <span style="margin-left: 8px;">Ẩn/Hiện</span>
        <label class="modeSwitch">
          <input type="checkbox" id="toggleMode">
          <span class="modeSlider"></span>
        </label>
        <span style="margin-left: 8px;">Light/Dark</span>
        <label class="injectSwitch">
          <input type="checkbox" id="toggleInject">
          <span class="injectSlider"></span>
        </label>
        <span style="margin-left: 8px;">Inject Anti-Detection</span>
      </div>
      <button id="closeButton">×</button>
    </div>
    <div id="resultText">
      ${result.result.replace(/\n/g, "<br>")}
    </div>
  `;

  // Gán mode mặc định là Light Mode
  resultDiv.classList.add("light-mode");
  document.body.appendChild(resultDiv);

  // Sự kiện đóng khung kết quả
  document.getElementById("closeButton").addEventListener("click", () => {
    document.getElementById("hiddenResult").remove();
  });

  // Sự kiện ẩn/hiện nội dung kết quả khi toggle switch
  document.getElementById("toggleResult").addEventListener("change", (e) => {
    const resultTextDiv = document.getElementById("resultText");
    resultTextDiv.style.display = e.target.checked ? "none" : "block";
  });

  // Sự kiện chuyển đổi Light/Dark mode
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
})().catch(error => {
  console.error("Đã xảy ra lỗi:", error);
  alert("Lỗi xảy ra: " + error.message);
});


