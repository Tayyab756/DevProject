console.log("Dev Extension - Translation Tool Loaded");

(function () {
    // The 10-digit ID that must match the URL parameter
    const requiredId = "abcd1234f5";

    // Function to get the ID from the script src attribute
    function getScriptId() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            // --- MODIFIED LINE BELOW ---
            // Check for the correct filename (case-sensitive) used in your CDN link
            if (script.src.includes('selectLanguagess.js')) {
            // --- END OF MODIFIED LINE ---
                const url = new URL(script.src);
                return url.searchParams.get('id');
            }
        }
        return null;
    }

    const scriptIdFromUrl = getScriptId();
    const trimmedScriptIdFromUrl = scriptIdFromUrl ? scriptIdFromUrl.trim() : null;
    const trimmedRequiredId = requiredId.trim();

    console.log('Script ID Verification:', {
        urlId: trimmedScriptIdFromUrl,
        requiredId: trimmedRequiredId,
        match: trimmedScriptIdFromUrl === trimmedRequiredId
    });

    // Language map
    const languageMap = {
        en: { name: "English", flag: "🇺🇸", code: "en" },
        'en-GB': { name: "English (British)", flag: "🇬🇧", code: "en-GB" },
        zh: { name: "Chinese (Simplified)", flag: "🇨🇳", code: "zh" },
        "zh-TW": { name: "Chinese (Traditional)", flag: "🇹🇼", code: "zh-TW" },
        hi: { name: "Hindi", flag: "🇮🇳", code: "hi" },
        es: { name: "Spanish", flag: "🇪🇸", code: "es" },
        fr: { name: "French", flag: "🇫🇷", code: "fr" },
        ar: { name: "Arabic", flag: "🇸🇦", code: "ar" },
        bn: { name: "Bengali", flag: "🇧🇩", code: "bn" },
        pt: { name: "Portuguese", flag: "🇵🇹", code: "pt" },
        ru: { name: "Russian", flag: "🇷🇺", code: "ru" },
        ur: { name: "Urdu", flag: "🇵🇰", code: "ur" },
        de: { name: "German", flag: "🇩🇪", code: "de" },
        it: { name: "Italian", flag: "🇮🇹", code: "it" },
        nl: { name: "Dutch", flag: "🇳🇱", code: "nl" },
        pl: { name: "Polish", flag: "🇵🇱", code: "pl" },
        uk: { name: "Ukrainian", flag: "🇺🇦", code: "uk" },
        el: { name: "Greek", flag: "🇬🇷", code: "el" },
        cs: { name: "Czech", flag: "🇨🇿", code: "cs" },
        sv: { name: "Swedish", flag: "🇸🇪", code: "sv" },
        hu: { name: "Hungarian", flag: "🇭🇺", code: "hu" },
        fi: { name: "Finnish", flag: "🇫🇮", code: "fi" },
        da: { name: "Danish", flag: "🇩🇰", code: "da" },
        no: { name: "Norwegian", flag: "🇳🇴", code: "no" },
        ro: { name: "Romanian", flag: "🇷🇴", code: "ro" },
        ja: { name: "Japanese", flag: "🇯🇵", code: "ja" },
        ko: { name: "Korean", flag: "🇰🇷", code: "ko" },
        vi: { name: "Vietnamese", flag: "🇻🇳", code: "vi" },
        th: { name: "Thai", flag: "🇹🇭", code: "th" },
        id: { name: "Indonesian", flag: "🇮🇩", code: "id" },
        ms: { name: "Malay", flag: "🇲🇾", code: "ms" },
        tl: { name: "Filipino", flag: "🇵🇭", code: "tl" },
        my: { name: "Burmese", flag: "🇲🇲", code: "my" },
        km: { name: "Khmer", flag: "🇰🇭", code: "km" },
        lo: { name: "Lao", flag: "🇱🇦", code: "lo" },
        fa: { name: "Persian", flag: "🇮🇷", code: "fa" },
        he: { name: "Hebrew", flag: "🇮🇱", code: "he" },
        tr: { name: "Turkish", flag: "🇹🇷", code: "tr" },
        sw: { name: "Swahili", flag: "🇰🇪", code: "sw" },
        ha: { name: "Hausa", flag: "🇳🇬", code: "ha" },
        am: { name: "Amharic", flag: "🇪🇹", code: "am" },
        zu: { name: "Zulu", flag: "🇿🇦", code: "zu" },
        xh: { name: "Xhosa", flag: "🇿🇦", code: "xh" },
        ta: { name: "Tamil", flag: "🇱🇰", code: "ta" },
        te: { name: "Telugu", flag: "🇮🇳", code: "te" },
        mr: { name: "Marathi", flag: "🇮🇳", code: "mr" },
        pa: { name: "Punjabi", flag: "🇮🇳", code: "pa" },
        gu: { name: "Gujarati", flag: "🇮🇳", code: "gu" },
        kn: { name: "Kannada", flag: "🇮🇳", code: "kn" },
        ml: { name: "Malayalam", flag: "🇮🇳", code: "ml" },
        si: { name: "Sinhala", flag: "🇱🇰", code: "si" },
        ne: { name: "Nepali", flag: "🇳🇵", code: "ne" },
    };

    // API Configuration
    const apiKey = "0520d7fd2dmsh930b082d765a440p151642jsn167ced969605"; // Replace with your actual RapidAPI key if needed
    const apiUrl = "https://quick-translate.p.rapidapi.com/translate";
    const MAX_TEXT_LENGTH = 5000; // Max characters per API request

    // Detect and set user language
    let userLang = (navigator.language || navigator.userLanguage || "en").split("-")[0];
    if (!languageMap[userLang]) userLang = "en"; // Default to English if browser language not in map

    // Store original English text content { node: TextNode, text: string }
    let originalEnglishTextContents = [];
    let currentLang = "en"; // Track the currently displayed language

    // Function to extract all relevant text nodes from the page
    function collectTextContent() {
        const textNodes = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    // Only accept non-empty text nodes that aren't inside specific tags or the selector itself
                    const content = node.textContent.trim();
                    return content &&
                        !node.parentNode.closest(
                            "script, style, noscript, iframe, #language-selector-container" // Exclude these elements
                        )
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT;
                },
            },
            false
        );

        while (walker.nextNode()) {
            const node = walker.currentNode;
            textNodes.push({
                node: node,
                text: node.textContent.trim(), // Store the original trimmed text
            });
        }

        return textNodes;
    }

    // Main function to translate the page content
    async function translatePage(targetLang) {
        // Crucial Check: Only proceed if the ID from the script URL matches the required ID
        if (trimmedScriptIdFromUrl !== trimmedRequiredId) {
            console.log("Translation disabled - ID mismatch. URL ID:", trimmedScriptIdFromUrl, "Required ID:", trimmedRequiredId);
            // Optionally, you could hide the selector or show a message
            const selectorElement = document.getElementById("language-selector");
             if (selectorElement) {
                 selectorElement.disabled = true;
                 selectorElement.title = "Translation unavailable (ID mismatch)";
                 // Maybe hide it entirely: document.getElementById("language-selector-container").style.display = 'none';
             }
            return;
        }

        try {
            console.log(`Starting translation to ${targetLang}`);

            // --- UI Loading State ---
            const selector = document.getElementById("language-selector");
            let originalSelectorText = "";
            if (selector) {
                selector.disabled = true; // Disable dropdown during translation
                const selectedOption = selector.options[selector.selectedIndex];
                originalSelectorText = selectedOption.text; // Store current text
                selectedOption.text = "Translating..."; // Show feedback
            }
            // --- End UI Loading State ---

            // If we're already in the target language, no need to do anything
            if (currentLang === targetLang) {
                console.log("Already in target language:", targetLang);
                 // Restore selector text if it was changed to "Translating..."
                 if (selector && selector.options[selector.selectedIndex].text === "Translating...") {
                     selector.options[selector.selectedIndex].text = originalSelectorText;
                 }
                return; // Exit early
            }

            // --- Ensure English Text is Ready ---
            // If original English text hasn't been captured OR if the page is currently showing a translation,
            // restore the original English text first.
            if (originalEnglishTextContents.length === 0 || currentLang !== "en") {
                console.log("Collecting or restoring English text.");
                await restoreToEnglish(); // This also sets currentLang to 'en'
            }
            // --- End Ensure English Text ---

            // If the target language is English, we just restored it, so we're done.
            if (targetLang === "en") {
                console.log("Target is English. Restoration complete.");
                currentLang = "en"; // Ensure state is correct
                 // Restore selector text after potentially restoring to English
                 if (selector) {
                     const selectedOption = selector.options[selector.selectedIndex];
                     // Make sure the display text matches the selected value
                     selectedOption.text = languageMap[selector.value].flag + " " + languageMap[selector.value].name;
                 }
                return; // Exit after restoring to English
            }

            // --- Prepare for Translation API Call ---
            // Join all original English text pieces with a newline separator
            const allText = originalEnglishTextContents
                .map((tc) => tc.text) // Get just the text strings
                .join("\n");          // Join them with newlines

            // Check if there's actually text to translate
            if (!allText.trim()) {
                 console.log("No text content found to translate.");
                 currentLang = targetLang; // Update language state anyway
                 return;
             }

            console.log("Sending translation request. Text length:", allText.length);
             if (allText.length > MAX_TEXT_LENGTH) {
                 console.warn(`Text length (${allText.length}) exceeds API limit (${MAX_TEXT_LENGTH}). Truncating.`);
             }
            // --- End Preparation ---

            // --- API Call ---
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "x-rapidapi-key": apiKey,
                    "x-rapidapi-host": "quick-translate.p.rapidapi.com",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: allText.substring(0, MAX_TEXT_LENGTH), // Send text (truncated if necessary)
                    target: languageMap[targetLang].code,       // Target language code
                    // source: 'en' // Optionally specify source language if needed by API
                }),
            });

            if (!response.ok) {
                // Log more details on error
                const errorBody = await response.text();
                console.error("API Response Error Body:", errorBody);
                throw new Error(`HTTP error! Status: ${response.status}. Check console for details.`);
            }

            const result = await response.json();
            console.log("Translation API response received:", result);
            // --- End API Call ---

            // --- Process API Response ---
            let translatedText = "";
            // Adapt based on the actual structure of the successful API response
            if (result && result.translatedText) { // Check for common property names
                 translatedText = result.translatedText;
            } else if (Array.isArray(result) && result[0]?.result?.text) { // Handle potential array structure
                 translatedText = result[0].result.text;
            } else if (typeof result === 'string') { // Handle if API returns just the string
                 translatedText = result;
            } else {
                 // Log the unexpected structure
                 console.error("Unexpected API response format:", result);
                 throw new Error("Invalid API response format. Check console.");
            }


            // Split the translated text back into lines based on the newline separator used
            const translatedLines = translatedText.split("\n");

            // Apply the translations back to the corresponding text nodes
            applyTranslation(translatedLines);
            // --- End Processing ---

            currentLang = targetLang; // Update the current language state
            console.log("Translation completed successfully for", targetLang);

        } catch (error) {
            console.error("Translation process error:", error);
            // Provide feedback to the user (optional)
             alert("Sorry, translation failed: " + error.message);
             // Attempt to restore original selector text on error
             const selector = document.getElementById("language-selector");
             if (selector && selector.options[selector.selectedIndex].text === "Translating...") {
                 try { // Use try-catch as languageMap might not be available if init failed badly
                     selector.options[selector.selectedIndex].text = languageMap[selector.value].flag + " " + languageMap[selector.value].name;
                 } catch (e) {
                     console.error("Error restoring selector text:", e);
                     // Fallback if languageMap fails
                     selector.options[selector.selectedIndex].text = selector.value;
                 }
             }
        } finally {
            // --- Restore UI State ---
            // Always re-enable the selector and restore its text after attempt (success or failure)
            const selector = document.getElementById("language-selector");
            if (selector) {
                selector.disabled = false; // Re-enable the dropdown
                 const selectedOption = selector.options[selector.selectedIndex];
                 // If it still says "Translating...", restore the proper display text
                 if (selectedOption.text === "Translating...") {
                      try {
                          selectedOption.text = languageMap[selector.value].flag + " " + languageMap[selector.value].name;
                      } catch (e) {
                           console.error("Error restoring selector text in finally block:", e);
                           // Fallback
                           selectedOption.text = selector.value;
                      }
                 }
            }
            // --- End Restore UI State ---
        }
    }

    // Function to restore the page to its original English text
    async function restoreToEnglish() {
        console.log("Restoring to English...");

        // If we haven't captured the original text yet, do it now.
        if (originalEnglishTextContents.length === 0) {
            originalEnglishTextContents = collectTextContent();
            console.log("Collected original English text nodes:", originalEnglishTextContents.length);
        }
        // If the page is currently translated (not 'en'), revert nodes to original text.
        else if (currentLang !== "en") {
             console.log("Reverting nodes to stored English text.");
            originalEnglishTextContents.forEach((textInfo) => {
                 // Check if the node still exists in the DOM before modifying
                 if (textInfo.node && document.contains(textInfo.node)) {
                     textInfo.node.textContent = textInfo.text; // Restore original text
                 } else {
                     console.warn("Text node no longer in DOM, skipping restore:", textInfo.text);
                 }
            });
        } else {
             console.log("Already in English or original text just collected.");
         }

        currentLang = "en"; // Set the state to English
    }

    // Function to apply the translated text lines back to the text nodes
    function applyTranslation(translatedLines) {
        console.log("Applying translation to", originalEnglishTextContents.length, "nodes.");
        originalEnglishTextContents.forEach((textInfo, index) => {
            // Check if a corresponding translated line exists
            if (translatedLines[index] !== undefined) {
                 // Check if the node still exists in the DOM
                 if (textInfo.node && document.contains(textInfo.node)) {
                     textInfo.node.textContent = translatedLines[index]; // Update with translated text
                 } else {
                     console.warn("Text node no longer in DOM, skipping apply translation:", textInfo.text);
                 }
            } else {
                // This might happen if the API returns fewer lines than expected
                console.warn(`Missing translation for index ${index}, original text: "${textInfo.text}"`);
                 // Optionally restore original text here, or leave it as is if it was already English
                 // if (textInfo.node && document.contains(textInfo.node)) {
                 //     textInfo.node.textContent = textInfo.text;
                 // }
            }
        });
    }

    // Function to create and inject the language selector dropdown UI
    function createLanguageSelector() {
        console.log("Creating language selector UI");

        // --- Remove existing selector to prevent duplicates on potential re-runs ---
        const existingContainer = document.getElementById("language-selector-container");
        if (existingContainer) {
            console.log("Removing existing language selector.");
            existingContainer.remove();
        }
        // --- End Remove Existing ---

        // Create container div
        const container = document.createElement("div");
        container.id = "language-selector-container";
        // Add 'no-translate' class if you use external translation services like Google Translate widget
        // to prevent translating the selector itself.
        container.className = "notranslate"; // Google Translate respects this class name

        // Create select element
        const selector = document.createElement("select");
        selector.id = "language-selector";

        // Populate dropdown options from the languageMap
        Object.entries(languageMap).forEach(([langCode, langInfo]) => {
            const option = document.createElement("option");
            option.value = langCode; // e.g., 'en', 'es'
            option.textContent = `${langInfo.flag} ${langInfo.name}`; // e.g., '🇺🇸 English'
            selector.appendChild(option);
        });

        // --- Set Initial Value ---
        // Try to get language saved in localStorage, otherwise use browser's detected language, fallback to 'en'
        const savedLang = localStorage.getItem("userLanguage");
        let initialLang = userLang; // Default to browser language
        if (savedLang && languageMap[savedLang]) {
             initialLang = savedLang; // Use saved language if valid
             console.log("Using saved language:", initialLang);
         } else {
             console.log("Using browser/default language:", initialLang);
         }
        selector.value = initialLang; // Set the dropdown's selected value
        // --- End Initial Value ---

        // Add event listener for when the user changes the language
        selector.addEventListener("change", async function () {
            const selectedLang = this.value;
            console.log("Language selection changed to:", selectedLang);
            localStorage.setItem("userLanguage", selectedLang); // Save preference
            await translatePage(selectedLang); // Trigger translation
        });

        container.appendChild(selector); // Add dropdown to container
        document.body.prepend(container); // Add container to the top of the body

        // --- Add CSS Styling ---
        const style = document.createElement("style");
        style.textContent = `
            #language-selector-container {
                position: fixed;
                top: 15px;
                right: 15px;
                z-index: 10000; /* High z-index to stay on top */
                background: rgba(255, 255, 255, 0.9); /* Slightly transparent background */
                padding: 8px 12px;
                border-radius: 5px;
                box-shadow: 0 3px 12px rgba(0,0,0,0.15);
                font-family: Arial, sans-serif;
                backdrop-filter: blur(3px); /* Optional: blur background */
                -webkit-backdrop-filter: blur(3px); /* Safari */
            }
            #language-selector {
                padding: 7px 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: white;
                font-size: 14px;
                min-width: 180px; /* Adjust as needed */
                cursor: pointer;
                transition: opacity 0.2s ease-in-out; /* Smooth transition for disabled state */
            }
            #language-selector:hover {
                border-color: #aaa;
            }
            #language-selector:focus {
                outline: none;
                border-color: #007bff; /* Highlight on focus */
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }
            #language-selector:disabled {
                opacity: 0.6; /* Make it look faded when disabled */
                cursor: wait; /* Indicate loading state */
                background: #f0f0f0;
            }
            /* Ensure container itself isn't translated by external tools */
            .notranslate {
                translate: no;
            }
        `;
        document.head.appendChild(style);
        // --- End Styling ---
    }

    // Initialization function
    function initialize() {
        console.log("Initializing translation tool...");

        // First, perform the ID check. If it fails, don't even create the selector.
        if (trimmedScriptIdFromUrl !== trimmedRequiredId) {
             console.error("Initialization aborted: Script ID does not match required ID.");
             console.error("URL ID:", trimmedScriptIdFromUrl, "| Required ID:", trimmedRequiredId);
             // Optionally add a visible error message to the page for debugging
             // const errorDiv = document.createElement('div');
             // errorDiv.style.cssText = 'position:fixed; top:0; left:0; background:red; color:white; padding:10px; z-index:10001;';
             // errorDiv.textContent = 'Translation Tool Error: Invalid ID';
             // document.body.prepend(errorDiv);
             return; // Stop initialization
         }

        // ID matched, proceed with creating the UI
        createLanguageSelector();

        // --- Auto-translate Logic ---
        // Get the language the selector is initially set to (saved or browser default)
        const initialLang = document.getElementById("language-selector").value;

        // Automatically translate *only if* the initial language is NOT English.
        // The ID check is implicitly handled because initialize() wouldn't run if it failed.
        if (initialLang !== "en") {
            console.log("Initial language is not English. Auto-translating to:", initialLang);
            // We need the original text first, so collect/restore ensures it's ready
            restoreToEnglish().then(() => {
                 // Now translate to the target initial language
                 translatePage(initialLang);
             });
        } else {
            console.log("Initial language is English. No auto-translation needed.");
             // Even if not auto-translating, ensure original text is collected for future switches.
             restoreToEnglish();
         }
        // --- End Auto-translate Logic ---
    }

    // Start the process when the HTML document structure is ready
    if (document.readyState === "loading") {
        // Loading hasn't finished yet
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        // `DOMContentLoaded` has already fired
        initialize();
    }

})(); // End of IIFE (Immediately Invoked Function Expression)
