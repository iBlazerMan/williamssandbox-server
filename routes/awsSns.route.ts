import { FastifyInstance } from "fastify"
import { sendMessageToPhoneNumberRequest } from "../serverTypeDefine"

import awsSnsHandler from "../routeHandlers/awsSnsHandler"


export default {
    registerRoutes(server: FastifyInstance) {
        server.post("/awsSns/sendMessageToPhoneNumber", {
            handler:  awsSnsHandler.sendMessageToPhoneNumber,
            schema: {
                body: sendMessageToPhoneNumberRequest,
                response: {
                    200: {},
                    500: {},
                }
            }
        })
    }
}