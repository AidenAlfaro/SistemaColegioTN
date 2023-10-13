const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'TuetalRegistro',
    password: 'Aiden@15',
    port: 5432,
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userQuery = await pool.query('SELECT password FROM loginData WHERE username = $1', [username]);

        if (userQuery.rows.length === 0) {
            return res.status(401).send('Try again');
        }

        const passwordValid = await bcrypt.compare(password, userQuery.rows[0].password);
        if (!passwordValid) {
            return res.status(401).send('Try again');
        }

        res.status(200).send('Welcome');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.get('/classes', async (req, res) => {
    try {
        const classesQuery = await pool.query('SELECT * FROM classes');
        res.json(classesQuery.rows);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/classes', async (req, res) => {
	const { name } = req.body;

	if (!name) {
		return res.status(400).send('Class name is required');
	}

	try {
		const existingClass = await pool.query('SELECT * FROM classes WHERE name = $1', [name]);

		if (existingClass.rows.length > 0) {
			return res.status(400).send('Class with this name already exists');
		}

		await pool.query('INSERT INTO classes (name) VALUES ($1)', [name]);
		res.status(201).send('Class added successfully');
	} catch (err) {
		res.status(500).send('Server error');
	}
});

app.delete('/classes', async (req, res) => {
    try {
        await pool.query('DELETE FROM classes');
        res.status(200).send('All classes deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/classes/:id', async (req, res) => {
    const classId = req.params.id;

    try {
        const classQuery = await pool.query('SELECT * FROM classes WHERE id = $1', [classId]);
        if (classQuery.rows.length > 0) {
            res.json(classQuery.rows[0]);
        } else {
            res.status(404).send('Class not found');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});


// Starting the Server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
