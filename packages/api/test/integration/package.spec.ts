import supertest from 'supertest';

import {initializeServer, publishVersion} from './_helper';
import { HTTP_STATUS } from '@verdaccio/commons-api';
import { HEADERS} from '@verdaccio/dev-commons';
import {$RequestExtend, $ResponseExtend} from "@verdaccio/dev-types";

const mockApiJWTmiddleware = jest.fn(() =>
	(req: $RequestExtend, res: $ResponseExtend, _next): void => {
			req.remote_user = { name: 'foo', groups: [], real_groups: []}
			_next();
		}
);

jest.setTimeout(500000);

jest.mock('@verdaccio/auth', () => ({
	Auth: class {
		apiJWTmiddleware() {
			return mockApiJWTmiddleware();
		}
		allow_access (_d, f_, cb) {
			cb(null, true)
		}
		allow_publish (_d, f_, cb) {
			cb(null, true)
		}
	}
}));

describe.skip('package', () => {
	beforeAll(async () => {
		await publishVersion('package.yaml', 'foo', '1.0.0');
	});

	test('should return a package', async (done) => {
			return supertest(await initializeServer('package.yaml'))
				.get('/foo')
				.set('Accept', HEADERS.JSON)
				.expect('Content-Type', HEADERS.JSON_CHARSET)
				.expect(HTTP_STATUS.OK)
				.then(response => {
					expect(response.body.username).toEqual('foo');
					done();
				});
	});

	// test.skip('should test no referer /whoami endpoint', (done) => {
	// 	return supertest(initializeServer('whoami.yaml'))
	// 		.get('/whoami')
	// 		.expect(HTTP_STATUS.NOT_FOUND)
	// 		.end(done);
	// });
	//
	//
	// test('should return the logged username', () => {
	// 	return supertest(initializeServer('whoami.yaml'))
	// 		.get('/-/whoami')
	// 		.set('Accept', HEADERS.JSON)
	// 		.expect('Content-Type', HEADERS.JSON_CHARSET)
	// 		.expect(HTTP_STATUS.OK)
	// 		.then(response => {
	// 			expect(response.body.username).toEqual('foo');
	// 		});
	// });
});
