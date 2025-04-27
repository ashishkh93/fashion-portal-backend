const { ScheduledJob } = require('../../models');

exports.createSchedule = async (payload) => {
  const newSchedule = await ScheduledJob.create(payload);
  return newSchedule;
};

exports.updateSchedule = async (payload, condition) => {
  const updatedSchedule = await ScheduledJob.update(payload, condition);
  return updatedSchedule;
};
