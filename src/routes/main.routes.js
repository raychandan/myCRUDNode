module.exports = (app) => {
    require('../plugins/users/routes/user.routes')(app);
};