const successAuth = async (req, res, next) => {
  if (!req.user || req.user == null) {
    return res.redirect("/login?user=" + "false")
  }
  res.redirect("/login?user=" + JSON.stringify(req.user))
}

module.exports = {
  successAuth,
}
