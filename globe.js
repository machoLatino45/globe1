"use strict";
class Globe {
    constructor(radius, position, initialRotation, res) {
        this.pos = [...position];
        this.rotation = [...initialRotation];
        this.radius = radius;
        this.rotationVel = [0, 0, 0];
        this.rotationAcc = [0, 0, 0];
        this.res = res;
        this.isRotating = true;
        this.radians = true;
        this.tags = [];
        this.home =  [...initialRotation];
        this.shouldStopAtHome =false;
    }
    perimeter() {
        return this.radius * 2 * Math.PI;
    }
    latVector(lat) {
        if (lat == 0)
            return [0, 0, 0];
        return [Math.sin(lat), 0, Math.cos(lat)];
    }


    stopAtHome(){
        this.shouldStopAtHome = true;
    }

    lonVector(lon) {
        if (lon === 0)
            return [0, 0, 0];
        return [0, Math.sin(lon), Math.cos(lon)];
    }
    surfacePTranslation(lat, lon) {
        let la = lat ? this.latVector(lat) : [0, 0, 0];
        let lo = lon ? this.lonVector(lon) : [0, 0, 0];
        return [(la[0] + lo[0]), (la[1] + lo[1]), la[2] + lo[2]];
    }
    start() {
        this.rotationAcc = [...Globe.NORMAL_ACC];
        this.isRotating = true;
    }
    addTag(tWidth, tHeight, [lat, lon],selImage) {
        let t = new Tag(tWidth, tHeight, [lat, lon], this.pos, this.rotation, 24,selImage);
        this.tags.push(t);
    }
    stop() {
        this.rotationAcc = [...Globe.NORMAL_DESACC];
        this.isRotating = false;
    }
    toggleRotation() {
        if (!this.isRotating)
            this.start();
        else
            this.stop();
    }

    markPoint(lat,lon){
        let t = new Tag(12,13,[lat,lon],this.pos,[...this.rotation],24);
        t.update(this.radius,this.rotation);
        t.render(this.pos);

    }
    limitVel() {
        this.rotationVel = this.rotationVel.map((v, i) => {
            if (v > Globe.MAX_VEL[i]) {
                this.rotationAcc[i] = 0;
                return Globe.MAX_VEL[i];
            }
            else if (v < Globe.MIN_VEL[i]) {
                this.rotationAcc[i] = 0;
                return Globe.MIN_VEL[i];
            }
            return v;
        });
    }
    //
    update() {
        this.limitVel();
        this.rotationVel = this.rotationVel.map((v, i) => v + this.rotationAcc[i]);
        this.rotation = this.rotation.map((r, i) => r + this.rotationVel[i]);
        this.tags.forEach(t => t.update(this.radius, this.rotation));
        if(this.shouldStopAtHome && this.isAtHome()){
            this.rotationAcc = [0,0,0];
            this.rotationVel = [0,0,0];
            this.shouldStopAtHome = false;
        }
    }

    isAtHome(){
        let tolerance = 0.01;
        let [,ry,] = this.rotation.map(r=>r%(2*PI));
        let [,hy,] = this.home.map(h=>h%(2*PI));
        return ry < hy + tolerance && ry > hy - tolerance;
    }

    selectPrevTag(){
        debugger;
        let s;
        for(let i = 0; i< this.tags.length;i++){
            if(this.tags[i].selected){
                if(i== 0)
                    s = this.tags.length -1;
                else
                    s = i-1;
                this.tags[i].selected = false;
            }
        }
        if(!s){
            this.tags[this.tags.length-1].selected = true;
            return;
        }
        this.tags[s].selected = true;
    }

    selectNextTag(){
        let s;
        for(let i = 0; i< this.tags.length;i++){
            if(this.tags[i].selected){
                if(i== this.tags.length-1)
                    s = 0;
                else
                    s = i+1;
                this.tags[i].selected = false;
            }
        }
        if(!s){
            this.tags[0].selected = true;
            return;
        }
        this.tags[s].selected = true;
    }

    render() {

        push()
        let [rx, ry, rz] = globe.rotation;
        translate(...globe.pos);
        rotateY(ry);
        rotateX(rx);
        rotateZ(rz);
        texture(img);
        noStroke();
        sphere(globe.radius, globe.res, globe.res);
        pop();
        globe.tags.forEach(t => t.render(this.pos));
    }
}
Globe.MAX_VEL = [0.03, 0.01, 0.1];
Globe.MIN_VEL = [0, 0, 0];
Globe.NORMAL_ACC = [0, 1e-4, 0];
Globe.NORMAL_DESACC = [0, -3e-4, 0];

