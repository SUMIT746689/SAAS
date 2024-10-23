export const handleNumberOfSmsParts = ({ isUnicode, textLength }) => {
    let number_of_sms_parts = 0;

    if (isUnicode) number_of_sms_parts = textLength <= 70 ? 1 : Math.ceil(textLength / 67);
    else number_of_sms_parts = textLength <= 160 ? 1 : Math.ceil(textLength / 153);

    return number_of_sms_parts;
}