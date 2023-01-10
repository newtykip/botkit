import { SapphireClient } from "@sapphire/framework";
import type { ClientOptions } from 'discord.js';

export default class Client extends SapphireClient {
	readonly production = process.env.NODE_ENV === 'production';
	readonly silent: boolean;

	constructor(options?: Client.Options) {
		// Configure the client
		const { silent, ...clientOptions } = options || {
			intents: ['Guilds']
		};

		super(clientOptions);

		this.silent = silent || false;
	}
}

namespace Client {
	export interface Options extends ClientOptions {
		silent?: boolean;
	}
}
