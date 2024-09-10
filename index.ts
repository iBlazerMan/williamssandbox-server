import Fastify, { FastifyReply, FastifyRequest } from "fastify"
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import cors from "@fastify/cors"
import fs from "fs"

import ClientManager from "./lib/clientManager"
import registerRoute from "./registerRoute"
import ExchangeRateManager from "./lib/exchangeRateManager"

const serverConfigFilePath = "./serverConfig.json"
const exchangeRateApiIdFilePath = "./openExchangeRates.json"

type ServerConfig = {
    serverEnv: string,
    allowedIps: string[]
}

const serverConfig: ServerConfig = JSON.parse(fs.readFileSync(serverConfigFilePath, "utf-8"))
const server = Fastify({logger: true}).withTypeProvider<TypeBoxTypeProvider>()
// IP provider
server.register(cors, {
    origin: [serverConfig.serverEnv === "development" ? "http://localhost:3000" : 
        serverConfig.serverEnv === "production" ? "https://williamssandbox.com" : ""],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
})

// 
server.addHook("onRequest", (request: FastifyRequest, reply: FastifyReply, done) => {
    if (serverConfig.serverEnv === "production" && !serverConfig.allowedIps.includes(request.ip)) {
        reply.code(403).send({ error: "403 Forbidden" })
        return done()
    } else {
        done()
    }
  
})

;(async () => {
    const exchangeRateApiId = JSON.parse(fs.readFileSync(exchangeRateApiIdFilePath, "utf-8").toString()).appId
    if (!exchangeRateApiId || exchangeRateApiId === "") {
        throw new ReferenceError("openExchangeRates file missing appId")
    }
    registerRoute(server)
    await ClientManager.getClientManager()
    await ExchangeRateManager.initExchangeRateManager(exchangeRateApiId)
})()

server.get("/ping", async (req, res) => {
    res.send("pong\n") 
}) 

server.listen({port: 8080}, (err, address) => {
    if (err) {
        console.error("Error:" + err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
