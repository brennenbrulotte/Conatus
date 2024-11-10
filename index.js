const JSLoader = Java.type('com.chattriggers.ctjs.engine.langs.js.JSLoader')
const SCMSP = Java.type('org.mozilla.javascript.commonjs.module.provider.StrongCachingModuleScriptProvider')
const UMSP = Java.type('org.mozilla.javascript.commonjs.module.provider.UrlModuleSourceProvider')

let CTRequire = new JSLoader.CTRequire(new SCMSP(new UMSP(null, null)));

CTRequire('./utils/util.js')
CTRequire('./features/velocityModifiers.js')
CTRequire('./features/FossilMacro.js')

brennenRegister('command', () => {
    brennenUnload();
}, true).setName('unloadconatus')

// §8[§7Lv55§8] §cZealot§r §e0§f/§a13,000§c❤
// save for later ^^