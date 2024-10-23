import prisma from "./prismaClient.js";

export const handleSmsGateWay = async ({ school_id }) => {
    const smsGatewayRes = await prisma.smsGateway.findFirst({ where: { school_id } })

    if (!smsGatewayRes) return { error: "error :- sms gateway missing", data: null };

    const { id, details } = smsGatewayRes;
    const { sender_id, sms_api_key: api_key, is_masking } = details ?? {};
    if (!sender_id && !api_key) return { error: "error :- sender_id or api_key missing", data: null };

    return { error: null, data: { id, sender_id, api_key, is_masking } }
}