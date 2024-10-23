export const verifyIsUnicode = (str) => {
    const finalStrig = str.split(' ').join('');
    // all special characters=>   `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~
    const withoutSpecialChar = finalStrig.replace(/[`!@#$%&*()_+\-=\;':",.<>\/?]/g, '');
    const matchRegx = /^[a-z0-9]+$/gi;
    return withoutSpecialChar.match(matchRegx) ? false : true;
};