import { DiscordSDK } from "@discord/embedded-app-sdk";
import { config } from "../config";

export async function initializeSdk(): Promise<DiscordSDK> {
    if (typeof config.CLIENT_ID !== "string") {
        throw new Error("Must specify 'CLIENT_ID'");
    }

    const discordSdk = new DiscordSDK(config.CLIENT_ID);
    await discordSdk.ready();
    const { code } = await discordSdk.commands.authorize({
        client_id: config.CLIENT_ID,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: ["identify", "rpc.activities.write", "rpc.voice.read"],
    });

    const response = await fetch("/discord/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    });
    const { access_token } = await response.json();

    await discordSdk.commands.authenticate({ access_token });

    return discordSdk;
}
