// Copyright Abridged, Inc. 2023. All Rights Reserved.
// Node module: @collabland/example-dev-action
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {stringify} from '@collabland/common';
import {
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponse,
  ApplicationCommandOptionType,
  ApplicationCommandSpec,
  ApplicationCommandType,
  BaseDiscordActionController,
  DiscordActionMetadata,
  DiscordActionRequest,
  DiscordActionResponse,
  DiscordInteractionPattern,
  InteractionResponseType,
  InteractionType,
} from '@collabland/discord';
import {MiniAppManifest} from '@collabland/models';
import {BindingScope, injectable} from '@loopback/core';
import {api} from '@loopback/rest';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
  MessageFlags,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

/**
 * CollabActionController is a LoopBack REST API controller that exposes endpoints
 * to support Collab.Land actions for Discord interactions.
 */
@injectable({
  scope: BindingScope.SINGLETON,
})
@api({basePath: '/dev-action'}) // Set the base path to `/dev-action`
export class DevActionController extends BaseDiscordActionController<APIChatInputApplicationCommandInteraction> {
  /**
   * Expose metadata for the action
   * @returns
   */
  async getMetadata(): Promise<DiscordActionMetadata> {
    const metadata: DiscordActionMetadata = {
      /**
       * Miniapp manifest
       */
      manifest: new MiniAppManifest({
        appId: 'echo-action',
        developer: 'collab.land',
        name: 'DevAction',
        platforms: ['discord'],
        shortName: 'dev-action',
        version: {name: '0.0.1'},
        website: 'https://collab.land',
        description:
          'An example Collab action to illustrate various Discord UI elements',
      }),
      /**
       * Supported Discord interactions. They allow Collab.Land to route Discord
       * interactions based on the type and name/custom-id.
       */
      supportedInteractions: this.getSupportedInteractions(),
      /**
       * Supported Discord application commands. They will be registered to a
       * Discord guild upon installation.
       */
      applicationCommands: this.getApplicationCommands(),
    };
    return metadata;
  }

  /**
   * Handle the Discord interaction
   * @param interaction - Discord interaction with Collab.Land action context
   * @returns - Discord interaction response
   */
  protected async handle(
    interaction: DiscordActionRequest<APIChatInputApplicationCommandInteraction>,
  ): Promise<DiscordActionResponse> {
    /**
     * Build a simple Discord message private to the user
     */
    const response: APIInteractionResponse = {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
        embeds: [
          new EmbedBuilder()
            .setTitle('Interaction')
            .setDescription(
              `Interaction id: ${interaction.id}
  Interaction type: ${interaction.type}            
  Application id: ${interaction.application_id}
  Guild id: ${interaction.guild_id}
  Channel id: ${interaction.channel_id}
  User: ${interaction.member?.user.id} ${interaction.member?.user.username}#${interaction.member?.user.discriminator}            
            `,
            )
            .toJSON(),
          new EmbedBuilder()
            .setTitle('Request data')
            .setDescription('```json\n' + stringify(interaction.data) + '```')
            .toJSON(),
        ],
        components: [
          new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents([
              new ButtonBuilder()
                .setLabel('Click me')
                .setCustomId('dev:button:click')
                .setStyle(ButtonStyle.Success),
            ])
            .toJSON(),
          new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId('dev:select:string')
                .setPlaceholder('Select a color')
                .addOptions(
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Red')
                    .setValue('red'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Green')
                    .setValue('green'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Blue')
                    .setValue('blue'),
                ),
            )
            .toJSON(),

          new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(
              new RoleSelectMenuBuilder()
                .setCustomId('dev:select:role')
                .setPlaceholder('Select a role'),
            )
            .toJSON(),
        ],
      },
    };

    // Return the 1st response to Discord
    return response;
  }

  /**
   * Build a list of supported Discord interactions
   * @returns
   */
  private getSupportedInteractions(): DiscordInteractionPattern[] {
    return [
      {
        // Handle slash command
        type: InteractionType.ApplicationCommand,
        names: ['dev*'],
      },
      {
        // Handle slash command with auto complete
        type: InteractionType.ApplicationCommandAutocomplete,
        names: ['dev*'],
      },
      {
        // Handle buttons/selections
        type: InteractionType.MessageComponent,
        ids: ['dev:*'],
      },
      {
        // Handle modal
        type: InteractionType.ModalSubmit,
        ids: ['dev:*'],
      },
    ];
  }

  /**
   * Build a list of Discord application commands. It's possible to use tools
   * like https://autocode.com/tools/discord/command-builder/.
   * @returns
   */
  private getApplicationCommands(): ApplicationCommandSpec[] {
    const commands: ApplicationCommandSpec[] = [
      // `/dev-action` slash command
      {
        metadata: {
          name: 'DevAction',
          shortName: 'dev-action',
          supportedEnvs: ['dev', 'qa', 'staging'],
        },
        type: ApplicationCommandType.ChatInput,
        name: 'dev',
        description: 'Collab.Land root command',
        options: [
          {
            name: 'user',
            description: 'Get or edit permissions for a user',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
              {
                name: 'get',
                description: 'Get permissions for a user',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                  {
                    name: 'user',
                    description: 'The user to get',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                  },
                  {
                    name: 'channel',
                    description:
                      'The channel permissions to get. If omitted, the guild permissions will be returned',
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                  },
                ],
              },
              {
                name: 'edit',
                description: 'Edit permissions for a user',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                  {
                    name: 'user',
                    description: 'The user to edit',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                  },
                  {
                    name: 'channel',
                    description:
                      'The channel permissions to edit. If omitted, the guild permissions will be edited',
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            name: 'role',
            description: 'Get or edit permissions for a role',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
              {
                name: 'get',
                description: 'Get permissions for a role',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                  {
                    name: 'role',
                    description: 'The role to get',
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                  },
                  {
                    name: 'channel',
                    description:
                      'The channel permissions to get. If omitted, the guild permissions will be returned',
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                  },
                ],
              },
              {
                name: 'edit',
                description: 'Edit permissions for a role',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                  {
                    name: 'role',
                    description: 'The role to edit',
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                  },
                  {
                    name: 'channel',
                    description:
                      'The channel permissions to edit. If omitted, the guild permissions will be edited',
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    return commands;
  }
}
