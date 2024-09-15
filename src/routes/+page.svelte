<script lang="ts">
    import { onMount } from "svelte";
    import { DiscordHelper } from "$lib/utils/DiscordHelper";
    import { config } from "$lib/config";

    let unityCanvas: any;
    let unityInstance;
    let discordHelper: DiscordHelper;

    onMount(() => {
        if (window.location.hostname.includes("discordsays.com")) {
            const originalFetch = window.fetch;

            window.fetch = (input, init) => {
                // Use the saved original fetch function inside the redefined one
                return originalFetch(".proxy/" + input, init);
            };
        }

        discordHelper = new DiscordHelper();
        discordHelper.setupParentIframe();
        initializeUnity();
    });

    function initializeUnity() {
        // Load the WebGL.loader.js script
        const script = document.createElement("script");
        script.src = "/Build/WebGL.loader.js";
        script.async = true;
        script.onload = () => {
            createUnityInstance(unityCanvas, {
                dataUrl: "/Build/WebGL.data.gz",
                frameworkUrl: "/Build/WebGL.framework.js.gz",
                codeUrl: "/Build/WebGL.wasm.gz",
                streamingAssetsUrl: "StreamingAssets",
                companyName: config.COMPANY_NAME,
                productName: config.PRODUCT_NAME,
                productVersion: config.PRODUCT_VERSION,
            }).then((instance) => {
                unityInstance = instance;
            });
        };
        document.body.appendChild(script);

        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            // Mobile device style: fill the whole browser client area with the game canvas:
            var meta = document.createElement("meta");
            meta.name = "viewport";
            meta.content =
                "width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes";
            document.getElementsByTagName("head")[0].appendChild(meta);

            unityCanvas = document.querySelector("#unity-canvas");
            unityCanvas.style.width = "100%";
            unityCanvas.style.height = "100%";
            unityCanvas.style.position = "fixed";
            document.body.style.textAlign = "left";
        }
    }
</script>

<body>
    <canvas
        bind:this={unityCanvas}
        id="unity-canvas"
        tabindex="-1"
        width="960"
        style="
            width: 100vw;
            height: 100vh;
            background: url('/Build/WebGL.jpg') center / cover;
        "
    ></canvas>
</body>

<style>
    body {
        margin: 0px;
        background-color: #000000;
        padding: 0px;
        text-align: center;
        border: 0;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }
</style>
