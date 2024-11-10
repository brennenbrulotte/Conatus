import RenderLib from "../../RenderLib"
import FontLib from "../../FontLib"

const JFrame = Java.type('javax.swing.JFrame');
const JTextArea = Java.type('javax.swing.JTextArea');
const JScrollPane = Java.type('javax.swing.JScrollPane');
const Color = Java.type('java.awt.Color');
const Font = Java.type('java.awt.Font');
const BorderLayout = Java.type('java.awt.BorderLayout');

let consoles = [];
let registers = []
let commandRegisters = []
let keys = []

function registerOverride(type, func, command = false) {
    let reg = register(type, func)
    command ? commandRegisters.push(reg) : registers.push(reg)
    return reg
}

function keybindOverride(desc, ssss, category) {
    let key = new KeyBind(desc, ssss, category)
    keys.push(key)
    return key
}

function unload() {
    registers.forEach(reg => {
        reg.unregister()
        reg = null
    })

    keys.forEach(keyBind => {
        KeyBind.removeKeyBind(keyBind)
        keyBind = null
    })

    commandRegisters.forEach(reg => {
        reg.unregister()
        reg.setCommandName('')
        reg = null
    })
    
    for(let key in global) {
        if(key.startsWith('brennen')) global[key] = null
    }
}

global['brennenRegister'] = registerOverride

class Notification {
    constructor() {
        this.x = Renderer.screen.getWidth();
        this.y = Renderer.screen.getHeight();

        ChatLib.chat((this.x*Renderer.screen.getScale())/80)
        ChatLib.chat((this.x*Renderer.screen.getScale())/160)
        this.font = new FontLib("Brennen/BrennenFont.ttf", (this.x*Renderer.screen.getScale())/80)
        this.belowFont = new FontLib("Brennen/BrennenFont.ttf", (this.x*Renderer.screen.getScale())/160)

        this.colors = { back: Renderer.color(56, 56, 56, 255), border: Renderer.color(25, 25, 25, 255), text: new Color(1, 1, 1, 1) }
        this.noti = { x: this.x - this.x/5 - 5, y: this.y - this.y/7 - 5, w: this.x/5, h: this.y/7 }

        this.notif = false;

        brennenRegister('renderOverlay', () => {
            if(!this.notif) return;
            this.notif();
        })

        brennenRegister("step", () => {
            this.x = Renderer.screen.getWidth();
            this.y = Renderer.screen.getHeight();
    
            this.noti = { 
                x: this.x - this.x/5 - 5, 
                y: this.y - this.y/7 - 5,
                w: this.x/5,
                h: this.y/7
            }
        }).setFps(0.5)
    }

    push(title, desc, time = 1500) {
        this.colors = { back: Renderer.color(56, 56, 56, 255), border: Renderer.color(25, 25, 25, 255) }
        new Thread(() => {
            for(let i = 0; i < 255; i++) {
                if(i >= 254) {
                    this.easeOut()
                    Thread.currentThread().interrupt();
                } else {
                    this.colors = { 
                        back: Renderer.color(56, 56, 56, 255), 
                        border: Renderer.color(25, 25, 25, 255), 
                        text: new Color(1, 1, 1, 1)
                    };
    
                    this.notif = () => {
                        Renderer.drawRect(this.colors.back, this.noti.x, this.noti.y, this.noti.w, this.noti.h)
                        Renderer.drawRect(this.colors.border, this.noti.x, this.noti.y, this.noti.w, 2.5)
                        Renderer.drawRect(this.colors.border, this.noti.x, this.noti.y, 2.5, this.noti.h)
                        Renderer.drawRect(this.colors.border, this.noti.x, this.noti.y + this.noti.h - 2.5, this.noti.w, 2.5)
                        Renderer.drawRect(this.colors.border, this.noti.x + this.noti.w, this.noti.y, 2.5, this.noti.h)
                        this.font.drawString(title, this.noti.x + 5, this.noti.y + 5, this.colors.text);
                        this.belowFont.drawString(desc, this.noti.x + 5, this.noti.y + 17.5, this.colors.text);
                        /*new Text(title, this.noti.x + 5, this.noti.y + 5)
                            .setScale(1.2)
                            .setColor(this.colors.text)
                            .draw()

                        new Text(desc, this.noti.x + 5, this.noti.y + 17.5)
                            .setScale(0.6)
                            .setColor(this.colors.text)
                            .draw()*/
                    }

                    try {
                        Thread.sleep(time/255); 
                    } catch(err) {}
                }
            }
        }).start();        
    }

