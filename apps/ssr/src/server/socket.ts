import { FastifyRequest } from "fastify"

import { SocketStream } from "@fastify/websocket"

export const socketHandler = (conn: SocketStream, _req: FastifyRequest) => {
  conn.setEncoding("utf8")
  conn.on("data", (chunk) => {
    const data = JSON.parse(chunk)

    switch (data.type) {
      case "ping":
        conn.socket.send(JSON.stringify({ type: "ping" }))
        return
      default:
    }
  })
}
