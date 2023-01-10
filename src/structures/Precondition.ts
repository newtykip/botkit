import { ApplyOptions } from '@sapphire/decorators';
import {
    Precondition as SapphirePrecondition,
    PreconditionOptions,
    PieceContext
} from '@sapphire/framework';
import title from 'title';
import Client from './Client';
import Logger from './Logger';

abstract class Precondition extends SapphirePrecondition {
    public client: Client;
    public logger: Logger;
    private productionOnly: boolean;

    private get shouldRun(): boolean {
        return (this.productionOnly && this.client.production) || !this.productionOnly;
    }

    constructor(context: PieceContext, options?: Precondition.Options) {
        const { productionOnly, ...preconditionOptions } = options || {};
        super(context, preconditionOptions);

        // Expose the client and logger for usage!
        this.client = this.container.client;
        this.logger = new Logger(this.client, this.name);

        this.productionOnly = productionOnly || false;
    }

    public onLoad() {
        if (!this.shouldRun) {
            // Unload the listener
            setTimeout(() => {
                this.unload();

                this.logger.loader(
                    `Forcefully unloaded precondition ${title(this.name)} - it is production only!`
                );
            }, 1000);
        } else {
            this.logger.loader(`Successfully loaded precondition ${title(this.name)}!`);
        }

        super.onLoad();
    }

    public onUnload() {
        if (this.shouldRun)
            this.logger.loader(`Successfully unloaded precondition ${title(this.name)}!`);

        super.onUnload();
    }
}

namespace Precondition {
    export const Config = (options: Options) => ApplyOptions<Options>(options);

    export interface Options extends PreconditionOptions {
        productionOnly?: boolean;
    }
}

export default Precondition;
