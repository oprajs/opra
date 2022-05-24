export interface OwoClientOptions {
  baseUrl: string;
}

export interface ListCommandOptions {
  limit?: number;
  skip?: number;
  sort?: string | string[];
}
