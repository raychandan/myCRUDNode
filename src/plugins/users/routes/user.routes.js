const { register, login, getUserById, forgetPassword, resetPassword, socialLogin, updateUser } = require('../controllers/user.controller');
const { encode, decode } = require('../../../helpers/jwt.helper');

module.exports = (app) => {
    
    app.post('/api/user/register', async (req, res) => {
        try {
            const result = await register(req.body, req);
            return res.status(result.code).send(result.data);
        } catch (ex) {
            return res.status(ex.code).send(ex.error);
        }
    });

    app.post('/api/user/social-login', async (req, res) => {
        try {
            const result = await socialLogin(req.body, req, res);
            return res.status(result.code).send(result.data);
        } catch (ex) {
            return res.status(ex.code).send(ex.error);
        }
    });

    app.post('/api/user/login', encode, async (req, res) => {
        try {
            const result = await login(req.body, req);
            return res.status(result.code).send(result.data);
        } catch (ex) {
            return res.status(ex.code).send(ex.error);
        }
    });

    app.get('/api/user/getUserbyId/:id', decode, async (req, res) => {
        try {
            const result = await getUserById(req);
            return res.status(result.code).send(result.data);
        } catch (ex) {
            return res.status(500).send(ex.error);
        }
    });

    app.post('/api/user/updateUser/:id', decode, async (req, res) => {
        try {
            const result = await updateUser(req);
            return res.status(result.code).send(result.data);
        } catch (ex) {
            return res.status(500).send(ex.error);
        }
    });

    app.post('/api/user/forget-password', async (req, res) => {
        try {
            const result = await forgetPassword(req.body, req);
            return res.status(result.code).send(result.data);
        } catch (ex) {
            return res.status(ex.code).send(ex.error);
        }
    });

    app.post('/api/user/reset-password', async (req, res) => {
        try {
            const result = await resetPassword(req.body, req);
            return res.status(result.code).send(result.data);
        } catch (ex) {
            return res.status(ex.code).send(ex.error);
        }
    });
};