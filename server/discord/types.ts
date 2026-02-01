export type DiscordInteraction = {
  type: number;
  id: string;
  token: string;
  member?: {
    user: { id: string; username?: string; global_name?: string };
  };
  user?: { id: string; username?: string; global_name?: string };
  guild_id?: string;
  data?: {
    name?: string;
    options?: Array<{ name: string; value: string }>;
  };
};

export type DiscordInteractionResponse =
  | { type: 1 } // PONG
  | {
      type: 4; // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content?: string;
        flags?: number; // 64 = ephemeral
        embeds?: any[];
        components?: any[];
      };
    };

