console.log("Dev Extension");

(function () {
    // Define the 10-digit ID directly in the script
    const embeddedId = "abcd1234f5";

    // Function to get query parameters from the URL
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Get the 10-digit ID from the URL
    const scriptIdFromUrl = getQueryParam('id');

    // Determine the unique ID, prioritizing the one from the URL
    const uniqueId = scriptIdFromUrl || embeddedId;

    if (uniqueId) {
        console.log("Script ID:", uniqueId);
        // You can now use this uniqueId within your JavaScript logic
        // For example, you could use it for analytics, specific configurations, etc.
    } else {
        console.log("Script ID not found."); // Should not happen due to the embedded ID
    }

    // Language map (rest of your code remains the same)
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
    const apiKey = "0520d7fd2dmsh930b082d765a440p151642jsn167ced969605";
    const apiUrl = "https://quick-translate.p.rapidapi.com/translate";
    const MAX_TEXT_LENGTH = 5000;

    // Detect and set user language
    let userLang = (navigator.language || navigator.userLanguage || "en").split(
        "-"
    )[0];
    if (!languageMap[userLang]) userLang = "en";

    // Store original English text content
    let originalEnglishTextContents = [];
    let currentLang = "en"; // Track current language of the page

    // Function to extract all text content
    function collectTextContent() {
        const textNodes = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    const content = node.textContent.trim();
                    return content &&
                        !node.parentNode.closest(
                            "script, style, noscript, iframe, #language-selector-container"
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
                text: node.textContent.trim(),
            });
        }

        return textNodes;
    }

    // Fast translation function for whole page
    async function translatePage(targetLang) {
        try {
            // Show loading state
            const selector = document.getElementById("language-selector");
            if (selector) {
                selector.disabled = true;
                const originalText = selector.selectedOptions[0].text;
                selector.selectedOptions[0].text = "Translating...";
            }

            // If we're already in the target language, do nothing
            if (currentLang === targetLang) {
                return;
            }

            // First collect or restore English text if needed
            if (
                originalEnglishTextContents.length === 0 ||
                currentLang !== "en"
            ) {
                await restoreToEnglish();
            }

            // If target is English, we're done (restoreToEnglish already handled it)
            if (targetLang === "en") {
                currentLang = "en";
                return;
            }

            // Prepare text for translation
            const allText = originalEnglishTextContents
                .map((tc) => tc.text)
                .join("\n");

            // Translate in one request
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "x-rapidapi-key": apiKey,
                    "x-rapidapi-host": "quick-translate.p.rapidapi.com",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: allText.substring(0, MAX_TEXT_LENGTH),
                    target: languageMap[targetLang].code,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Handle array response format
            if (Array.isArray(result) && result[0]?.result?.text) {
                const translatedLines = result[0].result.text.split("\n");
                applyTranslation(translatedLines);
            }
            // Handle object response format
            else if (result?.translatedText) {
                const translatedLines = result.translatedText.split("\n");
                applyTranslation(translatedLines);
            } else {
                throw new Error("Invalid API response format");
            }

            currentLang = targetLang;
        } catch (error) {
            console.error("Translation error:", error);
            alert("Translation completed with some errors. Please try again.");
        } finally {
            // Restore UI
            const selector = document.getElementById("language-selector");
            if (selector) {
                selector.disabled = false;
                if (selector.selectedOptions[0].text === "Translating...") {
                    selector.selectedOptions[0].text =
                        languageMap[targetLang].flag +
                        " " +
                        languageMap[targetLang].name;
                }
            }
        }
    }

    async function restoreToEnglish() {
        // If we don't have the original English text, collect it
        if (originalEnglishTextContents.length === 0) {
            originalEnglishTextContents = collectTextContent();
        }
        // If we're not currently in English, restore the original English text
        else if (currentLang !== "en") {
            originalEnglishTextContents.forEach((tc) => {
                tc.node.textContent = tc.text;
            });
        }

        currentLang = "en";
    }

    function applyTranslation(translatedLines) {
        originalEnglishTextContents.forEach((tc, index) => {
            if (translatedLines[index]) {
                tc.node.textContent = translatedLines[index];
            }
        });
    }

    // Language selector UI
    function createLanguageSelector() {
        const container = document.createElement("div");
        container.id = "language-selector-container";
        container.className = "no-translate";

        const selector = document.createElement("select");
        selector.id = "language-selector";

        Object.entries(languageMap).forEach(([lang, info]) => {
            const option = document.createElement("option");
            option.value = lang;
            option.textContent = `${info.flag} ${info.name}`;
            selector.appendChild(option);
        });

        selector.value = userLang;
        selector.addEventListener("change", async function () {
            await translatePage(this.value);
            localStorage.setItem("userLanguage", this.value);
        });

        container.appendChild(selector);
        document.body.prepend(container);

        // Styles
        const style = document.createElement("style");
        style.textContent = `
            #language-selector-container {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
                background: white;
                padding: 8px 12px;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                font-family: Arial, sans-serif;
            }
            #language-selector {
                padding: 6px 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: white;
                font-size: 14px;
                min-width: 180px;
                cursor: pointer;
            }
            #language-selector:disabled {
                opacity: 0.7;
                cursor: wait;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize
    document.addEventListener("DOMContentLoaded", () => {
        const savedLang = localStorage.getItem("userLanguage");
        if (savedLang && languageMap[savedLang]) userLang = savedLang;

        createLanguageSelector();

        // Only auto-translate if not English
        if (userLang !== "en") {
            translatePage(userLang);
        }
    });
})();
