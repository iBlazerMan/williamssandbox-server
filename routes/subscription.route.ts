import { FastifyInstance } from "fastify"
import { getExchangeRateRequest, getExchangeRateResponse, getExchangeRateRequestUrl, verifySignInRequestUrl, verifySignInRequest, verifySignInResponse } from "../serverTypeDefine"
import subscriptionHandler from "../routeHandlers/subscriptionHandler"


export default {
    registerRoute(server: FastifyInstance) {
        server.get(getExchangeRateRequestUrl, {
            handler: subscriptionHandler.getExchangeRate,
            schema: {
                querystring: getExchangeRateRequest,
                response: {
                    200: getExchangeRateResponse,
                    500: {}
                }
            }
        }),

        server.post(verifySignInRequestUrl, {
            handler: subscriptionHandler.verifySignIn,
            schema: {
                body: verifySignInRequest,
                response: {
                    200: verifySignInResponse,
                    401: verifySignInResponse,
                    500: verifySignInResponse
                }
            }
        })
    }
}