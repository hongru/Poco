/*2013-08-15-hongru*/!function(a){var b=a.Polygon.extend({initialize:function(a){"number"==typeof a.width&&"number"==typeof a.height&&(a.points=[[-.5*a.width,-.5*a.height],[-.5*a.width,.5*a.height],[.5*a.width,.5*a.height],[.5*a.width,-.5*a.height]]),this.supr(a)}});a.Rect=b}(Poco);