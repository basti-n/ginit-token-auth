function required(value, errorMsg = 'Error: Please provide a value!') {
  if (value.length) {
    return true;
  }

  return errorMsg;
}

module.exports = { required };
