process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const DATA = {};
const Product = require("../../models/ProductModel")

beforeEach(async function () {
	try {
		// Create a test user with token
		const hashedPW = await bcrypt.hash('testpassword', 1);

		const testUser = {
			email: "email@gmail.com",
			username: "testUsername",
			password: hashedPW,
			firstName: "John",
			lastName: "Doe",
			balance: 100
		}
		await db.query(
			`INSERT INTO users (
				username, password, firstname, lastname, email)
        	 VALUES (
				${testUser.email},
				${testUser.username},
				${testUser.password},
				${testUser.firstName},
				${testUser.lastName},
				${testUser.balance},)`
		);

		const tokenResult = await request(app)
			.post('/auth/token')
			.send({ 
				username: testUser.username, 
				password: testUser.password
			});

		DATA.token = tokenResult.body.token;
		DATA.username = jwt.decode(DATA.token).username;
		DATA.id = jwt.decode(DATA.token).id;

		// Grab tomorrow's datetime object to insert into 
		// test product's auctionEndDt
		var tomorrow = new Date();
		tomorrow.setDate(new Date().getDate()+1)

		const testProduct = {
			name: "iPhone",
			category:"Electronics",
			subCategory:"Phones",
			description:"This is a test description.",
			condition:"Used",
			rating:4,
			numOfRatings:49,
			imageUrl:"https://testphoto.jpg",
			startingBid:50.00,
			auctionEndDt: tomorrow
		}

		// Insert a test product into "products"
		const result = await db.query(
			`INSERT INTO products (
				products.name,
				products.category,
				products.sub_category AS "subCategory",
				products.description,
				products.condition,
				products.rating,
				products.num_of_ratings AS "numOfRatings",
				products.image_url AS "imageUrl",
				products.starting_bid AS "startingBid",
				products.auction_end_dt AS "auctionEndDt"
				) 
			VALUES (
				${testProduct.name},
				${testProduct.category},
				${testProduct.subCategory},
				${testProduct.description},
				${testProduct.condition},
				${testProduct.rating},
				${testProduct.numOfRating},
				${testProduct.imageUrl},
				${testProduct.startingBid},
				${testProduct.auctionEndDt}
				)
			RETURNING 
				name, category, subCategory, description, condition, rating, numOfRatings, imageUrl, startingBid, auctionEndDt, bidCount AS "bidCount", auction_ended AS "auctionEnded"`
		);

		DATA.product = result.rows[0];
	} catch (err) {
		console.error(err);
	}
});

afterEach(async () => {
	await db.query('DELETE FROM users');
	await db.query('DELETE FROM products');
});

afterAll(async () => {
	await db.end();
});

describe('Get list of products', () => {
	test('Get list of products', async () => {
		const result = await request(app).post('/movies/add').send({
			id: 789,
			original_title: 'Test Movie Two',
			overview: 'Lorem ipsum',
			poster_path: '/betExZlgK0l7CZ9CsCBVcwO1OjL.jpg',
			vote_average: 5,
			release_date: '15-07-2020',
			runtime: 100,
			backdrop_path: '/gEjNlhZhyHeto6Fy5wWy5Uk3A9D.jpg',
			tagline: 'Test Tagline.',
			_token: DATA.token
		});
		expect(result.statusCode).toEqual(200);
		expect(result.body).toHaveProperty('message', 'Movie successfully added to DB');
		expect(result.body).toEqual(expect.anything());
	});

	test('Add a movie to the DB, failed', async () => {
		const result = await request(app).post('/movies/add').send({
			id: 789,
			original_title: 'Test Movie Two',
			overview: 'Lorem ipsum',
			poster_path: '/betExZlgK0l7CZ9CsCBVcwO1OjL.jpg',
			vote_average: 5,
			release_date: '15-07-2020',
			runtime: 100,
			backdrop_path: '/gEjNlhZhyHeto6Fy5wWy5Uk3A9D.jpg',
			tagline: 'Test Tagline.',
			_token: 'fake_token'
		});
		expect(result.statusCode).toEqual(401);
	});
});

describe('Get a movie from the DB', () => {
	test('Get a movie from the DB, success', async () => {
		const result = await request(app).get(`/movies/${DATA.movies.id}`);

		expect(result.statusCode).toEqual(200);
		expect(result.body).toEqual(expect.anything());
	});
});

describe('Get all movies from the DB', () => {
	test('Get all movie from the DB, success', async () => {
		const result = await request(app).get(`/movies/`).send({ _token: DATA.token });

		expect(result.statusCode).toEqual(200);
		expect(result.body).toEqual(expect.anything());
	});

	test('Get all movie from the DB, failed, wrong token', async () => {
		const result = await request(app).get(`/movies/`).send({ _token: 'fake_token' });

		expect(result.statusCode).toEqual(401);
		expect(result.body).toHaveProperty('error', {
			message: 'You must authenticate first.',
			status: 401
		});
	});
});

describe('Delete a movie from the DB', () => {
	test('Delete a movie from the DB, success', async () => {
		const result = await request(app)
			.delete(`/movies/${DATA.movies.id}`)
			.send({ _token: DATA.token });

		expect(result.statusCode).toEqual(200);
		expect(result.body).toHaveProperty(
			'message',
			`Movie with id: ${DATA.movies.id} has been deleted`
		);
	});

	test('Delete a movie from the DB, failed, wrong token', async () => {
		const result = await request(app)
			.delete(`/movies/${DATA.movies.id}`)
			.send({ _token: 'fake_token' });

		expect(result.statusCode).toEqual(401);
		expect(result.body).toHaveProperty('error', {
			message: 'You must authenticate first.',
			status: 401
		});
	});
});
