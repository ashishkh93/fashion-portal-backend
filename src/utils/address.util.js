const normalizeString = (str) => {
  return (
    str
      ?.trim() // Removes leading/trailing whitespace
      .replace(/\s+/g, ' ') // Collapses multiple spaces into a single space
      .toLowerCase() // Converts everything to lowercase
      .replace(/[^\w\s]/gi, '') || // Removes special characters (punctuation)
    ''
  );
};

const generateAddressSignature = (address) => {
  return [
    normalizeString(address.street),
    normalizeString(address.buildingNumber),
    normalizeString(address.landmark), // optional
    normalizeString(address.pincode),
    normalizeString(address.city),
    normalizeString(address.state),
  ].join('|');
};

module.exports = { generateAddressSignature };
