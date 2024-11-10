let GameSettings = Client.getMinecraft().field_71474_y

let [ left,right,up,down ] = [ 1, 2, 3, 4 ]
let pattern = [ right, up, left, up ]
let farming = {
    movement: new class {
        leftBind = new KeyBind(GameSettings.field_74370_x)
        rightBind = new KeyBind(GameSettings.field_74366_z)
        upBind = new KeyBind(GameSettings.field_74351_w)
        downBind = new KeyBind(GameSettings.field_74368_y)
    
        setLeftBind(state, stopAll) { if(stopAll) this.stopAll(); this.leftBind.setState(state); }
        setRightBind(state, stopAll) { if(stopAll) this.stopAll(); this.rightBind.setState(state); }
        setUpBind(state, stopAll) { if(stopAll) this.stopAll(); this.upBind.setState(state); }
        setDownBind(state, stopAll) { if(stopAll) this.stopAll(); this.downBind.setState(state); }
        stopAll() {
            this.setLeftBind(false)
            this.setRightBind(false)
            this.setUpBind(false)
            this.setDownBind(false)
        }
    }
};

let cachedData = {
    patternIndex: 0,
    maxPatternIndex: 4
};

let macro = {
    velocity: () => {
        let velo = (Math.abs(Player.getMotionX()) + Math.abs(Player.getMotionZ()))*10
        return velo.toPrecision(21)
    },
    enabled: false,
    start: () => {
        macro.enabled = true;
    },
    checkForRow: () => {
        if(cachedData.maxPatternIndex == (cachedData.patternIndex + 1)) return cachedData.patternIndex = 0;
        else cachedData.patternIndex++;
    },
    tick: () => {
        if(Math.round(macro.velocity()+0.25)==0) {
            macro.checkForRow();
        }

        macro.clickCorrect();
    },
    clickCorrect: () => {
        switch(cachedData.patternIndex) {
            case 1: farming.movement.setRightBind(true, true);
            case 2: farming.movement.setUpBind(true, true);
            case 3: farming.movement.setLeftBind(true, true);
            case 4: farming.movement.setUpBind(true, true);
        }
    }
}

register('tick', macro.tick)