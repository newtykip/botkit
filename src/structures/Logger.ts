import colours from 'picocolors';
import dayjs from 'dayjs';
import { Guild, MessageMentions } from 'discord.js';
import Bluebird from 'bluebird';
import Client from './Client';
import { Table } from 'console-table-printer';
import figures from 'figures';
import { Colors } from 'picocolors/types';

const glyphNames: {
    [key: string]: keyof typeof figures;
} = {
    info: 'info',
    warn: 'warning',
    error: 'cross',
    loader: 'nodejs'
};

namespace Logger {
    export namespace Table {
        export type Row<T> = {
            [key: string]: T;
        } & { colour: string };
    }
}

export default class Logger {
    private client: Client;
    private scope: string;
    public placeholder = '<<>>';

    constructor(client: Client, scope: string) {
        this.client = client;
        this.scope = scope.toLowerCase();
    }

    private async parseMessage(message: string, placeholders: any[]) {
        const userMentions = message.match(MessageMentions.UsersPattern) || [];
        const channelMentions = message.match(MessageMentions.ChannelsPattern) || [];

        // If a user has been mentioned, replace the mention with their tag and ID
        if (userMentions?.length > 0) {
            await Bluebird.map(userMentions, async mention => {
                // Select the ID and find the relevant user
                const id = mention.replace(/[^0-9]/g, '');
                const user = await this.client.users.fetch(id);

                message = message.replace(mention, `User "${user.tag}" (${user.id})`);
            });
        }

        // If a channel has been mentioned, replace the mention with its name and ID
        if (channelMentions?.length > 0) {
            await Bluebird.map(channelMentions, async mention => {
                // Select the ID and find the relevant channel
                const id = mention.replace(/[^0-9]/g, '');
                const channel = await this.client.channels.fetch(id, {
                    allowUnknownGuild: true
                });

                message = message.replace(mention, `#${(channel as any).name} (${channel?.id})`);
            });
        }

        // Replace placeholders
        await Bluebird.each(placeholders, placeholder => {
            // If a guild was inputted, format it into text
            if (placeholder instanceof Guild) {
                message = message.replace(
                    this.placeholder,
                    `Guild "${placeholder.name}" (${placeholder.id})`
                );
            }
        });

        return message;
    }

    private log(
        level: keyof typeof glyphNames,
        colour: keyof Pick<Colors, Exclude<keyof Colors, 'isColorSupported'>>,
        message: string,
        placeholders: any[]
    ) {
        const glyph = figures[glyphNames[level]] ?? '';
        const timestamp = dayjs().format('hh:mm:ss A').toUpperCase();

        this.parseMessage(message, placeholders).then(parsedMessage =>
            console.log(
                `${colours.gray(`[${timestamp}] [${this.scope}] ›`)} ${colours[colour](
                    `${glyph}  ${colours.underline(colours.bold(level))}`
                )}   ${parsedMessage}`
            )
        );
    }

    public info(message: string, ...placeholders: any[]) {
        this.log('info', 'cyan', message, placeholders);
    }

    public loader(message: string, ...placeholders: any[]) {
        if (!this.client.silent) this.log('loader', 'green', message, placeholders);
    }

    public warn(message: string, ...placeholders: any[]) {
        if (!this.client.silent) this.log('warn', 'yellow', message, placeholders);
    }

    public error(message: string | Error, ...placeholders: any[]) {
        this.log(
            'error',
            'red',
            message instanceof Error ? message.message : message,
            placeholders
        );
    }

    public table<T>(rows: Logger.Table.Row<T>[]) {
        const table = new Table();

        rows.forEach(({ colour, ...data }) => {
            table.addRow(data, { color: colour });
        });

        table.printTable();
    }
}
