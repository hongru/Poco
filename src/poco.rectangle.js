;(function (Poco) {

    var Rectangle = Poco.Polygon.extend({
        initialize: function (opt) {
            if (typeof opt.width == 'number' && typeof opt.height == 'number') {
                opt.points = [[-0.5*opt.width, -0.5*opt.height], [-0.5*opt.width, 0.5*opt.height], [0.5*opt.width, 0.5*opt.height], [0.5*opt.width, -0.5*opt.height]];
            }
            
            this.supr(opt);
        }
    });
    
    Poco.Rect = Rectangle;

})(Poco);