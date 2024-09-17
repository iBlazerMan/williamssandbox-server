import { Static, Type } from "@sinclair/typebox"

///// awsSns routes /////
// request
export const sendMessageToPhoneNumberRequestUrl = "/awsSns/sendMessageToPhoneNumber"
export const sendMessageToPhoneNumberRequest = Type.Object({
  message: Type.String({ minLength: 1 }),
  destNumber: Type.String({ minLength: 1 }),
})
export type SendMessageToPhoneNumberRequest = Static<typeof sendMessageToPhoneNumberRequest>

export const sendCodeToPhoneAndSaveRequestUrl = "/awsSns/sendCodeToPhoneAndSave"
export const sendCodeToPhoneAndSaveRequest = Type.Object({
  destNumber: Type.String({ minLength: 1 }),
})
export type SendCodeToPhoneAndSaveRequest = Static<typeof sendCodeToPhoneAndSaveRequest>

///// awsSes routes /////
// request
export const sendEmailRequestUrl = ""
export const sendEmailRequest = Type.Object({
  from: Type.String({ minLength: 1 }),
  to: Type.String({ minLength: 1 }),
  subject: Type.String(),
  html: Type.String(),
  text: Type.String(),
})
export type SendEmailRequest = Static<typeof sendEmailRequest>

///// subscription routes /////
// request
export const getExchangeRateRequestUrl = "/subscription/getExchangeRate"
export const getExchangeRateRequest = Type.Object({
  fromCurrency: Type.String({ minLength: 1 }),
  toCurrency: Type.String({ minLength: 1 }),
})
export type GetExchangeRateRequest = Static<typeof getExchangeRateRequest>

export const getExchangeRateResponse = Type.Object({
  rate: Type.Number(),
  lastUpdated: Type.String({ format: "date-time" }),
})
export type GetExchangeRateResponse = Static<typeof getExchangeRateResponse>

export const verifySignInRequestUrl = "/subscription/verifySignIn"
export const verifySignInRequest = Type.Object({
  contactType: Type.String({ minLength: 1 }),
  contactInfo: Type.String({ minLength: 1 }),
  verificationCode: Type.String({ minLength: 1 }),
})
export type VerifySignInRequest = Static<typeof verifySignInRequest>

export const verifySignInResponse = Type.Object({
  status: Type.String({ minLength: 1 }),
  userId: Type.Optional(Type.Number()),
})
export type VerifySignInResponse = Static<typeof verifySignInResponse>

export const addSubscriptionRequestUrl = "/subscription/addSubscription"
export const addSubscriptionRequest = Type.Object({
  contactType: Type.String({ minLength: 1 }),
  contactInfo: Type.String({ minLength: 1 }),
  fromCurrency: Type.String({ minLength: 1 }),
  toCurrency: Type.String({ minLength: 1 }),
  desiredValue: Type.Number(),
  minimumCooldown: Type.String({ minLength: 1 }),
})
export type AddSubscriptionRequest = Static<typeof addSubscriptionRequest>

export const getSubscriptionRequestUrl = "/subscription/getSubscription"
export const getSubscriptionRequest = Type.Object({
  contactType: Type.String({ minLength: 1 }),
  contactInfo: Type.String({ minLength: 1 }),
})
export type GetSubscriptionRequest = Static<typeof getSubscriptionRequest>

export const subscription = Type.Object({
  subscriptionId: Type.Number(),
  fromCurrency: Type.String({ minLength: 1 }),
  toCurrency: Type.String({ minLength: 1 }),
  desiredValue: Type.Number(),
  minimumCooldown: Type.String({ minLength: 1 }),
  currentCooldown: Type.String({ minLength: 1 }),
})
export type Subscription = Static<typeof subscription>

export const getSubscriptionResponse = Type.Array(subscription)
export type GetSubscriptionResponse = Static<typeof getSubscriptionResponse>

export const deleteSubscriptionRequestUrl = "/subscription/deleteSubscription"
export const deleteSubscriptionRequest = Type.Object({
  subscriptionId: Type.Number(),
})
export type DeleteSubscriptionRequest = Static<typeof deleteSubscriptionRequest>

export const deleteUserRequestUrl = "/subscription/deleteUser"
export const deleteUserRequest = Type.Object({
  userId: Type.Number(),
})
export type DeleteUserRequest = Static<typeof deleteUserRequest>
