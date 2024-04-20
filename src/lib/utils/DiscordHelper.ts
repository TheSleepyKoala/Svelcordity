import { initializeSdk } from "./initializeSdk";
import type { MessageData } from "./types";

export class DiscordHelper {
    private iframe: HTMLIFrameElement;

    constructor() {
        this.iframe = document.createElement("iframe");
        this.iframe.style.display = "block";
        document.body.appendChild(this.iframe);
    }

    async setupParentIframe() {
        const discordSdk = await initializeSdk();
        this.notifyChildParentIsReady();
        window.addEventListener("message", this.handleMessage.bind(this));
    }

    private async handleMessage({
        data: messageData,
    }: MessageEvent<MessageData>) {
        if (!this.isValidMessageData(messageData)) {
            return;
        }

        const { nonce, event, command, data, args } = messageData;

        const handleSubscribeEvent = (eventData) => {
            this.postMessageToChild({
                event,
                command: "DISPATCH",
                data: eventData,
            });
        };

        switch (command) {
            case "NOTIFY_CHILD_IFRAME_IS_READY":
                this.notifyChildParentIsReady();
                break;
            case "SUBSCRIBE":
                this.validateEvent(event);
                discordSdk.subscribe(event, handleSubscribeEvent, args);
                break;
            case "UNSUBSCRIBE":
                this.validateEvent(event);
                discordSdk.unsubscribe(event, handleSubscribeEvent);
                break;
            case "SET_ACTIVITY":
                const reply = await discordSdk.commands.setActivity(
                    data as any
                );
                this.postMessageToChild({ nonce, event, command, data: reply });
                break;
        }
    }

    private notifyChildParentIsReady() {
        this.postMessageToChild({ event: "READY", command: "DISPATCH" });
    }

    private postMessageToChild(message: Record<string, any>) {
        this.iframe.contentWindow?.postMessage(message, "*");
    }

    private isValidMessageData(
        messageData: unknown
    ): messageData is MessageData {
        return (
            typeof messageData === "object" &&
            !Array.isArray(messageData) &&
            messageData !== null
        );
    }

    private validateEvent(event: string | undefined) {
        if (event == null) {
            throw new Error("Event is undefined");
        }
    }
}
