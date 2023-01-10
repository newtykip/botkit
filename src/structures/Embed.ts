import { EmbedBuilder, Guild, User } from "discord.js";

export default class Embed extends EmbedBuilder {
	constructor(options?: Embed.Config) {
		super();

		if (options?.thumbnail) {
			let url: string | null;

			if (options.thumbnail instanceof User) {
				url = options.thumbnail.avatarURL();
			} else if (options.thumbnail instanceof Guild) {
				url = options.thumbnail.iconURL();
			} else {
				url = options.thumbnail;
			}

			this.setThumbnail(url);
		}

		if (options?.author) {
			super.setAuthor({
				name: options.author.username,
				iconURL: options.author.avatarURL() as string
			});
		}
	}

	/**
	 * Appends a field to the embed
	 */
	public addField(name: string, value: string, inline?: boolean): this {
		return this.addFields({ name, value, inline });
	}

	/**
	 * Appends blank fields to the embed
	 */
	public addBlank(inline: boolean = false, quantity: number = 1): this {
		for (let i = 0; i < quantity; i++) {
			this.addField('\u200b', '\u200b', inline);
		}

		return this;
	}

	public requestedBy(user: User): this {
		return this.setFooter({
			text: `Requested by: ${user.username}`,
			iconURL: user.avatarURL() as string
		})
	}
}

namespace Embed {
	type ImageResolvable = string | Guild | User;

	export interface Config {
		thumbnail: ImageResolvable;
		author: User;
	}
}
