import { SapphireClient } from "@sapphire/framework";
import type { ClientOptions } from 'discord.js';

namespace Client {
	export interface Options {
		sapphire?: ClientOptions;
		silent?: boolean;
	}
}

export default class Client extends SapphireClient {
	readonly production = process.env.NODE_ENV === 'production';
	readonly silent: boolean;

	constructor(options?: Client.Options) {
		// Configure the client
		super(options?.sapphire || {
			intents: ['Guilds']
		});

		this.silent = options?.silent || false;
	}
}
