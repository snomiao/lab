function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var NoteG = new Audio("NoteG.mp3");
var NoteC = new Audio("NoteC.mp3");

var 检查时间 = () => {
    var 是工作时间 = (new Date().getMinutes()) % 30 < 25;
    var 状态 = 是工作时间 && "工作时间" || "休息时间";
    return 状态
}
var 边沿监视器 = (初始值 = 0) => {
    var 值 = 初始值
    return (新值) => {
        if (值 != 新值) {
            return 值 = 新值
        }
        return null;
    }
};
var 今天的第几个番茄 = () => (new Date() - new Date(new Date().toDateString())) / 1000 / 60 / 30 | 0
var 提醒现在是工作时间 = async() => {
    await NoteC.play();
    await sleep(500);
    await NoteG.play();
    document.body.innerHTML = "工作时间#" + 今天的第几个番茄()
};

var 提醒现在是休息时间 = async() => {
    await NoteG.play();
    await sleep(500);
    await NoteC.play();
    document.body.innerHTML = "休息时间#" + 今天的第几个番茄()
}

// 提醒现在是工作时间, 提醒现在是休息时间
var 监视状态变化 = 边沿监视器()
var 刷新状态 = async() => {
    try {
        switch (监视状态变化(检查时间())) {
            case "工作时间":
                await 提醒现在是工作时间()
                break;
            case "休息时间":
                await 提醒现在是休息时间()
                break;
            case null:
                //状态未改变
                break
            default:
                throw new Error("错误：未知状态")
        }
    } catch(e){
        监视状态变化 = 边沿监视器()
    }
}
setInterval(刷新状态, 1000);