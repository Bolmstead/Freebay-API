const request = require('supertest');
const app = require('../../app');

const User = require('../../models/user');

process.env.NODE_ENV === 'test';
const db = require('../../db');

// set up the test:
let test_user;
beforeEach(async () => {
	// create a couple of users
	test_user = {
		username: 'test1',
		password: 'password',
		firstname: 'test_firstname',
		lastname: 'test_lastname',
		email: 'test1@demo.com'
	};

	await User.register(test_user);
});

afterEach(async () => {
	await db.query('DELETE FROM users');
});

afterAll(async () => {
	await db.end();
});

describe('Signup a user', () => {
	test('sign up a user, success', async () => {
		const test_user2 = {
			username: 'test2',
			password: 'password',
			firstname: 'test_firstname',
			lastname: 'test_lastname',
			email: 'test2@demo.com'
		};

		const result = await request(app).post('/users/').send(test_user2);
		expect(result.statusCode).toEqual(201);
		expect(result.body).toEqual(expect.anything());
	});
});

describe('/login', () => {
	test('log in a user, success', async () => {
		const result = await request(app).post('/login').send({
			username: test_user.username,
			password: test_user.password
		});
		expect(result.statusCode).toEqual(200);
		expect(result.body).toEqual(expect.anything());
	});

	test('log in a user, schema fail, not authenticated', async () => {
		const result = await request(app).post('/login').send({
			username: 'username'
		});
		expect(result.statusCode).toEqual(401);
	});
});

describe('GET/users', () => {
	test('get users, success', async () => {
		const res = await request(app).post('/login').send({
			username: test_user.username,
			password: test_user.password
		});

		const result = await request(app).get('/users').send({ _token: res.body.token });
		expect(result.statusCode).toEqual(200);
	});
	test('get users, unauthorized', async () => {
		const result = await request(app).get('/users').send({});
		expect(result.statusCode).toEqual(401);
		expect(result.body).toHaveProperty('error', {
			message: 'You must authenticate first.',
			status: 401
		});
	});
});

describe('GET/users/:id', () => {
	test('get one user, success', async () => {
		const res = await request(app).post('/login').send({
			username: test_user.username,
			password: test_user.password
		});

		const result = await request(app).get(`/users/${res.body.id}`).send({ _token: res.body.token });
		expect(result.statusCode).toEqual(200);
	});
	test('get user, unauthorized', async () => {
		const res = await request(app).post('/login').send({
			username: test_user.username,
			password: test_user.password
		});

		const result = await request(app).get(`/users/${res.body.id}`).send({});
		expect(result.statusCode).toEqual(401);
		expect(result.body).toHaveProperty('error', {
			message: 'Unauthorized, invalid token!',
			status: 401
		});
	});
});

describe('PATCH/users/:id', () => {
	test("edit a user's username, success", async () => {
		const res = await request(app).post('/login').send({
			username: test_user.username,
			password: test_user.password
		});
		const result = await request(app).patch(`/users/${res.body.id}`).send({
			firstname: 'newTestFirstname',
			password: test_user.password,
			_token: res.body.token
		});

		expect(result.statusCode).toEqual(200);
		expect(result.body.user.firstname).toEqual('newTestFirstname');
	});

	test("edit a user's , schema fail", async () => {
		const res = await request(app).post('/login').send({
			username: test_user.username,
			password: test_user.password
		});

		const result = await request(app).patch(`/users/${res.body.id}`).send({
			firstname: 'fakeFirstname',
			_token: res.body.token,
			password: 'wrong_password'
		});
		expect(result.statusCode).toEqual(401);
	});
});

describe('/DELETE/user/:id', () => {
	test('delete a user, success', async () => {
		const res = await request(app).post('/login').send({
			username: test_user.username,
			password: test_user.password
		});

		const result = await request(app)
			.delete(`/users/${res.body.id}`)
			.send({ _token: res.body.token });

		expect(result.statusCode).toEqual(200);
		expect(result.body).toHaveProperty('message', `User: ${res.body.id} has been deleted`);
	});
	test('delete a user, fail', async () => {
		const fake_token = '.1234abcde';
		const result = await request(app).delete(`/users/fake_user_id`).send({
			_token: fake_token
		});

		expect(result.statusCode).toEqual(401);
		expect(result.body).toHaveProperty('error', {
			message: 'Unauthorized, invalid token!',
			status: 401
		});
	});
});
