import { FastifyInstance } from "fastify"

import awsSnsRoute from "./routes/awsSns.route"
import subscriptionRoute from "./routes/subscription.route"

export default (server: FastifyInstance) => {
    awsSnsRoute.registerRoutes(server)
    subscriptionRoute.registerRoute(server)
}