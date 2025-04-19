(function () {
    // Get the ID from the script src URL first
    function getScriptId() {
        const scripts = document.getElementsByTagName("script");
        for (let script of scripts) {
            if (script.src.includes("selectLanguage.js")) {
                const url = new URL(script.src);
                const idParam = url.searchParams.get("id");
                return idParam ? idParam.trim() : null;
            }
        }
        return null;
    }

    const scriptIdFromUrl = getScriptId();
    console.log("Script ID from URL:", scriptIdFromUrl);
    let validWebsiteId = scriptIdFromUrl;
    const currentWebsiteUrl = window.location.href;
    let validWebsiteURL = currentWebsiteUrl;
    console.log("Current website URL:", currentWebsiteUrl);

    // Configuration defaults
    var config = window.widgetConfig || {};

    // Get the base URL from the script source
    function getBaseUrl() {
        const scripts = document.getElementsByTagName("script");
        for (let script of scripts) {
            if (script.src.includes("selectLanguage.js")) {
                const url = new URL(script.src);
                return `${url.protocol}//${url.host}`;
            }
        }
        return window.location.origin;
    }

    const baseUrl = getBaseUrl();

    fetch(
        `${baseUrl}/api/getGeneratedId?url=${encodeURIComponent(
            currentWebsiteUrl + "?id=" + scriptIdFromUrl
        )}`
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Data fetched successfully:", data);
            
            // Extract widget configuration from the response
            if (data && data.widget_config) {
                try {
                    // Parse the widget_config if it's a string
                    const widgetConfig = typeof data.widget_config === 'string' 
                        ? JSON.parse(data.widget_config) 
                        : data.widget_config;
                    
                    // Dynamically apply all configuration properties from the server
                    Object.keys(widgetConfig).forEach(key => {
                        // Only override if not already set by inline configuration
                        if (config[key] === undefined) {
                            config[key] = widgetConfig[key];
                        }
                    });
                    
                    // Ensure critical properties have defaults if not provided
                    config.position = config.position || 'bottom-right';
                    config.buttonColor = config.buttonColor || '#4285f4';
                    config.widgetWidth = config.widgetWidth || 300;
                    config.title = config.title || 'My Interactive Widget';
                    config.welcomeText = config.welcomeText || 'Welcome to this dynamic widget!';
                    config.buttonText = config.buttonText || '🔘 Open Widget';
                    config.colors = config.colors || ['#ffebee', '#e8f5e9', '#e3f2fd', '#f3e5f5'];
                    config.autoLoad = config.autoLoad !== false;
                    
                    console.log("Applied dynamic widget configuration:", config);
                } catch (e) {
                    console.error("Error applying dynamic configuration:", e);
                }
            }

            if (data && data.id && data.url) {
                validWebsiteId = data.id;
                validWebsiteURL = data.url;
                console.log("Generated ID:", validWebsiteId);
                console.log("URL:", validWebsiteURL);

                if (currentWebsiteUrl !== validWebsiteURL) {
                    return;
                }

                // Now verify the ID after we have it from the server
                if (scriptIdFromUrl !== validWebsiteId) {
                    console.log(
                        "Invalid or unauthorized script usage. ID verification failed."
                    );
                    return;
                }
                
                // Initialize the widget after successful validation
                createWidget();
            } else if (data && data.message) {
                console.log("Message from server:", data.message);
                // If we can't validate with server, proceed with script ID
                createWidget();
            }
        });

    // Prevent duplicate loading
    try {
        var html = document.querySelector("html");
        var loaderAttr = "data-widget-loader";
        if (html && html.hasAttribute(loaderAttr)) return;
        html.setAttribute(loaderAttr, "");
    } catch (e) {}

    // Skip for bots/crawlers
    if (/bot|crawler|spider/i.test(navigator.userAgent)) return;

    // Mobile detection and config check
    if (
        /mobile|android|iphone|ipad/i.test(navigator.userAgent) &&
        (config.mobile === false || config.mobile === "false")
    )
        return;

    // Main widget creation function
    function createWidget() {
        // Create widget container
        const widgetContainer = document.createElement("div");
        widgetContainer.id = "interactive-widget-container";
        widgetContainer.style.position = "fixed";
        widgetContainer.style.zIndex = "9999";

        // Set position based on config
        switch (config.position) {
            case "top-left":
                widgetContainer.style.top = "20px";
                widgetContainer.style.left = "20px";
                break;
            case "top-right":
                widgetContainer.style.top = "20px";
                widgetContainer.style.right = "20px";
                break;
            case "bottom-left":
                widgetContainer.style.bottom = "20px";
                widgetContainer.style.left = "20px";
                break;
            default: // bottom-right
                widgetContainer.style.bottom = "20px";
                widgetContainer.style.right = "20px";
        }

        // Widget button
        const widgetButton = document.createElement("button");
        widgetButton.innerHTML = config.buttonText || "🔘 Open Widget";
        widgetButton.style.backgroundColor = config.buttonColor;
        widgetButton.style.color = "white";
        widgetButton.style.border = "none";
        widgetButton.style.padding = "10px 20px";
        widgetButton.style.borderRadius = "20px";
        widgetButton.style.cursor = "pointer";
        widgetButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
        widgetButton.style.transition = "all 0.3s ease";

        // Widget content
        const widgetContent = document.createElement("div");
        widgetContent.style.display = "none";
        widgetContent.style.position = "absolute";
        widgetContent.style.width = config.widgetWidth + "px";
        widgetContent.style.backgroundColor = "white";
        widgetContent.style.borderRadius = "10px";
        widgetContent.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
        widgetContent.style.padding = "15px";
        widgetContent.style.transition = "all 0.3s ease";

        // Position content based on main position
        if (config.position.includes("bottom")) {
            widgetContent.style.bottom = "100%";
            widgetContent.style.marginBottom = "10px";
        } else {
            widgetContent.style.top = "100%";
            widgetContent.style.marginTop = "10px";
        }

        if (config.position.includes("right")) {
            widgetContent.style.right = "0";
        } else {
            widgetContent.style.left = "0";
        }

        // Widget HTML content
        widgetContent.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <h3 style="margin: 0;">${
                            config.title || "My Interactive Widget"
                        }</h3>
                        <button id="widget-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                    </div>
                    <p>${
                        config.welcomeText || "Welcome to this dynamic widget!"
                    }</p>
                    <div id="color-box" style="padding: 10px; background: #f0f0f0; border-radius: 5px; margin: 10px 0; cursor: pointer;">
                        Click to change color
                    </div>
                    <button id="like-btn" style="display: flex; align-items: center; gap: 5px; background: #f8f8f8; border: 1px solid #ddd; padding: 5px 10px; border-radius: 20px; cursor: pointer;">
                        <span style="font-size: 18px;">♥</span> <span>Like</span>
                    </button>
                `;

        // Append elements
        widgetContainer.appendChild(widgetContent);
        widgetContainer.appendChild(widgetButton);
        document.body.appendChild(widgetContainer);

        // Toggle widget visibility
        widgetButton.addEventListener("click", () => {
            widgetContent.style.display =
                widgetContent.style.display === "none" ? "block" : "none";
        });

        // Close button
        document
            .getElementById("widget-close-btn")
            .addEventListener("click", (e) => {
                e.stopPropagation();
                widgetContent.style.display = "none";
            });

        // Color changer
        const colors = config.colors || [
            "#ffebee",
            "#e8f5e9",
            "#e3f2fd",
            "#f3e5f5",
        ];
        let colorIndex = 0;
        document
            .getElementById("color-box")
            .addEventListener("click", function () {
                colorIndex = (colorIndex + 1) % colors.length;
                this.style.backgroundColor = colors[colorIndex];
                this.textContent = `Color ${colorIndex + 1} of ${
                    colors.length
                }`;
            });

        // Like button
        document
            .getElementById("like-btn")
            .addEventListener("click", function () {
                const likeText = this.querySelector("span:last-child");
                if (likeText.textContent === "Like") {
                    likeText.textContent = "Liked!";
                    this.style.backgroundColor = "#ffebee";
                    this.style.borderColor = "#ef9a9a";
                    this.style.color = "#d32f2f";
                } else {
                    likeText.textContent = "Like";
                    this.style.backgroundColor = "#f8f8f8";
                    this.style.borderColor = "#ddd";
                    this.style.color = "inherit";
                }
            });
    }

    // Load when appropriate
    if (config.autoLoad) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", createWidget);
        } else {
            createWidget();
        }
    }

    // Expose public API
    window.MyWidget = {
        load: createWidget,
        unload: function () {
            var widget = document.getElementById(
                "interactive-widget-container"
            );
            if (widget) widget.remove();
        },
    };

    // Don't auto-initialize - we'll do it after validation
    // if (document.readyState === "loading") {
    //     document.addEventListener("DOMContentLoaded", initialize);
    // } else {
    //     initialize();
    // }
})();
