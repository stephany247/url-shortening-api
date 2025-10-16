import "./style.css";
import axios from "axios";

const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const form = document.getElementById("shorten-form");
const input = document.getElementById("input");
const results = document.getElementById("results");
const errorText = document.querySelector(".error-text");

menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Load saved links when the page loads
window.addEventListener("DOMContentLoaded", loadSavedLinks);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const originalUrl = input.value.trim();
  if (!originalUrl) {
    input.classList.add("border-red-400", "placeholder:text-red-400/40");
    input.classList.remove("border-transparent");

    if (errorText) {
      errorText.textContent = "Please add a link";
      errorText.classList.remove("hidden");
    }
    return;
  }

  input.classList.remove("border-red-500", "placeholder:text-red-400/40");
  input.classList.add("border-transparent");
  if (errorText) {
    errorText.classList.add("hidden");
  }

  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Shortening...";

  try {
    const endpoint = "https://spoo.me/";
    const response = await axios.post(
      endpoint,
      new URLSearchParams({
        url: originalUrl,
        "block-bots": "false",
      }),
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data;
    console.log(data);

    if (data.short_url) {
      const { short_url: shortUrl } = data;
      saveLink({ originalUrl, shortUrl });
      renderLink(originalUrl, shortUrl);
    } else {
      throw new Error(data.error || "Shortening failed");
    }

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
  // Create a result item dynamically

  const resultItem = document.createElement("div");
  resultItem.className =
    "relative bg-white w-full rounded-lg flex flex-col lg:flex-row items-center justify-between shadow text-left";

  resultItem.innerHTML = `
  <p class="w-full font-medium text-left text-gray-950 truncate border-b border-gray-300 p-4 lg:border-none">
    ${originalUrl}
  </p>
  <div class="flex flex-col lg:flex-row lg:items-center justify-end gap-4 p-4 lg:mt-0 w-full">
    <button class="delete-btn">
        <span class="icon-[fa7-solid--xmark-circle] icon"></span>
    </button>
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

  // Delete functionality
  const deleteBtn = resultItem.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    // Remove from UI
    resultItem.remove();

    // Remove from localStorage
    const savedLinks = JSON.parse(localStorage.getItem("shortenedLinks")) || [];
    const updatedLinks = savedLinks.filter(
      (link) => link.shortUrl !== shortUrl
    );
    localStorage.setItem("shortenedLinks", JSON.stringify(updatedLinks));
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
