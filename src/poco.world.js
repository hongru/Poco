//Poco.World
;(function (Poco) {
    
    var World = Poco.Class(function (opt) {
        var _d = {
            numIterations: 10,
            kTimeStep: 1/60,
            kGravity: 25,
            kFriction: 0.3
        };
        
        Poco.mix(this, Poco.mix(_d, (opt || {})));
        
        this.objects = [];
        this.contactsI = 0;
        this.contacts = [];
        this.mostSeparated = [0, 0, 0, 0, 0];
		this.mostPenetrating = [0, 0, 0, 0, 0];
        
    }).methods({
        addObject: function (o) {
            if (!o instanceof Poco.Polygon) console && console.warn('Not intance of Poco.Polygon');
            o.world = this;
            this.objects.push(o);
        },
        step: function () {
            this.collide();
            this.solve();
            this.integrate();
            this.generateMotionAABB();
        },
        collide: function () {
            var face, vertex, fp, vertexRect, faceRect, wsN, worldV0, worldV1, wsV0, wsV1, va, vb, vc, na, nc, len, f;
            this.contactsI = 0;
            
            var objects = this.objects;
            for (var i = 0, l = objects.length; i < l - 1; i++) {
                var A = objects[i];
                for (var j = i + 1; j < l; j++) {
                    var B = objects[j];
                    if (A.invMass != 0 || B.invMass != 0) {
                        var AMB = A.motionBounds, BMB = B.motionBounds;
                        if (
                            Math.abs(BMB[0] - AMB[0]) - (AMB[2] + BMB[2]) < 0 &&
                            Math.abs(BMB[1] - AMB[1]) - (AMB[3] + BMB[3]) < 0
                        ) {
                            // generate contacts for this pair
                            this.mostSeparated = [1E9, -1, -1, 0, 1E9];
                            this.mostPenetrating = [-1E9, -1, -1, 0, 1E9];
                            // face of A, vertices of B
                            A.featurePairJudgement(B, 2);
                            // faces of B, vertices of A
                            B.featurePairJudgement(A, 1);
                            if (this.mostSeparated[0] > 0 && this.mostSeparated[3] != 0) {
                                // objects are separated
                                face = this.mostSeparated[2];
                                vertex = this.mostSeparated[1];
                                fp = this.mostSeparated[3];
                            } else if (this.mostPenetrating[0] <= 0) {
                                // objects are penetrating
                                face = this.mostPenetrating[2];
                                vertex = this.mostPenetrating[1];
                                fp = this.mostPenetrating[3];
                            }
                            if (fp == 1) {
                                vertexRect = A;
                                faceRect = B;
                            } else {
                                vertexRect = B;
                                faceRect = A;
                            }
                            // world space vertex
                            f = faceRect.worldSpaceNormals[face];
                            wsN = [f[0], f[1]];
                            // other vertex adjcent which makes most parallel normal with the collision normal
                            va = vertexRect.worldSpacePoints[(vertex - 1 + vertexRect.vCount) % vertexRect.vCount];
                            vb = vertexRect.worldSpacePoints[vertex];
                            vc = vertexRect.worldSpacePoints[(vertex + 1) % vertexRect.vCount];
                            na = [-(vb[1] - va[1]), vb[0] - va[0]];
                            len = Math.sqrt(na[0] * na[0] + na[1] * na[1]);
                            na[0] /= len; 
                            na[1] /= len;
                            nc = [-(vc[1] - vb[1]), vc[0] - vb[0]];
                            len = Math.sqrt(nc[0] * nc[0] + nc[1] * nc[1]);
                            nc[0] /= len;
                            nc[1] /= len;
                            if (na[0] * wsN[0] + na[1] * wsN[1] < nc[0] * wsN[0] + nc[1] * wsN[1]) {
                                worldV0 = va;
                                worldV1 = vb;
                            } else {
                                worldV0 = vb;
                                worldV1 = vc;
                            }
                            // world space edge
                            wsV0 = faceRect.worldSpacePoints[face];
                            wsV1 = faceRect.worldSpacePoints[(face + 1) % faceRect.vCount];
                            // form contact
                            if (fp === 1) {
                                // project vertex onto edge
                                A.projectPointOntoEdge(wsV0, worldV0, worldV1, 0);
                                A.projectPointOntoEdge(wsV1, worldV0, worldV1, 1);
                                B.projectPointOntoEdge(worldV1, wsV0, wsV1,    0);
                                B.projectPointOntoEdge(worldV0, wsV0, wsV1,    1);
                                wsN[0] = -wsN[0];
                                wsN[1] = -wsN[1];
                            } else {
                                A.projectPointOntoEdge(worldV1, wsV0, wsV1,    0);
                                A.projectPointOntoEdge(worldV0, wsV0, wsV1,    1);
                                B.projectPointOntoEdge(wsV0, worldV0, worldV1, 0);
                                B.projectPointOntoEdge(wsV1, worldV0, worldV1, 1);
                            }
                            // ---- first contact ----
                            if (!this.contacts[this.contactsI]) this.contacts[this.contactsI] = new Poco.Contact();
                            this.contacts[this.contactsI++].set(A, B, 0, wsN);
                            // ---- second contact ----
                            if (!this.contacts[this.contactsI]) this.contacts[this.contactsI] = new Poco.Contact();
                            this.contacts[this.contactsI++].set(A, B, 1, wsN);
                        }
                    }
                }
            }
        },
        solve: function () {
            for (var j = 0; j < this.numIterations; j++) {
                for (var i = 0; i < this.contactsI; i++) {
                    var con = this.contacts[i], a = con.a, b = con.b, ra = con.ra, rb = con.rb, normal = con.normal;
                    // get all of relative normal velocity
                    var dv = [
                        (b.vel[0] + rb[0] * b.angularVel) - (a.vel[0] + ra[0] * a.angularVel),
                        (b.vel[1] + rb[1] * b.angularVel) - (a.vel[1] + ra[1] * a.angularVel)
                    ];
                    var remove = (dv[0] * normal[0] + dv[1] * normal[1]) + con.dist / this.kTimeStep;
                    if (remove < 0) {
                        var mag = remove * con.invDenom,
                        newImpulse = Math.min(mag + con.impulseN, 0),
                        // apply impulse
                        change = newImpulse - con.impulseN,
                        x = normal[0] * change, y = normal[1] * change;
                        // linear
                        a.vel[0] += (x * a.invMass);
                        a.vel[1] += (y * a.invMass);
                        b.vel[0] -= (x * b.invMass);
                        b.vel[1] -= (y * b.invMass);
                        // angular
                        a.angularVel += (x * ra[0] + y * ra[1]) * a.invI;
                        b.angularVel -= (x * rb[0] + y * rb[1]) * b.invI;
                        con.impulseN = newImpulse;
                        // friction
                        var absMag = Math.abs( con.impulseN ) * this.kFriction;
                        // get tangential velocity
                        var tanV = dv[0] * -normal[1] + dv[1] * normal[0];
                        newImpulse = Math.min( Math.max(tanV * con.invDenomTan + con.impulseT, -absMag), absMag );				
                        // apply impulse
                        var change = newImpulse - con.impulseT;
                        x = -normal[1] * change, y = normal[0] * change;
                        // linear
                        a.vel[0] += (x * a.invMass);
                        a.vel[1] += (y * a.invMass);
                        b.vel[0] -= (x * b.invMass);
                        b.vel[1] -= (y * b.invMass);
                        // angular
                        a.angularVel += (x * ra[0] + y * ra[1]) * a.invI;
                        b.angularVel -= (x * rb[0] + y * rb[1]) * b.invI;
                        con.impulseT = newImpulse;
                    }
                }
            }
        },
        integrate: function () {
            var objects = this.objects,
                kGravity = this.kGravity,
                kTimeStep = this.kTimeStep;
                
            for (var i = 0, rb; rb = objects[i++];) {
                if (rb.drag) {
                    // dragging object
                    rb.vel[0] = (pointer.X - rb.pos[0]) * 10;
                    rb.vel[1] = (pointer.Y - rb.pos[1]) * 10;
                } else {
                    // horizontal stability
                    rb.vel[0] *= 0.98;
                    // gravity
                    if (rb.invMass > 0) rb.vel[1] += kGravity;
                }
                // update position
                rb.pos = [rb.pos[0] + rb.vel[0] * kTimeStep, rb.pos[1] + rb.vel[1] * kTimeStep];
                rb.angle += rb.angularVel * kTimeStep;
                // set transform matrix
                var c = Math.cos(rb.angle), s = Math.sin(rb.angle);
                rb.matrix = [
                     c, s,
                    -s, c,
                     rb.pos[0], rb.pos[1]
                ];
                var angle = rb.angle + rb.angularVel * kTimeStep;
                var c = Math.cos(angle), s = Math.sin(angle);
                rb.matrixNextFrame = [
                     c, s,
                    -s, c,
                     rb.pos[0] + rb.vel[0] * kTimeStep, rb.pos[1] + rb.vel[1] * kTimeStep
                ];
            }
        },
        generateMotionAABB: function () {
            var objects = this.objects;
                
            for (var i = 0, rb; rb = objects[i++];) {
                var x, min = [ 1E6, 1E6], max = [-1E6, -1E6],
                    m0 = rb.matrix, m1 = rb.matrixNextFrame;
                // loop through all points
                for (var j = 0; j < rb.vCount; j++ ) {
                    // transform current frame
                    var lp = rb.points[j], ln = rb.normals[j];
                    for (var u = 0; u < 2; u++) {
                        // matrix transform
                        x = (m0[u] * lp[0]) + (m0[2 + u] * lp[1]) + m0[4 + u];
                        // save world points
                        rb.worldSpacePoints[j][u] = x;
                        // min max
                        if (x < min[u]) min[u] = x;
                        if (x > max[u]) max[u] = x;
                        // next frame
                        x = (m1[u] * lp[0]) + (m1[2 + u] * lp[1]) + m1[4 + u];
                        // min max
                        if (x < min[u]) min[u] = x;
                        if (x > max[u]) max[u] = x;
                        // rotate
                        x = (m0[u] * ln[0]) + (m0[2 + u] * ln[1]);
                        // save world normals
                        rb.worldSpaceNormals[j][u] = x;
                    }
                }
                // save bounding box
                rb.motionBounds = [
                    (min[0] + max[0]) * 0.5, (min[1] + max[1]) * 0.5,
                    (max[0] - min[0]) * 0.5, (max[1] - min[1]) * 0.5
                ];
            }
        }
        
    });
    
    Poco.World = World;

})(Poco);