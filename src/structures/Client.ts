import { SapphireClient } from "@sapphire/framework";
import type { ClientOptions } from 'discord.js';

export default class Client extends SapphireClient {
	readonly production = process.env.NODE_ENV === 'production';
	readonly silent: boolean;

	constructor(token: string, options?: Client.Options) {
		// Configure the client
		const { silent, ...clientOptions } = options || {
			intents: ['Guilds']
		};

		super(clientOptions);

		this.token = token;
		this.silent = silent || false;
	}

	login(): Promise<string> {
		return super.login(this.token as string);
	}
}

namespace Client {
	export interface Options extends ClientOptions {
		silent?: boolean;
	}
}
