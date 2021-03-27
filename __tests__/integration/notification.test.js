process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const DATA = {};

beforeEach(async function () {
	try {
		// Create a test user with token
		const hashedPW = await bcrypt.hash('testpassword', 1);
		await db.query(
			`INSERT INTO users (username, password, firstname, lastname, email)
        VALUES ('testUser', $1, 'testFirstname', 'testLastname', 'test@demo.com')`,
			[hashedPW]
		);

		const user = await request(app)
			.post('/login')
			.send({ username: 'testUser', password: 'testpassword' });

		// Insert a test movie into "movies"
		const movie = await db.query(
			`INSERT INTO movies (id, original_title, overview, poster_path, vote_average, release_date, runtime, backdrop_path, tagline)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, original_title, overview`,
			[
				111,
				'Test Movie One',
				'Lorem ipsum',
				'/betExZlgK0l7CZ9CsCBVcwO1OjL.jpg',
				5,
				'15-07-2020',
				60,
				'/gEjNlhZhyHeto6Fy5wWy5Uk3A9D.jpg',
				'Test Tagline'
			]
		);

		DATA.token = user.body.token;
		DATA.user_id = jwt.decode(DATA.token).id;
		DATA.movie_id = movie.rows[0].id;
	} catch (err) {
		console.error(err);
	}
});

afterEach(async () => {
	await db.query('DELETE FROM users');
	await db.query('DELETE FROM movies');
	await db.query('DELETE FROM watchlist');
});

afterAll(async () => {
	await db.end();
});

describe('Add a movie to watchlist', () => {
	test('Add a movie to the Watchlist, success', async () => {
		const result = await request(app)
			.post(`/watchlist/${DATA.user_id}/add`)
			.send({ movie_id: DATA.movie_id, _token: DATA.token });

		expect(result.statusCode).toEqual(201);
		expect(result.body).toEqual(expect.anything());
	});

	test('Add a movie to the Watchlist, failed, invalid token', async () => {
		const result = await request(app)
			.post(`/watchlist/${DATA.user_id}/add`)
			.send({ _token: 'fake_token' });

		expect(result.statusCode).toEqual(401);
		expect(result.body).toHaveProperty('error', {
			message: 'Unauthorized, invalid token!',
			status: 401
		});
	});
});

describe('Get a movie from the watchlist', () => {
	test('Add a movie to the Watchlist, success', async () => {
		const result = await request(app)
			.get(`/watchlist/${DATA.user_id}`)
			.send({ _token: DATA.token });

		expect(result.statusCode).toEqual(200);
		expect(result.body).toEqual(expect.anything());
	});

	test('Add a movie to the Watchlist, failed, invalid token', async () => {
		const result = await request(app)
			.get(`/watchlist/${DATA.user_id}`)
			.send({ _token: 'fake_token' });

		expect(result.statusCode).toEqual(401);
		expect(result.body).toHaveProperty('error', {
			message: 'Unauthorized, invalid token!',
			status: 401
		});
	});
});

describe('Remove a movie from the watchlist', () => {
	test('Remove a movie from the Watchlist, success', async () => {
		const result = await request(app)
			.delete(`/watchlist/${DATA.user_id}/${DATA.movie_id}`)
			.send({ _token: DATA.token });

		expect(result.statusCode).toEqual(200);
		expect(result.body).toEqual(expect.anything());
		expect(result.body).toHaveProperty('message', 'Movie removed from watchlist');
	});

	test('Remove a movie from the Watchlist, failed, invalid token', async () => {
		const result = await request(app)
			.delete(`/watchlist/${DATA.user_id}/${DATA.movie_id}`)
			.send({ _token: 'fake_token' });

		expect(result.statusCode).toEqual(401);
		expect(result.body).toHaveProperty('error', {
			message: 'Unauthorized, invalid token!',
			status: 401
		});
	});
});