    easeOut() {
        new Thread(() => {
            for(let i = 0; i < 255; i++) {
                if(i==254) {
                    this.notif = false
                    Thread.currentThread().interrupt();
                } else {
                    this.colors = { 
                        back: Renderer.color(56, 56, 56, 255 - i), 
                        border: Renderer.color(25, 25, 25, 255 - i), 
                        text: new Color(1, 1, 1, 1 - (i/255)), 
                    };

                    try {
                       Thread.sleep(1) 
                    } catch(err) {}
                }

            }
        }).start();
    }
}

class Console {
    constructor(moduleName) {
        this.frame = new JFrame(`${moduleName} Console`);
        this.frame.setSize(400, 300);
        this.frame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        this.frame.setLocationRelativeTo(null);

        this.consoleArea = new JTextArea();
        this.consoleArea.setEditable(false);
        this.consoleArea.setBackground(Color.BLACK);
        this.consoleArea.setForeground(Color.GRAY);
        this.consoleArea.setFont(new Font("Brennen/BrennenFont.ttf", Font.PLAIN, 12));

        this.frame.add(new JScrollPane(this.consoleArea), BorderLayout.CENTER);
        consoles.push(this.frame);
    }

    open() {
        this.frame.setVisible(true);
        this.frame.toFront();
        this.frame.requestFocus();
    }

    close() {
        this.frame.setVisible(false);
    }

    send(text) {
        this.consoleArea.append(`${text}\n`);
        this.consoleArea.setCaretPosition(this.consoleArea.getDocument().getLength())
    }
}

brennenRegister('gameUnload', () => {
    consoles.forEach(frame => {
        frame.setVisible(false);
    })
})

function globalListener() {
    if(global['brennenPrefix'] !== "§l§9Conatus => §r§f") return true;
    if(global['brennenRegister'] !== registerOverride) return true;
    if(global['brennenUnload'] !== unload) return true;
    if(global['brennenKeyBind'] !== keybindOverride) return true;
    return false;
}

brennenRegister('step', () => {
    if(globalListener()) unload();
})

class Data {
    static VERTICAL_CHINE = true;
    static BONZO_HORISONTAL_BUFF = true;
}

const cons = new Console("Brennen's Module")

brennenRegister('command', () => {
    cons.open()
}, true).setCommandName("brennenconsole");

// MemLeakFix by me on github
////////////////////////////////////////////////////////////////
const d = new Date();
let ms = d.getMilliseconds();
let lastClear = Date.now();
function isNullVec(e) {
    return e.field_70165_t == 0 && e.field_70163_u == 0 && e.field_70161_v == 0 // posX, posY, posZ
}
function clearBlankStands() {
    const currentEnts = World.getWorld().field_72996_f
    currentEnts.forEach(e => {
        if(e instanceof Java.type("net.minecraft.entity.item.EntityArmorStand")) {
            if(e.func_145818_k_()) return; 
            if(e.field_70173_aa < 1200) return; 
            if(e.field_145783_c == undefined) return; 
            World.getWorld().func_73028_b(e.field_145783_c) 
        }
    })
}
brennenRegister("tick", () => { 
    if(ms - lastClear >= 30000) {
        const ents = World.getAllEntitiesOfType(Java.type("net.minecraft.client.entity.EntityOtherPlayerMP"))
        ents.forEach(e => {
            if(e.field_70128_L) {
                ents.remove(e)
            }
            if(isNullVec(e)) {
                if(e.field_145783_c == undefined) return; // this sometimes happens and sometimes doesnt idk why but :shrug:
                World.getWorld().func_73028_b(e.field_145783_c) // func_73028_b = removeEntityFromWorld || field_145783_c = entityId
            }
        })
        lastClear = Date.now().getMilliseconds()
    }
    clearBlankStands()
})
////////////////////////////////////////////////////////////////
class Rotations {
    radToDeg(rad) {
        return rad*(180/Math.PI);
    };

