import app from './app.js'
import config from './config.js';


function init() {
  // Entry Point of LIFF App
  liff.init(
    {
      liffId: config.liffID
    },
    () => {
        if (!liff.isInClient() && !liff.isLoggedIn()) {
            liff.login({
                redirectUri: "https://koppepan-todo-app.herokuapp.com/"
            })
        }else {
            liff.getProfile().then((profile) => {
                
                app.init(profile)
                console.log(profile)
            })
        }
    },
    err => console.error(err.code, err.message)
    );
}

window.addEventListener("load", init);