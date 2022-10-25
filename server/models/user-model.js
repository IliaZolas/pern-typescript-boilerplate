const pool = require('pool')

// get a user
function getUser() {
    async (req, res) => {
    try {
    const { id } = req.params;
    const fetchUser = pool.query("SELECT * FROM users WHERE user_id = $1", [
        id
    ]);

    res.json(fetchUser.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    }
};

// get users
function getUsers() {
    return pool.query("SELECT * from users");
};

// update a user
function updateUser() {
    async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const updateUser = pool.query("UPDATE User SET description = $1 WHERE User_id = $2",
            [description, id]);

    res.json(updateUser.rows[0]);
        } catch (err) {
        console.error(err.message);
        }
    }
};

// delete a user
function deleteUser() {
    async (req, res) => {
    try {
        const { id } = req.params;
        const destroyUser = pool.query("DELETE FROM User WHERE User_id = $1", [
            id
        ]);

    res.json(destroyUser.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    }
};

// signup a new user | create
function signUp() { async(req, res, next) => {

    }
};

// user login
function login() { async(req, res, next) => {

    }
};

export { getUser, getUsers, updateUser, deleteUser, signUp, login };