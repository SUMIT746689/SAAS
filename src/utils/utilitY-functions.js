import crypto from 'crypto';

export const getOneCookies = (cname) => {

  let name = cname + "=";
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
  return "";
}

export function onlyUnique(value, index, array) {
  console.log(value, array.indexOf(value), index);
  return array.indexOf(value) === index;
}
export function registration_no_generate() {
  return (Date.now().toString() + Math.random().toString()).substring(0, 11);
}
export function unique_password_generate() {
  return Date.now().toString(36) + Math.random().toString(36).substring(0, 8);
}
export function generateUsername(firstName) {
  const text = Date.now().toString()
  return firstName?.split(' ').join('').toLowerCase() + text.substring(text.length - 5) + Math.random().toString(36).substring(0, 8)
}

export function unique_tracking_number(str = '') {
  return str + Date.now().toString() + crypto.randomBytes(5).toString("hex")
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
  return str && typeof (str) == 'string' ? `/api/get_file/${str?.replace(/\\/g, '/')}` : ''
}

export const imagePdfDocType = ['image/x-png','image/png', 'image/gif', 'image/jpeg',
  'image/jpg', 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword']