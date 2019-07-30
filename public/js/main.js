'use strict'
{
    const target = document.getElementById('target');
    const typed = document.querySelector('#typed');
    const code = document.querySelector('#code');
    const pre = document.querySelector("#pre");
    const cursor = document.querySelector("#cursor");
    const scoreLabel = document.getElementById('score');
    const missLabel = document.getElementById('miss');
    const langLabel = document.getElementById('lang');
    let socket = io.connect();


    let word;
    let loc;
    let score;
    let miss;
    let lang;
    let isPlaying = false;
    let wait = true;
    let audioElem;

    function playKeySound() {
        audioElem = new Audio();
        audioElem.src = "../sound/key.mp3";
        audioElem.play();
    }

    function playMissSound() {
        audioElem = new Audio();
        audioElem.src = "../sound/miss.mp3";
        audioElem.play();
    }

    function playClearSound() {
        audioElem = new Audio();
        audioElem.src = "../sound/clear.mp3";
        audioElem.play();
    }

    function updateTarget() {
        typed.textContent = word.substring(0, loc);
        cursor.textContent = word[loc];
        code.textContent = word.substring(loc+1, word.length);
        playKeySound();
        Prism.highlightAll();
    }

    socket.on('getCode', function(getCode) {
        word = getCode;
    });

    socket.on('getLang', function(getLang) {
        lang = getLang;
        pre.classList.add('language-' + lang);
        code.classList.add('language-' + lang);
    });

    setTimeout(function() {
        target.textContent = 'click to start';
        wait = false;
    }, 3500);

    console.log("ガバガバだけどチートしないでね");

    window.addEventListener('click', () => {

        if ((isPlaying === true) || (wait === true)) {
            return;
        }
        isPlaying = true;
        target.textContent = '';

        loc = 0;
        score = 0;
        miss = 0;
        scoreLabel.textContent = score;
        missLabel.textContent = miss;
        langLabel.textContent = 'lang:' + lang;

        updateTarget();
        
    });
    
    window.addEventListener('keydown', e => {
        if (isPlaying !== true) {
            return;
        }

        // while((word[loc] === '\n') || (word[loc] === ' ') || (word[loc] === '\t')) {
        //             loc++;
        // }
        while((word[loc] === '\n') || (word[loc] === '\t')) {
            loc++;
            updateTarget();
        }
            
        if(e.key === word[loc]){
            loc++;
            if (loc === word.length){
                playClearSound();
                target.textContent = 'clear!';
                code.textContent = '';
                isPlaying = false;
            }
            score++;
            scoreLabel.textContent = score;
            
            updateTarget();
            
        } else {
            if (e.keyCode !==  16) {
                playMissSound();
                miss++;
                missLabel.textContent = miss;
            }
        }

    });

    window.addEventListener('keydown', function(e) {
        if(e.keyCode == 32 && e.target == document.body) {
          e.preventDefault();
        }
      });
    

}