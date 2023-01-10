import { ApplyOptions } from "@sapphire/decorators";
import { Awaitable, ChatInputCommand, Command as SapphireCommand, CommandOptions, ContextMenuCommand, PieceContext } from "@sapphire/framework";
import title from 'title';
import Client from './Client';
import Logger from './Logger';

abstract class Command extends SapphireCommand {
	public client: Client;
	public logger: Logger;

	constructor(context: PieceContext, options?: Command.Options) {
		const { ...commandOptions } = options;
		super(context, commandOptions);

		// Expose the client and logger for usage!
		this.client = this.container.client;
		this.logger = new Logger(this.client, this.name);
	}

	abstract chatInputRun(
        interaction: Command.Chat.Interaction,
        context: Command.Chat.Context
    ): Awaitable<unknown>;

	abstract contextMenuRun(
		interaction: Command.Menu.Interaction,
		context: Command.Menu.Context
	): Awaitable<unknown>;

	abstract autocompleteRun(
		interaction: Command.Autocomplete
	): Awaitable<unknown>;

	public onLoad() {
		this.logger.loader(`Successfully loaded command ${title(this.name)}!`);
		
		super.onLoad();
	}

	public onUnload() {
		this.logger.loader(`Successfully unloaded command ${title(this.name)}!`);

		super.onUnload();
	}
}

namespace Command {
	export const Config = (options: Options) => ApplyOptions<Options>(options);
	export type Registry = SapphireCommand.Registry;

	export namespace Chat {
		export type Interaction = SapphireCommand.ChatInputCommandInteraction;
		export type Context = ChatInputCommand.RunContext;
	}

	export namespace Menu {
		export type Interaction = SapphireCommand.ContextMenuCommandInteraction;
		export type Context = ContextMenuCommand.RunContext;
	}

	export type Autocomplete = SapphireCommand.AutocompleteInteraction;

	export interface Options extends CommandOptions {}
}

export default Command;
