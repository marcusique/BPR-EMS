let app = require('../../index');
let session = require('supertest-session');

let testSession = null;


describe('Test with supertest-session/preAuth [TS_1]', function(){
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
        .expect(401)
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

    // Password reset flow testing --START--
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

    it('should recognize valid email [1_8]', function(done){
        testSession.post('/forgot')
        .send({email: 'todor.gerganov@gmail.com'})
        .expect(302)
        .expect('location', '/')
        .end(done);
    });

    it('should access password reset link [1_9]', function(done){
        testSession.get('/reset/d84e2912ab598402e140da8af7a57b44256b1290')
        .expect(200)
        .end(done)
    });

    it('should accept entered password [1_10]', function(done){
        testSession.post('/reset/d84e2912ab598402e140da8af7a57b44256b1290')
        .send({password: 'test', confirm: 'test'})
        .expect(302)
        .expect('location', '/calendar')
        .end(done)
    });

    it('should NOT accept entered password [1_11]', function(done){
        testSession.post('/reset/d84e2912ab598402e140da8af7a57b44256b1290')
        .send({password: 'test', confirm: 'testTest'})
        .expect(302)
        .expect('location', '/')
        .end(done)
    });
    // Password reset flow testing --END--

    it('should return 404 with invalid route [1_?]', function(done){
        testSession.get('/invalid/route')
        .expect(404)
        .end(done)
    });

});