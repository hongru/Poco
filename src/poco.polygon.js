//Poco.Polygon
;(function (Poco) {
    
    var Polygon = new Poco.Class({
        initialize: function (opt) {
            var _d = {
                pos: null,
                points: null,
                invMass: null,
                angularVel: 0,
                angle: 0,
                vel: [0, 0]
            };
            
            Poco.mix(this, Poco.mix(_d, (opt || {})));
            this.pos = (typeof this.x == 'number' && typeof this.y == 'number') ? [this.x, this.y] : this.pos;
            
            this.matrix          = [0, 0, 0, 0, 0, 0];
            this.matrixNextFrame = [0, 0, 0, 0, 0, 0];
            this.motionBounds    = [0, 0, 0, 0, 0, 0];

            this.normals = [];
            this.vCount = this.points.length;
            
            for (var i = 0; i < this.vCount; i++ ) {
                var a = this.points[i];
                var b = this.points[(i + 1) % this.vCount];
                var x = b[0] - a[0];
                var y = b[1] - a[1];
                var len = Math.sqrt(x * x + y * y);
                this.normals[i] = [-y / len, x / len];
            }
            
            // world points
            this.worldSpaceNormals = [];
            this.worldSpacePoints  = [];
            for (var i = 0; i < this.vCount; i++ ) {
                this.worldSpaceNormals[i] = [0, 0];
                this.worldSpacePoints[i]  = [0, 0];
            }
            
            if (this.invMass == null) this.invMass = this.area();
            // calculate inverse inertia tensor
            this.invI = (this.invMass > 0) ? 1 / ((1 / this.invMass) * this.area() / 6) : 0;

            // contact points
            this.c1 = [0, 0];
            this.c0 = [0, 0];
            
            this.type = this instanceof Poco.Circle ? 'circle' : this instanceof Poco.Rect ? 'rect' : 'polygon';
            
        },
        featurePairJudgement : function (that, fpc) {
            var closest, closestI, closestD, wsN, v, d, dx, dy, lsp, wsp, mfp0, mfp1, dist, centreDist;
            for (var edge = 0; edge < this.vCount; edge++) {
                // get support vertices
                wsN = this.worldSpaceNormals[edge];
                // rotate into rectangle space
                dx = -wsN[0];
                dy = -wsN[1];
                v = [
                    dx * that.matrix[0] + dy * that.matrix[1],
                    dx * that.matrix[2] + dy * that.matrix[3]
                ];
                // get axis bits
                closestI = -1;
                closestD = -1E6;
                // first support
                for (var i = 0; i < that.vCount; i++) {
                    lsp = that.points[i];
                    d = v[0] * lsp[0] + v[1] * lsp[1];
                    if (d > closestD) {
                        closestD = d;
                        closestI = i;
                    }
                }
                // form point on plane of minkowski face
                closest = that.worldSpacePoints[closestI];
                wsp = this.worldSpacePoints[edge];
                mfp0 = [closest[0] - wsp[0], closest[1] - wsp[1]]; 			
                wsp = this.worldSpacePoints[(edge + 1) % this.vCount];
                mfp1 = [closest[0] - wsp[0], closest[1] - wsp[1]];
                // distance from origin to face	
                dist = mfp0[0] * wsN[0] + mfp0[1] * wsN[1];
                // distance to centre
                dx = closest[0] - this.pos[0];
                dx = closest[1] - this.pos[1];
                centreDist = dx * dx + dy * dy;;
                if (dist > 0) {
                    // recompute distance to clamped edge
                    this.projectPointOntoEdge([0, 0], mfp0, mfp1, 0);
                    // recompute distance
                    dist = this.c0[0] * this.c0[0] + this.c0[1] * this.c0[1];
                    if (dist < this.world.mostSeparated[0]) {
                        this.world.mostSeparated = [dist, closestI, edge, fpc, centreDist];
                    } else if (dist == this.world.mostSeparated[0] && fpc == this.world.mostSeparated[3]) {
                        // got to pick the right one - pick one closest to centre of A
                        if (centreDist < this.world.mostSeparated[4]) {
                            this.world.mostSeparated = [dist, closestI, edge, fpc, centreDist];
                        }
                    }

                } else {
                    // penetration
                    if (dist > this.world.mostPenetrating[0]) {
                        this.world.mostPenetrating = [dist, closestI, edge, fpc, centreDist];
                    } else if (dist == this.world.mostPenetrating[0] && fpc == this.world.mostPenetrating[3]) {
                        // got to pick the right one - pick one closest to centre of A
                        if (centreDist < this.world.mostPenetrating[4]) {
                            this.world.mostPenetrating = [dist, closestI, edge, fpc, centreDist];
                        }
                    }
                }
            }
        },
        projectPointOntoEdge : function (p, e0, e1, i) {
            var v = [ p[0] - e0[0],  p[1] - e0[1]];
            var e = [e1[0] - e0[0], e1[1] - e0[1]];
            // time along edge
            var t = (e[0] * v[0] + e[1] * v[1]) / (e[0] * e[0] + e[1] * e[1]);
            // clamp to edge bounds
            if (t > 1) t = 1;
            if (t < 0) t = 0;
            // form point
            if (i) this.c1 = [e0[0] + e[0] * t, e0[1] + e[1] * t];
            else   this.c0 = [e0[0] + e[0] * t, e0[1] + e[1] * t];
        },
        area: function () {
            var cross = function (posA, posB, posC) {
                return (posB[0] - posA[0]) * (posC[1] - posA[1]) - (posB[1] - posA[1]) * (posC[0] - posA[0]);
            };
            
            var result = 0, temp = [0, 0];
            for (var i = 0; i < this.vCount-1; i ++) {
                result += cross(temp, this.points[i], this.points[i + 1]);
            }
            result += cross(temp, this.points[this.vCount - 1], this.points[0]);
            
            return Math.abs(result/2);
        }
    });
    
    Poco.Polygon = Polygon;
    
})(Poco);