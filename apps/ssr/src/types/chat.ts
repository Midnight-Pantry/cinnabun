import { Either } from "cinnabun/types"

export interface IChatMessage {
  id: string
  contents: string
  username: string
}

export type ChatMessagesResponse = Either<
  { error: Error },
  { data: IChatMessage[] }
>
