<style>
input{
    width: 6em;
    height:2em;
    background: #EEFFEEAA;
    border: none
}
input[readonly]{
    background: #FFEFEF;
}
</style>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous" />
<script src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous" defer></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/contrib/auto-render.min.js"></script>
<script defer>
window.addEventListener("load",()=>
  renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
    ],
  }))
</script>

# 雪星的金融数学计算器

使用方法：
在某个绿色框框里输入，输入完成后按下回车，就会自动计算出其它所有框框的值。

## 一、利息的各种度量工具
  
<div class=msg></div>

$(0)$ <input class="n" value=12>
<span>$\displaystyle =n=m $</span>
（每年计息次数、贴现次数） 

$(1)$ <input class="d" value=0.07407407407407407>
<span>$\displaystyle =d=\frac{i}{1+i}=i \cdot v=1-\left(1-\frac{d^{(n)}}{n}\right)^{n}$</span>
（贴现率） 

$(2)$ <input class="i">
<span>$\displaystyle =i=\frac{d}{1-d}=\left(1+\frac{i^{(m)}}{m}\right)^{m}-1=\mathrm{e}^{\delta}-1$</span>
（利率） 

$(3)$ <input class="v">
<span>$\displaystyle =v=1-d $</span>
（贴现系数） 

$(4)$ <input class="id" readonly>
<span>$\displaystyle =i-d=i d $</span>
（利率和贴现率的差） 

$(5)$ <input class="im">
<span>$\displaystyle =i^{(m)}=m\left[(1+i)^{1 / m}-1\right] $</span>
（名义利率） 

$(6)$ <input class="dn">
<span>$\displaystyle =d^{(n)}=n\left[1-(1-d)^{1 / n}\right]=n\left(1-v^{1 / n}\right) $</span>
（名义贴现率） 

$(7)$ <input class="ii" readonly>
<span>$\displaystyle =\left[1+\frac{i^{(m)}}{m}\right]^{m}=\left(1-\frac{d^{(n)}}{n}\right)^{-n} $</span>
（利率和名义贴现率的关系） 

$(8)$ <input class="delta">
<span>$\displaystyle =\delta=\ln (1+i)$</span>
（利息力） 



## 二、等额年金


<table>
<thead>
<tr><th>期末付年金</th><th>现值 or 价格</th><th>终值 or 累积值</th><th>永续年金的价格</th></tr>
</thead>
<tbody>
<tr>
<td>每年支付 1 次</td>
<td>
<input class="ani" readonly>   <br>
$\displaystyle =a_{n|i}=\frac{1-v^n}{i} $
</td>
<td>
<input class="sni" readonly>   <br>
$\displaystyle =s_{n|i}=\frac{(1+i)^n-1}{i} $
</td>
<td>
<input class="ainf" readonly>  <br>
$\displaystyle =a_{\infty|i}=\frac{1}{i} $
</td>
</tr>
<tr>
<td>每年支付 m 次</td>
<td>
<input class="anim" readonly>  <br>
$\displaystyle =a_{n|i}^{(m)}=\frac{1-v^n}{i^{(m)}} $
</td>
<td>
<input class="snim" readonly>  <br>
$\displaystyle =s_{n|i}^{(m)}=\frac{(1+i)^n-1}{i^{(m)}} $
</td>
<td>
<input class="ainfm" readonly> <br>
$\displaystyle =a_{\infty|i}^{(m)}=\frac{1}{i^{(m)}} $
</td>
</tr>
<tr>
<td>连续支付</td>
<td>
<input class="bani" readonly>  <br>
$\displaystyle =\bar a_{n|i}=\frac{1-v^n}{\delta} $
</td>
<td>
<input class="bsni" readonly>  <br>
$\displaystyle =\bar s_{n|i}=\frac{(1+i)^n-1}{\delta} $
</td>
<td>
<input class="bainf" readonly> <br>
$\displaystyle =\bar a_{\infty|i}=\frac{1}{\delta} $
</td>
</tr>
</tbody>
</table>



## 三、变额年金

TODO：挖坑坐等催更，如果你看到了这句话。可以给 snomiao@gmail.com 发个邮件催更（笑

<script>
window.$= (...sel) => document.querySelector(...sel)
</script>


<script defer>

var calc_lixi = ({d})=>{
    var n = parseFloat($("input.n").value);
    var m = n;
    // assume m is known
    // assume d is known
    // var d = i/(1+i)
    var i = d / (1-d)
    var v = 1 - d
    var id = i - d
    var im = m * ((1+i)**(1/m)-1)
    var dn = n * (1-v**(1/n))
    var ii = d / (1-d)
    var delta = Math.log(1 + i)

    var ani  = (1-v**n)/i
    var sni  = ((1+i)**n-1)/i
    var ainf = 1/i
    var anim =  (1-v**n)/im
    var snim =  ((1+i)**n-1)/im
    var ainfm = 1/im
    var bani =  (1-v**n)/delta
    var bsni =  ((1+i)**n-1)/delta
    var bainf = 1/delta

    window.d = d
    window.i = i
    window.v = v
    window.id = id
    window.im = im
    window.dn = dn
    window.ii = ii
    window.delta = delta

    $('input.d').value = d
    $('input.i').value = i
    $('input.v').value = v
    $('input.id').value = id
    $('input.im').value = im
    $('input.dn').value = dn
    $('input.ii').value = ii
    $('input.delta').value = delta
    $('input.ani').value = ani
    $('input.sni').value = sni
    $('input.ainf').value = ainf
    $('input.anim').value = anim
    $('input.snim').value = snim
    $('input.ainfm').value = ainfm
    $('input.bani').value = bani
    $('input.bsni').value = bsni
    $('input.bainf').value = bainf
}
calc_lixi({d:parseFloat($("input.d").value)});
//
$("input.n").addEventListener('change',(e)=>{
    var n = parseFloat(e.target.value);
    calc_lixi({d:$("input.d").value})
    })
$("input.d").addEventListener('change',(e)=>{
    var d = parseFloat(e.target.value);
    var d = d
    calc_lixi({d})
    })
$("input.i").addEventListener('change',(e)=>{
    var i = parseFloat(e.target.value);
    $(".msg").textContent += i + '\n'
    var d = i / (1 + i);
    $(".msg").textContent += d + '\n'
    $(".msg").textContent += d + '\n'
    calc_lixi({d})
    })
$("input.v").addEventListener('change',(e)=>{
    var v = parseFloat(e.target.value);
    var d = 1 - v
    calc_lixi({d})
    })
$("input.im").addEventListener('change',(e)=>{
    var im = parseFloat(e.target.value);
    var n = $("input.n").value;
    var m = n;
    var i = (im / m + 1) ** m - 1
    var d = i / (1+i)
    calc_lixi({d})
    })
$("input.dn").addEventListener('change',(e)=>{
    var dn= parseFloat(e.target.value);
    var n = $("input.n").value;
    var d = -( (- ( dn / n - 1))**n - 1 )
    calc_lixi({d})
    })
$("input.delta").addEventListener('change',(e)=>{
    var delta= parseFloat(e.target.value);
    var i = Math.exp(delta) - 1
    var d = i/(1+i)
    calc_lixi({d})
    })
</script>
