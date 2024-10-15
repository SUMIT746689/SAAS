import prisma from '@/lib/prisma_client';
import axios from 'axios';
import crypto from 'crypto';

export const getOneCookies = (cname) => {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

export function onlyUnique(value, index, array) {
  console.log(value, array.indexOf(value), index);
  return array.indexOf(value) === index;
}
export function registration_no_generate(index) {
  return (
    (Date.now().toString() + Math.random().toString()).substring(0, 11) +
    (index || '')
  );
}
export function unique_password_generate() {
  return Date.now().toString(36) + Math.random().toString(36).substring(0, 8);
}
export function generateUsername(firstName) {
  const text = Date.now().toString();
  return (
    firstName?.split(' ').join('').toLowerCase() +
    text.substring(text.length - 5) +
    Math.random().toString(36).substring(0, 8)
  );
}

export async function generateUsernameNew(firstName) {
  try {
    const res = await axios.get(`/api/generate_username?name=${firstName}`)
    console.log({ res })
    return res.data
    // const text = Date.now().toString();
    // return (
    // if(firstName)
    // firstName?.split(' ').join('').toLowerCase() +
    // text.substring(text.length - 5) +
    // Math.random().toString(36).substring(0, 8)
    // );
  }
  catch (err) {
    return firstName
  }
}

// export async function generateUsernameUsingNumber(value) {
//   const resUser = await prisma.user.findFirst({ where: { username: { contains: value } }, select: { username: true }, orderBy: { created_at: "desc" } });
//   console.log({ resUser });

//   // return value + text.substring(text.length - 5) + Math.random().toString(36).substring(0, 8)
// }

export function unique_tracking_number(str = '') {
  return str + Date.now().toString() + crypto.randomBytes(5).toString('hex');
}

export async function handleGetMaxTrackingNumber(school_id) {
  //get max track number for student fees transaction
  const getMaxTrackingNumber = await prisma.$queryRaw`
        SELECT 
        -- CAST(SUBSTRING(tracking_number, 4) AS UNSIGNED) as 
        tracking_number FROM transactions
        WHERE school_id = ${school_id} AND tracking_number LIKE BINARY'ST-%' AND SUBSTRING(tracking_number, 4) REGEXP '^[0-9]+$'
        ORDER BY CAST(SUBSTRING(tracking_number, 4) AS UNSIGNED) DESC , tracking_number DESC
        LIMIT 1
        `;

  // create a new unique tracking number
  const tracking_number = getMaxTrackingNumber[0]?.tracking_number ? `ST-${parseInt(getMaxTrackingNumber[0]?.tracking_number.slice(3)) + 1}` : 'ST-1000'
  // let tracking_number = await new_unique_tracking_number(`st-${user_id}-${student_id}`, school_id);
  return tracking_number
}

export async function new_unique_tracking_number(str = '', school_id) {
  const trackingNumber =
    str + Date.now().toString() + crypto.randomBytes(5).toString('hex');
  const resisAlreadyHave = await prisma.transaction.findFirst({
    where: {
      tracking_number: trackingNumber,
      school_id
    }
  });
  if (!resisAlreadyHave) return trackingNumber;
  unique_tracking_number(str, school_id);
}

export function accessNestedProperty(obj, array) {
  let currentObject = obj;
  for (const key of array) {
    if (currentObject && currentObject.hasOwnProperty(key)) {
      currentObject = currentObject[key];
    } else {
      return undefined;
    }
  }
  return currentObject;
}

export function getFile(str) {
  return str && typeof str == 'string'
    ? `/api/get_file/${str?.replace(/\\/g, '/')}`
    : '';
}

export const imagePdfDocType = [
  'image/x-png',
  'image/png',
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];
