let motX = S12.class.getDeclaredField("field_149415_b");
let motY = S12.class.getDeclaredField("field_149416_c");
let motZ = S12.class.getDeclaredField("field_149414_d");

motX.setAccessible(true)
motY.setAccessible(true)
motZ.setAccessible(true)

register("packetReceived", (packet) => {
    if(packet.func_149412_c() !== Player.getPlayer().func_145782_y() || !Player.getHeldItem()) return;
    let item = Player?.getHeldItem()?.getName()?.toLowerCase()
    
    if(item.includes("bonzo's") && brennenData.HORIZONTAL_BONZO) {
        motX.set(packet, new javaInt(packet.func_149411_d()*1.14))
        motY.set(packet, new javaInt(packet.func_149410_e()*1))
        motZ.set(packet, new javaInt(packet.func_149409_f()*1.14))

        brennenConsole.send('Set field_149415_b and field_149414_d (motionX and motionZ) to val*1.15')
        brennenNotification.push("Bonzo Booster", "Added 15% Boost", 750)
    } 
    
    if(item.includes("jerry-chine") && brennenData.VERTICAL_CHINE) {
        motX.set(packet, new javaInt(0))
        motY.set(packet, new javaInt(packet.func_149410_e()*1.0))
        motZ.set(packet, new javaInt(0))

        brennenConsole.send('Set field_149415_b and field_149414_d (motionX and motionZ) to 0')
        brennenNotification.push("Vertical Chine", "Removed X/Z Velocity", 750)
    }
}).setFilteredClass(net.minecraft.network.play.server.S12PacketEntityVelocity)