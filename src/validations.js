/* Variables that the functions below will need */
let acceptedReleaseStatus = ["upcoming", "classic", "released"];



/* Actual validation functions start here - export them for outside use */
export const onlyLettersAndIntegerNumbers = value => /^[A-Za-z0-9 ]+$/i.test(value) || 'Field must contain only letters and numbers!';
export const comicBookName = value => /^[A-Za-z ]+[#]{1,1}[0-9]{1,}$/i.test(value) || 'Field must be in the example format: Batman #32 or Superman #41!';
export const onlyLetters = value => /^[A-Za-z ]+$/i.test(value) || 'Field must contain only letters!';
export const onlyIntegerNumbers = value => /^[0-9]+/.test(value) || 'Field must contain only numbers!';
export const onlyFloatNumbers = value => /[\\d{1,3}(\\.\\d{1,3})?]/.test(value) || 'Field must contain only floating point numbers (ex. 2.99)!'
export const onlyIntegerAndFloatNumbers = value => /^(?:\d{1,3}(?:\.\d{1,3})?|1)$/.test(value) || 'Field must contain only numbers (ex. 1) or floating point numbers (ex. 3.99)!';
export const onlySpecialCharacters = value => /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Field must contain only special characters!';
export const notEmpty = value => !!value || 'Field cannot be empty!';
export const validUrl = value => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/.test(value) || 'The provided URL is not valid!'
export const optionalValidUrl = value => (!value || /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/.test(value)) || 'Field should be empty or contain a valid URL'
export const reviewScore = value => /^[1-5]$/.test(value) || 'You have entered an invalid score - minimum is 1 and maximum is 5!'
export const descLength = value => (!!value && value.length <= 10000) || 'Too many characters in description - maximum allowed is 10 000!'
export const postLength = value => (!!value && value.length <= 600) || 'Too many characters in post - maximum allowed is 600!'
export const validEmail = value => (!!value && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) || 'Invalid e-mail adress format!' 
export const threadTitleLength = value => (!!value && value.length <= 100) || 'Too many characters in thread title - maximum allowed is 100!'
export const emailTopicLength = value => (!!value && value.length <= 100) || 'Too many characters in e-mail topic - maximum allowed is 100!'
export const commenterNameLength = value => (!!value && value.length <= 25) || 'Name is too long - maximum length is 25 characters!'
export const fileListNotEmpty = value => (!!value && typeof value === "object") || 'You must select a file to upload!'
export const onlyAcceptedReleaseStatus = value => (!!value && acceptedReleaseStatus.includes(value)) || "Invalid release status!"