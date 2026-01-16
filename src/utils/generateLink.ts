export function random(len:number){
    let options="qwertyuiowqawdw122341213";
    let length=options.length;
    let link="";

    for(let i=0;i<len;i++){
        link+=options[Math.floor((Math.random()*length))];
    }
    return link;
}