import { env } from "$env/dynamic/private";
import { error, json } from "@sveltejs/kit";

export async function POST({ request }) {
    try {
        const { code } = await request.json();

        const response = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: env.CLIENT_ID,
                client_secret: env.CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
            }),
        });

        const { access_token } = await response.json();

        return json({ access_token });
    } catch (err) {
        console.error(err);
        throw error(500, "Internal Server Error");
    }
}

export async function GET() {
    throw error(405, "My dude, you can't do that here.");
}
