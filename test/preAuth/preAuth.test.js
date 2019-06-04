let app = require('../../index');
let session = require('supertest-session');

let testSession = null;


describe.skip('Test with supertest-session/preAuth [TS_1]', function(){
    beforeEach(function(){
        testSession = session(app);
    });

    it('should GET the landing page [1_1]', function(done){
        testSession.get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });

    it('should fail accessing a restricted page [1_2]', function(done){ 
        testSession.get('/calendar')
        .expect(302)
        .expect('location', '/')
        .end(done)
    });

    it('should sign in successfully [1_3]', function(done){
        testSession.post('/login')
        .send({username: 'tgerganov', password: 'todor'})
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });

    it('should sign in UNsuccessfully (wrong password) [1_4]', function(done){ 
        testSession.post('/login')
        .send({username: 'tgerganov', password: 'wrong'})
        .expect(302)
        .expect('location', '/')
        .end(done);
    });

    it('should sign in UNsuccessfully (wrong username) [1_5]', function(done){ 
        testSession.post('/login')
        .send({username: 'wrong', password: 'todor'})
        .expect(302)
        .expect('location', '/')
        .end(done);
    });

    it('should GET the forgot password page [1_6]', function(done){
        testSession.get('/forgot')
        .expect(200)
        .end(done);
    });

    it('should fail resetting password [1_7]', function(done){
        testSession.post('/forgot')
        .send({email: 'wrong@email.com'})
        .expect(302)
        .expect('location', '/forgot')
        .end(done);
    });

});