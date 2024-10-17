
import prisma from '@/lib/prisma_client';

export default async function generateUsername (name:string|null) {
    const searchUserRegExp = `${name}\d*[0-9]*$`
    
    if (!name) throw new Error('name field not founds')

    const sentSmsUsers = await prisma.$queryRaw`
        SELECT id,username
        FROM users
        WHERE username REGEXP ${searchUserRegExp}
        ORDER BY CAST(SUBSTRING(username, CHAR_LENGTH(${name}) + 1) AS UNSIGNED) DESC , username DESC
        LIMIT 1
    `;
    // @ts-ignore       
    if (sentSmsUsers.length === 0) return name;

    const username = sentSmsUsers[0].username;

    const regexObj = new RegExp(name,"i");
    const extraNumberParts = username.replace(regexObj, "");
    const numberIncreament = extraNumberParts ? parseInt(extraNumberParts) + 1 : 0;
    const newUsername = [name, String(numberIncreament)].join('')
    // console.log({ sentSmsUsers, regexObj })
    // console.log({ extraNumberParts, numberIncreament })
    // console.log([name, String(numberIncreament)].join(''))
    return newUsername
}