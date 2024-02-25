const accessModal = require("../Modals/accessModal");

const rateLimiting = async (req, res, next) => {
  const userId = req.userToken.uid;

  try {
    const accessDb = await accessModal.findOne({ userId });
    if (!accessDb) {
      const accessObj = new accessModal({
        userId: userId,
        time: Date.now(),
      });
      await accessObj.save();
      next();
      return;
    }
    const diff = ((Date.now() - accessDb.time) / 1000);

    if(diff < 30)
    {
        return res.send({
            status:400,
            message:"To many requests"
        })
    }
    await accessModal.findOneAndUpdate({userId: userId},{time: Date.now()});
    next();
  } catch (err) {
    return res.send({
        status:500,
        message:"Database error: ",
        error:err
    })
  }
};

module.exports = rateLimiting;
