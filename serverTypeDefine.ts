import { Static, Type } from "@sinclair/typebox"

///// awsSns routes /////
export const sendMessageToPhoneNumberRequest = Type.Object({
    message: Type.String({ minLength: 1 }),
    destNumber: Type.String({ minLength: 1}),
})
export type SendMessageToPhoneNumberRequest = Static<typeof sendMessageToPhoneNumberRequest>


///// awsSes routes /////
export const sendEmailRequest = Type.Object({
    from: Type.String({ minLength: 1 }),
    to: Type.String({ minLength: 1}),
    subject: Type.String(),
    html: Type.String(),
    text: Type.String(),
})
export type SendEmailRequest = Static<typeof sendEmailRequest>
