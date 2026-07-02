
class ExpressError extends Error{
    constructor(statuscode,mssg){
        super();
        this.message=mssg;
         this.statusCode=statuscode;
    }
}

module.exports=ExpressError;