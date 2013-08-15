// Circle
;(function (Poco) {

    var Circle = Poco.Polygon.extend({
        initialize: function (opt) {
            if (typeof opt.radius == 'number') {
                opt.sCount = opt.sCount || 36;
                
                var points = [];
                for (var i = 0; i < opt.sCount; i ++) {
                    var a = i * Math.PI*2/opt.sCount;
                    points.push([opt.radius*Math.sin(a), opt.radius*Math.cos(a)]);
                }
                
                opt.points = points;
            }
            
            this.supr(opt);
        }
    });
    
    Poco.Circle = Circle;

})(Poco);