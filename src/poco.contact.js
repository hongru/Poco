//Poco.Contact
;(function (Poco) {

    var Contact = Poco.Class(function () {
        this.a           = {};
		this.b           = {};
		this.normal      = [0, 0];
		this.ra          = [0, 0];
		this.rb          = [0, 0];
		this.dist        = 0;
		this.impulseN    = 0;
		this.impulseT    = 0;
		this.invDenom    = 0;
		this.invDenomTan = 0;
    }).methods({
        set: function (A, B, i, wsN) {
            var pa, pb;
            this.a           = A;
            this.b           = B;
            this.normal      = wsN;
            if (i) {
                pa           = A.c1;
                pb           = B.c1;
            } else {
                pa           = A.c0;
                pb           = B.c0;
            }
            this.dist        = (pb[0] - pa[0]) * wsN[0] + (pb[1] - pa[1]) * wsN[1];
            this.impulseN    = 0;
            this.impulseT    = 0;
            // calculate radius arms
            this.ra          = [-(pa[1] - A.pos[1]), pa[0] - A.pos[0]];
            this.rb          = [-(pb[1] - B.pos[1]), pb[0] - B.pos[0]];
            // compute denominator in impulse equation
            var ran          = this.ra[0] * wsN[0] + this.ra[1] * wsN[1];
            var rbn          = this.rb[0] * wsN[0] + this.rb[1] * wsN[1];
            this.invDenom    = 1 / (A.invMass + B.invMass + (ran * ran * A.invI) + (rbn * rbn * B.invI));
            ran              = this.ra[0] * -wsN[1] + this.ra[1] * wsN[0];
            rbn              = this.rb[0] * -wsN[1] + this.rb[1] * wsN[0];
            this.invDenomTan = 1 / (A.invMass + B.invMass + (ran * ran * A.invI) + (rbn * rbn * B.invI));
        }
    });
    
    Poco.Contact = Contact;

})(Poco);