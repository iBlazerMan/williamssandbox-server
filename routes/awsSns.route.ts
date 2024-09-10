import { FastifyInstance } from "fastify"
import { sendMessageToPhoneNumberRequest, sendCodeToPhoneAndSaveRequest,
    sendMessageToPhoneNumberRequestUrl, sendCodeToPhoneAndSaveRequestUrl
} from "../serverTypeDefine"

import awsSnsHandler from "../routeHandlers/awsSnsHandler"


export default {
    registerRoutes(server: FastifyInstance) {
        server.post(sendMessageToPhoneNumberRequestUrl, {
            handler: awsSnsHandler.sendMessageToPhoneNumber,
            schema: {
                body: sendMessageToPhoneNumberRequest,
                response: {
                    200: {},
                    500: {},
                }
            }
        }), 
        server.post(sendCodeToPhoneAndSaveRequestUrl, {
            handler: awsSnsHandler.sendCodeToPhoneAndSave,
            schema: {
                body: sendCodeToPhoneAndSaveRequest,
                response: {
                    200: {},
                    500: {},
                }
            }
        })
    }
}