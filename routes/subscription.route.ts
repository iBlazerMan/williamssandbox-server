import { FastifyInstance } from "fastify"
import { getExchangeRateRequest, getExchangeRateResponse, getExchangeRateRequestUrl, verifySignInRequestUrl, 
    verifySignInRequest, verifySignInResponse, addSubscriptionRequestUrl, addSubscriptionRequest, 
    getSubscriptionRequestUrl,
    getSubscriptionRequest,
    getSubscriptionResponse,
    deleteSubscriptionRequestUrl,
    deleteSubscriptionRequest} from "../serverTypeDefine"
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
        }),

        server.post(addSubscriptionRequestUrl, {
            handler: subscriptionHandler.addSubscription,
            schema: {
                body: addSubscriptionRequest,
                response: {
                    200: {},
                    500: {}
                }
            }
        }),
        
        // FIXME: change this to a GET request with no cache and hashed user information later
        server.post(getSubscriptionRequestUrl, {
            handler: subscriptionHandler.getSubscription,
            schema: {
                body: getSubscriptionRequest,
                response: {
                    200: getSubscriptionResponse,
                    500: {}
                }
            }
        }),

        server.delete(deleteSubscriptionRequestUrl, {
            handler: subscriptionHandler.deleteSubscription,
            schema: {
                querystring: deleteSubscriptionRequest,
                response: {
                    200: {},
                    500: {}
                }
            }
        })
    }
}