import { error } from "@sveltejs/kit";

export async function GET() {
    throw error(405, "My dude, you can't do that here.");
}
