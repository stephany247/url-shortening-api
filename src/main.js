import "./style.css";

const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const form = document.getElementById("shorten-form");
const input = document.getElementById("input");
const results = document.getElementById("results");

menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Load saved links when the page loads
window.addEventListener("DOMContentLoaded", loadSavedLinks);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const originalUrl = input.value.trim();
  if (!originalUrl) {
    alert("Please enter a valid URL");
    return;
  }

  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Shortening...";

  try {
    // 🧩 Use proxy to bypass CORS
    const proxy = "https://corsproxy.io/?";
    const endpoint = "https://spoo.me/";
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        url: originalUrl,
        "block-bots": "false",
      }),
    };

    const response = await fetch(endpoint, options);

    const data = await response.json();
    console.log(data);

    if (!data.short_url) {
      throw new Error(data.error || "Shortening failed");
    }

    const shortUrl = data.short_url;
    // Save to localStorage
    saveLink({ originalUrl, shortUrl });

    // Display link
    renderLink(originalUrl, shortUrl);

    // Reset button
    button.disabled = false;
    button.textContent = "Shorten It!";

    input.value = "";
  } catch (err) {
    alert("Could not shorten link. Try again!");
    console.error(err);
    button.disabled = false;
    button.textContent = "Shorten It!";
  }
});

function renderLink(originalUrl, shortUrl) {
  // ✅ Create a result item dynamically

  const resultItem = document.createElement("div");
  resultItem.className =
    "bg-white w-full rounded-lg flex flex-col lg:flex-row items-center justify-between shadow text-left";

  resultItem.innerHTML = `
  <p class="w-full font-medium text-left text-gray-950 truncate border-b border-gray-300 p-4 lg:border-none">
    ${originalUrl}
  </p>
  <div class="flex flex-col lg:flex-row lg:items-center justify-end gap-4 p-4 lg:mt-0 w-full">
    <a href="${shortUrl}" target="_blank" class="text-cyan-500 hover:underline break-all">${shortUrl}</a>
    <button class="copy-btn w-full lg:w-24 flex items-center justify-center bg-cyan-500 text-white font-semibold px-4 py-2 lg:py-0 rounded-lg hover:opacity-80 transition">
      Copy
    </button>
  </div>
`;

  results.prepend(resultItem);

  // 🩵 Copy functionality
  const copyBtn = resultItem.querySelector(".copy-btn");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(shortUrl);
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("active");
    setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("active");
    }, 1500);
  });
}

// Save to localStorage
function saveLink(link) {
  const savedLinks = JSON.parse(localStorage.getItem("shortenedLinks")) || [];
  savedLinks.push(link);
  localStorage.setItem("shortenedLinks", JSON.stringify(savedLinks));
}

// Load from localStorage
function loadSavedLinks() {
  const savedLinks = JSON.parse(localStorage.getItem("shortenedLinks")) || [];
  savedLinks.forEach(({ originalUrl, shortUrl }) =>
    renderLink(originalUrl, shortUrl)
  );
}
