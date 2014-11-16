describe("Util check", function() {
    var belt = require('../util')

    it("continue if authenticated", function(done) {
        var req = {
            isAuthenticated: function() {
                return true;
            }
        }
        var res = {
            redirect: function() {}
        }
        belt.ensureAuthenticated(req, res, done)
    })
    //TODO: move these to db spec
   /* it("retrieve all charities", function(done) {
        //wait for mongo to connect
        belt.onDataReady(function() {
            belt.getAllCharities(function(charities) {
                expect(charities.length).toBeGreaterThan(0)
                for (var i = 0; i < charities.length; i++) {
                    expect(charities[i].imageName).toBeDefined()
                    expect(charities[i].name).toBeDefined()
                    expect(charities[i].nameId).toBeDefined()
                    expect(charities[i].website).toBeDefined()
                    expect(charities[i].websiteName).toBeDefined()
                    expect(charities[i].aboutText).toBeDefined()
                }
                done()
            })
        })
    })

    it("retrieve american red cross charity data", function(done) {
        belt.onDataReady(function() {
            belt.getCharity("americanredcross", function(err, charity) {
                expect(charity.imageName).toBeDefined()
                expect(charity.name).toBeDefined()
                expect(charity.nameId).toBeDefined()
                expect(charity.website).toBeDefined()
                expect(charity.aboutText).toBeDefined()
                done()
            })
        })
    })*/

    //TODO: check for specific values set
    it("set template defaults", function(done){
        req={isAuthenticated:function(){return false;}, session:{}}
        res={locals:{}}
        belt.templateDefaults(req, res, done);
    })

    it("check header defaults", function(done){
        res={
            'X-Powered-By':true,
            removeHeader:function(h){this[h]=undefined},
            setHeader:function(h){this[h]=true}
        }
        belt.headerDefaults({}, res, function(){
            expect(res['X-Powered-By']).toBeUndefined()
            expect(res['Cache-Control']).toBe(true)
            expect(res['Expires']).toBe(true)
            done()
        })
    })
})
