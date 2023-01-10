import { SapphireClient } from "@sapphire/framework";
import type { ClientOptions } from 'discord.js';

export default class Client {
	readonly production = process.env.NODE_ENV === 'production';
	readonly silent: boolean;
	readonly sapphire: SapphireClient;

	constructor(options?: Client.Options) {
		// Configure the client
		this.sapphire = new SapphireClient(options?.sapphire || {
			intents: ['Guilds']
		});

		this.silent = options?.silent || false;
	}
}

namespace Client {
	export interface Options {
		sapphire?: ClientOptions;
		silent?: boolean;
	}
}
