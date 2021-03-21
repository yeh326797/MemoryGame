var blockdata = [
    {selector: ".block1", name: "1", pitch: "1"},
    {selector: ".block2", name: "2", pitch: "2"},
    {selector: ".block3", name: "3", pitch: "3"},
    {selector: ".block4", name: "4", pitch: "4"}    
]

var soundsetdata = [
    {name: "correct", sets: [1,3,5,8] },
    {name: "wrong", sets: [2,4,5.5,7] }
]

var levelDatas = [
    "12",
    "1324",
    "33324",
    "231234",
    "41233412",
    "41323134132",
    "2342341231231423414232"
]

//--------------------------------
//          方塊物件
//--------------------------------
var Blocks = function(blockAssign, setAssign){
    this.allon = false
    this.blocks= blockAssign.map((d,i)=>({
        name: d.name,
        el: $(d.selector),
        audio: this.getAudioObject(d.pitch)
    }))
    this.soundSets = setAssign.map((d,i)=>({
        name: d.name,
        sets: d.sets.map((pitch)=>this.getAudioObject(pitch))
    }))
    
}
//閃爍單一方塊＋聲音(方塊名)
Blocks.prototype.flash = function(note){
    let block = this.blocks.find(d=>d.name==note)
    if (block){
        block.audio.currentTime = 0
        block.audio.play()
        block.el.addClass("active")
        setTimeout(()=>{
            if (this.allon==false){
                block.el.removeClass("active")
            }
        },100)
    }
}
//點亮所有方塊
Blocks.prototype.turnAllOn = function(){
    this.allon = true
    this.blocks.forEach((block)=>{
        block.el.addClass("active")
    })
}
//關掉所有方塊
Blocks.prototype.turnAllOff = function(){
    this.allon = false
    this.blocks.forEach((block)=>{
        block.el.removeClass("active")
    })
}
//取得聲音物件
Blocks.prototype.getAudioObject = function(pitch){
    return new Audio("https://awiclass.monoame.com/pianosound/set/"+ pitch+".wav")
}
//播放序列聲音（成功/失敗...）
Blocks.prototype.playSet = function(type){
    let sets = this.soundSets.find( set => set.name==type).sets
    sets.forEach((obj)=>{
        obj.currentTime = 0
        obj.play()
    })
}

//--------------------------------
//          遊戲物件
//--------------------------------

var Game = function(){
    this.blocks = new Blocks(blockdata,soundsetdata)
    this.levels = levelDatas
    this.currentLevel = 0
    this.playInterval = 400
    this.mode = "wating"
}
//開始關卡
Game.prototype.startLevel = function(){
    this.showMessage("Level " + this.currentLevel)
    let leveldata = this.levels[this.currentLevel]
    this.startGame(leveldata)
    $("#startbutton").text("Play again")

}
//顯示訊息
Game.prototype.showMessage = function(mes){
    $('.status').text(mes)
}
//開始遊戲(答案)
Game.prototype.startGame = function(answer){
    this.mode = "gamePlay"
    this.answer = answer
    let notes = this.answer.split("")
    this.showStatus("")
    this.timer = setInterval(()=>{
        let char = notes.shift()
        this.playNote(char)
        if (!notes.length){
            this.startUserInput()
            clearInterval(this.timer)
        }
    },this.playInterval)
}
//播放音符
Game.prototype.playNote = function(note){
    this.blocks.flash(note)
}
//開始輸入模式
Game.prototype.startUserInput = function(){
    this.userInput = ""
    this.mode = "userInput"
}
//使用者輸入
Game.prototype.userSendInput = function(inputChar){
    if (this.mode=="userInput"){
        let tempString = this.userInput + inputChar
        this.playNote(inputChar)
        this.showStatus(tempString)
        if(this.answer.indexOf(tempString)==0){
            if(this.answer==tempString){
                this.showMessage("correct")
                this.currentLevel+=1
                this.mode="waiting"
                setTimeout(()=>{
                    this.startLevel()
                },1000)
            }
             this.userInput += inputChar
        }else{
            this.showMessage("wrong")
            // this.currentLevel=0
            this.mode="waiting"
            $("#startbutton").text("Try again")
            // setTimeout(()=>{
            //     this.startLevel()
            // },1000)
        }
    }
}
//顯示回答狀態
Game.prototype.showStatus = function(tempString){
    $(".inputStatus").html("")
    this.answer.split("").forEach((d,i)=>{
        var circle = $("<div class='circle'></div>")
        if(i<tempString.length){
            circle.addClass("correct")
        }
        $(".inputStatus").append(circle)
        if (tempString==""){
            this.blocks.turnAllOff()
        }
    })
    if (tempString == this.answer){
        $(".inputStatus").addClass("correct")
        setTimeout(()=>{
            this.blocks.turnAllOn()
            this.blocks.playSet("correct")
        },500)
    }else{
        $(".inputStatus").removeClass("correct")
    }
    if (this.answer.indexOf(tempString)!=0){
        $(".inputStatus").addClass("wrong")
        setTimeout(()=>{
            this.blocks.turnAllOn()
            this.blocks.playSet("wrong")
        },500)
    }else{
        $(".inputStatus").removeClass("wrong")
    }
}
var game = new Game()
