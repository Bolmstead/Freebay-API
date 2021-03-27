const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
	it('should generate proper partial update query with 1 field', function () {
		const { query, values } = sqlForPartialUpdate(
			'users',
			{ firstname: 'Test' },
			'username',
			'testuser'
		);

		expect(query).toEqual('UPDATE users SET firstname=$1 WHERE username=$2 RETURNING *');

		expect(values).toEqual(['Test', 'testuser']);
	});
});
