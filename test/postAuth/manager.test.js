let app = require('../../index');
let session = require('supertest-session');

let testSession = null;


describe.skip('Test with supertest-session/postAuth/manager [TS_3]', function () {
    let authSession;
    beforeEach(function (done) {
        testSession = session(app);
        testSession
        .post('/login')
        .send({ username: 'pjensen', password: 'peter123' })
        .expect(302)
        .expect('Location', '/calendar')
        .end(function (err) {
            if (err) return done(err);
            authSession = testSession;
            return done();
        });
    });

    /* --- Calendar page --- */
    
    it('should have access to employee directory [3_1]', function(done){
        authSession.get('/employees')
        .expect(200)
        .end(done)
    });

    it('should have access to client directory [3_2]', function(done){
        authSession.get('/clients')
        .expect(200)
        .end(done)
    });

    it('should have access to task directory [3_3]', function(done){
        authSession.get('/tasks')
        .expect(200)
        .end(done)
    });

    it('should log out [3_4]', function(done){
        authSession.get('/logout')
        .expect(302)
        .expect('location', '/')
        .end(done)
    });

    it('should GET task details and comments tied to a task on the calendar [3_5]', function(done){
        authSession.get('/tasks/5cb07423db2c91c92d71e363')
        .expect(200)
        .end(done)
    });

    it('should POST a comment tied to the task [3_6]', function(done){
        authSession.post('/tasks/5cf4dc754cfcf37e38642e70/comments')
        .send({comment: {text: 'testComment'}})
        .expect(302)
        .expect('location', '/tasks/5cf4dc754cfcf37e38642e70')
        .end(done)
    });

    it('should DELETE own comment tied to the task [3_7]', function(done){
        authSession.delete('/tasks/5cf4dc754cfcf37e38642e70/comments/5cf7bbf8a474b526c82129b7')
        .expect(302)
        .expect('location', '/tasks/5cf4dc754cfcf37e38642e70')
        .end(done)
    });

    it('should DELETE own comment tied to the task [3_8]', function(done){
        authSession.delete('/tasks/5cf4dc754cfcf37e38642e70/comments/5cf7bb39f056994c442964e3')
        .expect(302)
        .expect('location', '/tasks/5cf4dc754cfcf37e38642e70')
        .end(done)
    });
    
    /* --- Employee Directory --- */
    
    it('should NOT get the new employee form [3_9]', function(done){
        authSession.get('/employees/new')
        .expect(302)
        .expect('location', '/employees')
        .end(done)
    });
    
    it('should NOT be able to create a new employee (POST) [3_10]', function(done){ 
        authSession.post('/employees/new')
        .send({
            firstName: 'Marianne',
            lastName: 'Hansen',
            userRole: 'Cleaner',
            username: 'mhansen',
            password: 'adgangskode',
            postalCode: '8700',
            city: 'Horsens',
            addressLine: 'Strandpromenade 15',
            phoneNumber: '11223344',
            email: 'mh@gmail.com'
         })
         .expect(302)
         .expect('location', '/employees')
        .end(done);
    });

    it('should NOT get the edit form for the employee [3_11]', function(done){
        authSession.get('/employees/5cd4142e4696097920bd3683/edit')
        .expect(302)
        .expect('location', '/employees')
        .end(done)
    });

    it('should NOT be able to update employee info (PUT) [3_12]', function(done){ 
        authSession.put('/employees/5cd4142e4696097920bd3683')
        .send({phoneNumber: '12345678'})
        .expect(302)
        .expect('location', '/employees')
        .end(done);
    });
    
    it('should NOT be able to remove an employee (DELETE) [3_13]', function(done){ 
        authSession.delete('/employees/5cd4142e4696097920bd3683')
        .expect(302)
        .expect('location', '/employees')
        .end(done);
    });

    /* Client Directory */

    it('should NOT get the new client form [3_14]', function(done){
        authSession.get('/clients/new')
        .expect(302)
        .expect('location', '/clients')
        .end(done)
    });

    it('should NOT be able to create a new client (POST) [3_15]', function(done){ 
        authSession.post('/clients/new')
        .send({
            name: 'Pesho non-existent LTD',
            postalCode: '1231',
            city: 'Sofia',
            addressLine: 'Nadejda-4',
            email: 'pesho@mail.bg',
            phoneNumber: '76432254'
         })
         .expect(302)
         .expect('location', '/clients')
        .end(done);
    });

    it('should NOT be able to get the edit form for the client [3_16]', function(done){
        authSession.get('/clients/5cac75020d93cb2b171ac9a5/edit')
        .expect(302)
        .expect('location', '/clients')
        .end(done)
    });

    it('should NOT be able to update client info (PUT) [3_17]', function(done){ 
        authSession.put('/clients/5cac75020d93cb2b171ac9a5')
        .send({phoneNumber: '12345678'})
        .expect(302)
        .expect('location', '/clients')
        .end(done);
    });

    it('should NOT be able to remove a client (DELETE) [3_18]', function(done){
        authSession.delete('/clients/5cac75020d93cb2b171ac9a5')
        .expect(302)
        .expect('location', '/clients')
        .end(done);
    });

    /* Task Directory */

    it('should GET the new task form [3_19]', function(done){
        authSession.get('/tasks/new')
        .expect(200)
        .end(done)
    });

    it('should create a new task (POST) [3_20]', function(done){ 
        authSession.post('/tasks/new')
        .send({
            name: 'Min NYE opgave',
            postalCode: '5000',
            city: 'Odense',
            addressLine: 'Fisketorvet 1',
            date: '2019-05-10T10:45:00.000+00:00',
            time: '10:45',
            laborHours: '3',
            requiredStaff: '2',
            enrolledStaff: ['5ca71e9d23a215302999a558', '5cacdd33130bf34ce62f48a3'],
            notes: 'bare nogle noter'
         })
        .expect(302)
        .expect('location', '/tasks')
        .end(done);
    });

    it('should GET the edit form for the task [3_21]', function(done){
        authSession.get('/tasks/5cb07423db2c91c92d71e363/edit')
        .expect(200)
        .end(done)
    });

    it('should update task details (PUT) [3_22]', function(done){ 
        authSession.put('/tasks/5cb07423db2c91c92d71e363')
        .send({laborHours: '10'})
        .expect(302)
        .expect('location', '/tasks')
        .end(done);
    });

    it('should remove a task (DELETE) [3_23]', function(done){
        authSession.delete('/tasks/5ce3ddd036490f400cc5c1a7')
        .expect(302)
        .expect('location', '/tasks')
        .end(done);
    });

    it('should be able to apply for a task [3_24]', function(done){
        authSession.post('/tasks/5cf4dc754cfcf37e38642e70/apply')
        .send({taskId: '5cf4dc754cfcf37e38642e70'})
        .expect(302)
        .expect('location', '/')
        .end(done)
    });

    it('should return 404 with invalid route [3_25]', function(done){
        authSession.get('/invalid/route')
        .expect(404)
        .end(done)
    });

    it('should assign labor hours [3_26]', function(done){
        authSession.post('/tasks/5cf4dc754cfcf37e38642e70/assignLaborHours')
        .send({ '5cf7a27bbecc403e6486b241': '3' })
        .expect(302)
        .expect('location', '/tasks/5cf4dc754cfcf37e38642e70')
        .end(done)
    });

});