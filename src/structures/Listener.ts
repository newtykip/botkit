import { ApplyOptions } from '@sapphire/decorators';
import { Listener as SapphireListener, ListenerOptions, PieceContext, Events as SapphireEvents } from '@sapphire/framework';
import type { ClientEvents } from 'discord.js';
import title from 'title';
import type Client from './Client';
import Logger from './Logger';

abstract class Listener<E extends keyof ClientEvents> extends SapphireListener<E> {
	public client: Client;
	public logger: Logger;
	private productionOnly: boolean;

	private get shouldRun(): boolean {
        return (this.productionOnly && this.client.production) || !this.productionOnly;
    }

	constructor(context: PieceContext, options: Listener.Options) {
		// Configure the listener
		const { name, productionOnly, ...listenerOptions } = options;
		super(context, listenerOptions);

		// Expose the client and logger
		this.client = this.container.client;
		this.logger = new Logger(this.client, this.name);

		this.productionOnly = productionOnly ?? false;
	}

	abstract run(...args: E extends keyof ClientEvents ? ClientEvents[E] : unknown[]): unknown;

    public onLoad() {
        if (!this.shouldRun) {
            // Unload the listener
            setTimeout(() => {
                this.unload();

                this.logger.loader(
                    `Forcefully unloaded listener ${title(
                        this.name
                    )} - it is production only!`
                );
            }, 1000);
        } else {
            this.logger.loader(`Successfully loaded listener ${title(this.name)}!`);
        }

        super.onLoad();
    }

    public onUnload() {
        if (this.shouldRun && !this.once) {
            this.logger.loader(`Successfully unloaded listener ${title(this.name)}!`);
        }

        super.onUnload();
    }
}

namespace Listener {
	export const Config = (options: Options) => ApplyOptions<Options>(options);
	export const Events = SapphireEvents;

	export type Options = ListenerOptions & {
		name: string;
		event: typeof Events[keyof typeof Events];
		productionOnly?: boolean;
	}
}

export default Listener;