    wrap180(angle) {
        return (angle-Math.floor(angle/360+0.5)*360);
    }

    getAngles(x, y, z) {
        let yaw;
        let pitch;
        let currYaw = Player.getPlayer().field_70177_z;
        let currPitch = Player.getPlayer().field_70125_A
        let dX = Player.getX() - x;
        let dY = Player.getY() - y;
        let dZ = Player.getZ() - z;
        let dist = Math.sqrt((dX * dX) + (dZ * dZ));
        let azimuth = this.radToDeg(Math.atan(dZ/dX));

        if(dX < 0.0 && dZ < 0.0 || dZ > 0.0 && dX < 0.0) {
            yaw = azimuth + 180; 
        } else if(dX > 0.0 && dZ < 0.0) {
            yaw = azimuth + 360;
        } else if(dX > 0.0 && dZ > 0.0) {
            yaw = azimuth;
        }

        yaw = yaw - currYaw + 90;
        if(yaw > 180) yaw -= 360;
        if(yaw < -180) yaw += 360;

        pitch = this.radToDeg(Math.atan(dY/dist))-currPitch;

        return { yaw: yaw, pitch: pitch }
    }

    getVector(yaw, pitch) {
        let vector = Player.getPlayer().func_174824_e(1).func_178787_e(new net.minecraft.util.Vec3(
            Math.sin(-yaw * (Math.PI/180) - Math.PI) * -Math.cos(-pitch * (Math.PI/180)),
            Math.sin(-pitch * (Math.PI/180)),
            Math.cos(-yaw * (Math.PI/180) - Math.PI) * -Math.cos(-pitch * (Math.PI/180)),
        ));

        return { x: vector.field_72450_a, y: vector.field_72448_b, z: vector.field_72449_c }
    }

    easeOutQuad(t) {
        return t === 0 ? 0 : t === 1 ? 1
            : ((t -= 1) * t * ((1.70158 + 1) * t + 1.70158) + 1);
    }

    working = false;

    isWorking(){
        return this.working;
    }

    lookAt(targetYaw, targetPitch) {
        new Thread(() => {
            working = true;
            for (let i = 0; i < 2500; i++) {
                let progress = this.easeOutQuad(i / 2500);
                let newYaw = (((targetYaw - Client.getMinecraft().field_71439_g.field_70177_z) * progress) + (Math.random()>0.5 ? -(Math.random()/5) : (Math.random()/5)))*0.99999;
                let newPitch = (((targetPitch - Client.getMinecraft().field_71439_g.field_70125_A) * progress) + (Math.random()>0.5 ? -(Math.random()/5) : (Math.random()/5)))*0.99999;
                Client.getMinecraft().field_71439_g.field_70177_z += newYaw
                Client.getMinecraft().field_71439_g.field_70125_A += newPitch
                if(
                    Math.round(Client.getMinecraft().field_71439_g.field_70177_z) == targetYaw || Math.round(Client.getMinecraft().field_71439_g.field_70125_A) == targetPitch || 
                    Math.floor(Client.getMinecraft().field_71439_g.field_70177_z) == targetYaw || Math.floor(Client.getMinecraft().field_71439_g.field_70125_A) == targetPitch
                ) {
                    working = false;
                    Thread.currentThread().interrupt();
                }
                try{ Thread.sleep(3+(Math.random()*8)) }catch(e){}
            } 
            working = false;
        }).start();
    }
}

const Sprint = new KeyBind(Client.getMinecraft().field_71474_y.field_151444_V)

brennenRegister("tick", () => {
    Sprint.setState(true);
})

global['javaInt'] = Java.type("java.lang.Integer");
global['S12']  = Java.type("net.minecraft.network.play.server.S12PacketEntityVelocity");
global['brennenNotification'] = new Notification();
global['brennenData'] = new Data();
global['brennenConsole'] = cons
global['brennenPrefix'] = "§l§9Conatus => §r§f"
global['brennenUnload'] = unload
global['brennenKeyBind'] = keybindOverride
global['brennenRotations'] = new Rotations();