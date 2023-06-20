import colours from 'picocolors';
import dayjs from 'dayjs';
import { MessageMentions } from 'discord.js';
import Bluebird from 'bluebird';
import Client from './Client';
import { Table } from 'console-table-printer';
import figures from 'figures';
import { Colors } from 'picocolors/types';
import { Logger as BuiltInLogger, LogLevel } from '@sapphire/framework';

const glyphNames: {
    [key in LogLevel]: keyof typeof figures;
} = {
    10: 'info',
    20: 'warning',
    30: 'info',
    40: 'warning',
    50: 'cross',
    60: 'cross',
    70: 'nodejs',
    100: 'info'
};

const colourList: {
    [key in LogLevel]: keyof Pick<Colors, Exclude<keyof Colors, 'isColorSupported'>>;
} = {
    10: 'cyan',
    20: 'yellow',
    30: 'cyan',
    40: 'green',
    50: 'red',
    60: 'red',
    70: 'green',
    100: 'white'
};

// todo: placeholder system?

export class BaseLogger extends BuiltInLogger {
    private client: Client;
    private scope: string;

    constructor(client: Client, scope?: string) {
        super(LogLevel.Info);

        this.client = client;
        this.scope = scope?.toLowerCase() ?? 'global';
    }

    private async parseMessage(message: string): Promise<string> {
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

        return message;
    }

    public write(level: LogLevel, ...values: readonly unknown[]) {
        const glyph = figures[glyphNames[level]] ?? '';
        const timestamp = dayjs().format('hh:mm:ss A').toUpperCase();

        this.parseMessage(values.join(' ')).then(message =>
            console.log(
                `${colours.gray(`[${timestamp}] [${this.scope}] ›`)} ${colours[colourList[level]](
                    `${glyph}  ${colours.underline(colours.bold(LogLevel[level].toLowerCase()))}`
                )}  ${message}`
            )
        );
    }
}

export class PieceLogger extends BaseLogger {
    constructor(client: Client, scope: string) {
        super(client, scope);
    }

    /**
     * Wrtites a table of values to the console.
     * @param rows The rows to log.
     */
    public table<T>(rows: Logger.Table.Row<T>[]) {
        const table = new Table();

        rows.forEach(({ colour, ...data }) => {
            table.addRow(data, { color: colour });
        });

        table.printTable();
    }

    /**
     * Alias of ILogger.write with LogLevel.Loader as level.
     * @param values The values to log.
     */
    public loader(...values: readonly unknown[]) {
        this.write(LogLevel.Loader, ...values);
    }
}

export namespace Logger {
    export namespace Table {
        export type Row<T> = {
            [key: string]: T;
        } & { colour: string };
    }
}
