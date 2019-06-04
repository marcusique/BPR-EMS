let app = require('../../index');
let session = require('supertest-session');

let testSession = null;


describe.skip('Test with supertest-session/postAuth/admin [TS_4]', function () {
    let authSession;
    beforeEach(function (done) {
        testSession = session(app);
        testSession
        .post('/login')
        .send({ username: 'majtay', password: 'test' })
        .expect(302)
        .expect('Location', '/calendar')
        .end(function (err) {
            if (err) return done(err);
            authSession = testSession;
            return done();
        });
    });

    /* --- Calendar page --- */
    
    it('should have access to employee directory [4_1]', function(done){
        authSession.get('/employees')
        .expect(200)
        .end(done)
    });

    it('should have access to client directory [4_2]', function(done){
        authSession.get('/clients')
        .expect(200)
        .end(done)
    });

    it('should have access to task directory [4_3]', function(done){
        authSession.get('/tasks')
        .expect(200)
        .end(done)
    });

    it('should log out [4_4]', function(done){
        authSession.get('/logout')
        .expect(302)
        .expect('location', '/')
        .end(done)
    });

    it('should GET task details and comments tied to a task on the calendar [4_5]', function(done){
        authSession.get('/tasks/5cb07423db2c91c92d71e363')
        .expect(200)
        .end(done)
    });

    it('should POST a comment tied to the task [4_6]');

    it('should DELETE own comment tied to the task [4_7]');

    it('should DELETE all comments tied to the task [4_8]');
    
    /* --- Employee Directory --- */
    
    it('should GET the new employee form [4_9]', function(done){
        authSession.get('/employees/new')
        .expect(200)
        .end(done)
    });
    
    it('should create a new employee (POST) [4_10]', function(done){ 
        authSession.post('/employees/new')
        .send({
            firstName: 'Dragana',
            lastName: 'Mirkovic',
            userRole: 'Cleaner',
            username: 'DM',
            password: 'dm',
            postalCode: '1111',
            city: 'Belgrade',
            addressLine: 'Zemun 12',
            phoneNumber: '1234',
            email: 'dm@dm-sat.rs'
         })
        .expect(302)
        .expect('location', '/employees')
        .end(done);
    });

    it('should GET the edit form for the employee [4_11]', function(done){
        authSession.get('/employees/5cd4142e4696097920bd3683/edit')
        .expect(200)
        .end(done)
    });

    it('should update employee info (PUT) [4_12]', function(done){ 
        authSession.put('/employees/5cd4142e4696097920bd3683')
        .send({phoneNumber: '12345678'})
        .expect(302)
        .expect('location', '/employees')
        .end(done);
    });
    
    it('should remove an employee (DELETE) [4_13]', function(done){
        authSession.delete('/employees/5ce4074b2fbd4934d4f92715')
        .expect(302)
        .expect('location', '/employees')
        .end(done);
    });

    /* Client Directory */

    it('should GET the new client form [4_14]', function(done){
        authSession.get('/clients/new')
        .expect(200)
        .end(done)
    });

    it('should create a new client (POST) [4_15]', function(done){ 
        authSession.post('/clients/new')
        .send({
            name: 'Pesho A/S',
            postalCode: '1231',
            city: 'Sofia',
            addressLine: 'Nadejda-4',
            email: 'pesho@mail.bg',
            phoneNumber: '7643'
         })
        .expect(302)
        .expect('location', '/clients')
        .end(done);
    });

    it('should GET the edit form for the client [4_16]', function(done){
        authSession.get('/clients/5cac75020d93cb2b171ac9a5/edit')
        .expect(200)
        .end(done)
    });

    it('should update client info (PUT) [4_17]', function(done){ 
        authSession.put('/clients/5cac75020d93cb2b171ac9a5')
        .send({phoneNumber: '12345678'})
        .expect(302)
        .expect('location', '/clients')
        .end(done);
    });

    it('should remove a client (DELETE) [4_18]', function(done){
        authSession.delete('/clients/5ce3ddcd36490f400cc5c1a6')
        .expect(302)
        .expect('location', '/clients')
        .end(done);
    });

    /* Task Directory */

    it('should GET the new task form [4_19]', function(done){
        authSession.get('/tasks/new')
        .expect(200)
        .end(done)
    });

    it('should create a new task (POST) [4_20]', function(done){ 
        authSession.post('/tasks/new')
        .send({
            name: 'Min NYE opgave',
            postalCode: '5000',
            city: 'Odense',
            addressLine: 'Fisketorvet 1',
            date: '2019-05-10T16:45:00.000+00:00',
            time: '16:45',
            laborHours: '5',
            requiredStaff: '2',
            enrolledStaff: ['5ca71e9d23a215302999a558', '5cacdd33130bf34ce62f48a3'],
            notes: 'bare nogle noter'
         })
        .expect(302)
        .expect('location', '/tasks')
        .end(done);
    });

    it('should GET the edit form for the task [4_21]', function(done){
        authSession.get('/tasks/5cb07423db2c91c92d71e363/edit')
        .expect(200)
        .end(done)
    });

    it('should update task details (PUT) [4_22]', function(done){ 
        authSession.put('/tasks/5cb07423db2c91c92d71e363')
        .send({laborHours: '10'})
        .expect(302)
        .expect('location', '/tasks')
        .end(done);
    });

    it('should remove a task (DELETE) [4_23]', function(done){
        authSession.delete('/tasks/5ce3dde336490f400cc5c1a8')
        .expect(302)
        .expect('location', '/tasks')
        .end(done);
    });

});