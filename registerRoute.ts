import { FastifyInstance } from "fastify"

import awsSnsRoute from "./routes/awsSns.route"

export default (server: FastifyInstance) => {
    awsSnsRoute.registerRoutes(server)
}