// Function to add red buttons for AI post rewriting
// Function to add red buttons for AI post rewriting
function addRedButtons(shareBoxElement) {
  const parentDiv = shareBoxElement.querySelector(
    ".share-creation-state__footer.justify-flex-end"
  );

  // Check if buttons are already added
  if (parentDiv) {
    var existingButtons = parentDiv.querySelectorAll(".toolbar");

    if (!existingButtons || existingButtons.length < 1) {
      let toast = document.getElementById("toast");
      if (!toast) {
        const toastDiv = document.createElement("div");
        toastDiv.id = "toast";
        toastDiv.className = "toast";
        parentDiv.insertBefore(toastDiv, parentDiv.firstChild);
      }

      // Create new buttons
      const div = document.createElement("div");
      div.className = "toolbar";
      div.style.display = "flex";
      div.style.justifyContent = "flex-start"; // Add justify-content: flex-start
      div.innerHTML = `
        <div class="toggle-group">
          <input type="checkbox" id="emoji-toggle" class="toggle-input" style="margin:0px !important" checked>
          <label for="emoji-toggle" class="button toggle-label" style="margin:0px !important">
            <span class="toggle-switch"></span>
            Emojis😀
          </label>
          <input type="checkbox" id="htag-toggle" class="toggle-input" style="margin:0px !important;" checked>
          <label for="htag-toggle" class="button toggle-label" style="margin:0px !important; display: none">
            <span class="toggle-switch"></span>
            HashTag🔖
          </label>
        </div>
        <button id="postButton" class="button red-button" style="margin-left:5px !important; padding: 10px">Rewrite with AI✨</button>
        <div id="loading" style="display: none;">
          <div class="loader-3"><span></span></div>
        </div>
      `;

      // Insert buttons as the first child of the parent div
      parentDiv.insertBefore(div, parentDiv.firstChild);

      // Add event listener for the "Rewrite with AI" button
      let postButton = document.getElementById("postButton");
      postButton.addEventListener("click", initiatePostData);
    }
  }
}

// Function to initiate the process of posting data to the server for rewriting
function initiatePostData() {
  var textContent = document.querySelector(".ql-editor").textContent;
  if (textContent != "") {
    // Disable the button to prevent multiple clicks
    document.getElementById("postButton").disabled = true;
    document.getElementById("postButton").style.backgroundColor = "#bdbebf";

    // Show loading animation
    document.getElementById("loading").style.display = "block";

    // Get toggle values for emojis and hashtags
    var emojiToggle = document.getElementById("emoji-toggle").checked;
    var htagToggle = document.getElementById("htag-toggle").checked;

    // Make POST request to the server
    fetchPostData(textContent, emojiToggle, htagToggle);
  } else {
    showToast("Write something to generate with AI");
  }
}

// Function to send POST request to the server for rewriting the content
function fetchPostData(textContent, emojiToggle, htagToggle) {
  fetch("http://127.0.0.1/rewrite/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postInput: textContent,
      emojiNeeded: emojiToggle,
      htagNeeded: htagToggle,
    }),
  })
    .then(handleResponse)
    .then((data) => {
      const responseAI = data.rewriteAI;
      const editor = document.querySelector(".ql-editor");
      editor.textContent = ""; // Clear the .ql-editor content
      let i = 0;
      const typingEffect = setInterval(() => {
        editor.textContent += responseAI.charAt(i);
        i++;
        if (i > responseAI.length) {
          clearInterval(typingEffect);
          // Re-enable the button
          document.getElementById("postButton").disabled = false;
          document.getElementById("postButton").style.backgroundColor =
            "#ff4d4d";
          document.getElementById("loading").style.display = "none";
        }
      }, 25);
    })
    .catch(handleError);
}

// Function to handle response from the server
function handleResponse(response) {
  if (!response.ok) {
    showToast("Bad Request");
    return { rewriteAI: "" };
  }
  return response.json();
}

// Function to handle errors during the POST request
function handleError(error) {
  // Update button style and show error toast
  document.getElementById("postButton").style.backgroundColor = "#ff4d4d";
  showToast("An Error Occurred");

  // Re-enable the button and hide loading animation
  document.getElementById("postButton").disabled = false;
  document.getElementById("loading").style.display = "none";
}

// Function to display toast message
function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";

  // Hide the toast after a certain duration (e.g., 3 seconds)
  setTimeout(function () {
    toast.style.display = "none";
  }, 3000); // Adjust the duration as needed
}

// Mutation observer for the target node
const targetNode = document.getElementById("artdeco-modal-outlet");
let observer;
let observer1;

// Function to observe mutations in the target node
function observeMutations() {
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const modalOutlet = targetNode;

      if (modalOutlet) {
        const shareBoxElement = modalOutlet.querySelector(".share-box");

        if (shareBoxElement) {
          if (observer1) {
            observer1.disconnect();
            observer1 = null;
          }
          observer1 = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              addRedButtons(shareBoxElement);
            });
          });
          observer1.observe(shareBoxElement, { childList: true });

          addRedButtons(shareBoxElement);
        }
      }
    });
  });

  // Start observing mutations in the target node
  observer.observe(targetNode, { childList: true });
}

// Start observing mutations
// observeMutations();
window.onload = function () {
  observeMutations();
};

// Event listener for beforeunload event to disconnect observers
window.addEventListener("beforeunload", function (e) {
  disconnectObservers();
});

// Function to disconnect the observers
function disconnectObservers() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (observer1) {
    observer1.disconnect();
    observer1 = null;
  }
}

// Function to check for the latest release from GitHub
function checkForUpdates() {
  fetch("https://api.github.com/repos/zpratikpathak/LinkedinAI/releases/latest")
    .then((response) => response.json())
    .then((data) => {
      const latestVersion = data.tag_name.replace("release-", "");
      const currentVersion = "<current version>"; // replace with the current version of your extension
      if (latestVersion !== currentVersion) {
        const downloadUrl = data.assets[0].browser_download_url;
        showToast(`New version available. Download here: ${downloadUrl}`);
      }
    })
    .catch((error) => console.error("Error:", error));
}

// Call the function to check for updates
// checkForUpdates();
