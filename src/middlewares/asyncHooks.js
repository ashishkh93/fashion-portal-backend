const asyncHooks = require('async_hooks');
const transactions = new Map();

const init = (asyncId, type, triggerAsyncId) => {
  if (transactions.has(triggerAsyncId)) {
    transactions.set(asyncId, transactions.get(triggerAsyncId));
  }
};

const destroy = (asyncId) => {
  if (transactions.has(asyncId)) {
    transactions.delete(asyncId);
  }
};

const hook = asyncHooks.createHook({ init, destroy });
hook.enable();

const setTransaction = (transaction) => {
  const asyncId = asyncHooks.executionAsyncId();
  transactions.set(asyncId, transaction);
};

const getTransaction = () => {
  const asyncId = asyncHooks.executionAsyncId();
  return transactions.get(asyncId);
};

module.exports = {
  setTransaction,
  getTransaction,
};
