import {
	OpenAPIRoute,
	OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import { Question, Answer } from "../types";

export class ChatAI extends OpenAPIRoute {
	static schema: OpenAPIRouteSchema = {
		tags: ["AI"],
		summary: "Chat with the AI",
		requestBody: Question,
		responses: {
			"200": {
				description: "Returns the created task",
				schema: {
					success: Boolean,
					data: Answer,
				},
			},
		},
	};

	async handle(
		request: Request,
		env: any,
		context: any,
		data: Record<string, any>
	) {
		// Retrieve the validated request body
		const question = data.body;

		// Implement your own object insertion here

		// return the new task
		return {
			success: true,
			data: {
        message: 'Hello, World!'
			},
		};
	}
}
