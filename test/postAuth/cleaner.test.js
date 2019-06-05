let app = require('../../index');
let session = require('supertest-session');

let testSession = null;


describe.skip('Test with supertest-session/postAuth/cleaner [TS_2]', function () {
    let authSession;
    beforeEach(function (done) {
        testSession = session(app);
        testSession
        .post('/login')
        .send({ username: 'tgerganov', password: 'todor' })
        .expect(302)
        .expect('Location', '/calendar')
        .end(function (err) {
            if (err) return done(err);
            authSession = testSession;
            return done();
        });
    });

    it('should GET a restricted page within privilleges [2_1]', function (done) {
        authSession.get('/calendar')
        .expect(200)
        .end(done)
    });

    it('should NOT get a restricted page outside of privilleges (employee dir) [2_2]', function(done){
        authSession.get('/employees')
        .expect(302)
        .expect('location', '/calendar') 
        .end(done)
    });

    it('should NOT get the new employee form [2_3]', function(done){
        authSession.get('/employees/new')
        .expect(302)
        .expect('location', '/calendar')
        .end(done)
    });
    
    it('should NOT create a new employee (POST) [2_4]', function(done){ 
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
         .expect('location', '/calendar')
        .end(done);
    });

    it('should NOT get the edit form for the employee [2_5]', function(done){
        authSession.get('/employees/5cd4142e4696097920bd3683/edit')
        .expect(302)
        .expect('location', '/calendar')
        .end(done)
    });

    it('should NOT update employee info (PUT) [2_6]', function(done){ 
        authSession.put('/employees/5cd4142e4696097920bd3683')
        .send({phoneNumber: '12345678'})
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });
    
    it('should NOT remove an employee (DELETE) [2_7]', function(done){
        authSession.delete('/employees/5cd4142e4696097920bd3683')
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });

    it('should NOT get a restricted page outside of privilleges (client dir) [2_8]', function(done){
        authSession.get('/clients')
        .expect(302)
        .expect('location', '/calendar')
        .end(done)
    });

    it('should NOT get the new client form [2_9]', function(done){
        authSession.get('/clients/new')
        .expect(302)
        .expect('location', '/calendar')
        .end(done)
    });

    it('should NOT create a new client (POST) [2_10]', function(done){ 
        authSession.post('/clients/new')
        .send({
            name: 'Pesho ApS',
            postalCode: '9000',
            city: 'Varna',
            addressLine: 'Makedonia str. 151',
            email: 'pesho@mail.bg',
            phoneNumber: '76432254'
         })
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });

    it('should NOT get the edit form for the client [2_11]', function(done){
        authSession.get('/clients/5cac75020d93cb2b171ac9a5/edit')
        .expect(302)
        .expect('location', '/calendar')
        .end(done)
    });

    it('should NOT update client info (PUT) [2_12]', function(done){ 
        authSession.put('/clients/5cac75020d93cb2b171ac9a5')
        .send({phoneNumber: '12345678'})
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });

    it('should NOT remove a client (DELETE) [2_13]', function(done){
        authSession.delete('/clients/5cac75020d93cb2b171ac9a5')
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });

    it('should NOT get a restricted page outside of privilleges (tasks dir) [2_14]', function(done){
        authSession.get('/tasks')
        .expect(302)
        .expect('location', '/calendar') 
        .end(done)
    });

    it('should NOT get the new task form [2_15]', function(done){
        authSession.get('/tasks/new')
        .expect(302)
        .expect('location', '/calendar')
        .end(done)
    });

    it('should NOT create a new task (POST) [2_16]', function(done){ 
        authSession.post('/tasks/new')
        .send({
            name: 'Min ikke-eksisterende opgave',
            postalCode: '5000',
            city: 'Odense',
            addressLine: 'Fisketorvet 1',
            date: '2019-05-10T10:45:00.000+00:00',
            time: '10:45',
            laborHours: '3',
            requiredStaff: '2',
            enrolledStaff: ['5ca71e9d23a215302999a558', '5cacdd33130bf34ce62f48a3'],
            notes: 'bare nogle ikke-eksisterende noter'
         })
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });

    it('should NOT get the edit form for the task [2_17]', function(done){
        authSession.get('/tasks/5cb07423db2c91c92d71e363/edit')
        .expect(302)
        .expect('location', '/calendar')
        .end(done)
    });

    it('should NOT update task details (PUT) [2_18]', function(done){ 
        authSession.put('/tasks/5cb07423db2c91c92d71e363')
        .send({laborHours: '10'})
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });

    it('should NOT remove a task (DELETE) [2_19]', function(done){
        authSession.delete('/tasks/5cb07423db2c91c92d71e363')
        .expect(302)
        .expect('location', '/calendar')
        .end(done);
    });

    it('should log out [2_20]', function(done){
        authSession.get('/logout')
        .expect(302)
        .expect('location', '/')
        .end(done)
    });

    it('should GET task details and comments tied to a task on the calendar [2_21]', function(done){
        authSession.get('/tasks/5cb07423db2c91c92d71e363')
        .expect(200)
        .end(done)
    });

    it('should POST a comment tied to the task [2_22]', function(done){
        authSession.post('/tasks/5cf4dc754cfcf37e38642e70/comments')
        .send({comment: {text: 'testComment'}})
        .expect(302)
        .expect('location', '/tasks/5cf4dc754cfcf37e38642e70')
        .end(done)
    });

    it('should DELETE own comment tied to the task [2_23]', function(done){
        authSession.delete('/tasks/5cf4dc754cfcf37e38642e70/comments/5cf7ba387325621bf4fb0af8')
        .expect(302)
        .expect('location', '/tasks/5cf4dc754cfcf37e38642e70')
        .end(done)
    });
    
    it('should be able to apply for a task [2_24]', function(done){
        authSession.post('/tasks/5cf4dc754cfcf37e38642e70/apply')
        .send({taskId: '5cf4dc754cfcf37e38642e70'})
        .expect(302)
        .expect('location', '/')
        .end(done)
    });

    it('should return 404 with invalid route [2_25]', function(done){
        authSession.get('/invalid/route')
        .expect(404)
        .end(done)
    });

});