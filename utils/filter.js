function containsURL(message, extensions = []) {
  const urlPattern = /(https?:\/\/|www\.)[\w\-]+(\.[\w\-]+)+([\w\-./?%&=]*)?/i;
  const extPattern = extensions.join('|').replace(/\./g, '\\.');
  const extCheck = new RegExp(`\\b(https?://|www\\.)?[\\w-]+(${extPattern})\\b`, 'i');

  return extCheck.test(message) || urlPattern.test(message);
}

function containsBadWords(message, badWords = []) {
  const lower = message.toLowerCase();
  return badWords.some(word => lower.includes(word));
}

function isTooLong(message, maxLength = 100) {
  return message.length > maxLength;
}

module.exports = {
  containsURL,
  containsBadWords,
  isTooLong
};