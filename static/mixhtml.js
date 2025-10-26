const DISPLAY_ERRORS = false
try{
    let mix_replace_url = document.querySelector("[mix-url]")
    if(mix_replace_url){
        mix_replace_url = mix_replace_url.getAttribute("mix-url")
        console.log(mix_replace_url)
        history.replaceState({"mix_page":mix_replace_url}, "title", mix_replace_url)
    }
    else{
        if(DISPLAY_ERRORS){ console.log("Single Page App not possible") }
    }
    // history.replaceState({"mix_page":mix_replace_url}, "title", mix_replace_url)
}catch(error){
    if(DISPLAY_ERRORS){ 
        console.log(error) 
        console.log(`Warning: Single Page App not possible, since mix_replace_url not set`)
    }
}
// ##############################
window.onpopstate = function(event){
    mix_switch_page(event.state.mix_page, false)
}
// ##############################
history.scrollRestoration = "manual"
let ignoreScroll = false
window.addEventListener("popstate", () => {
    ignoreScroll = true
    setTimeout(() => {
        ignoreScroll = false
    }, 100)
})
window.addEventListener("scroll", () => {
    try{
        if (ignoreScroll) return    
        document.querySelector("[mix-on='yes']").setAttribute("mix-y", window.scrollY) 
    }catch(error){
        if(DISPLAY_ERRORS){ console.log(error) }
    }
})
// ##############################
setInterval(async function(){
    try{
        document.querySelectorAll("[mix-ex]").forEach(el=>{
            if(el.getAttribute("mix-ttl")=="0"){
                return
            }
            if( el.getAttribute("mix-on") == "yes" ){
                el.setAttribute("mix-ex", el.getAttribute("mix-ttl"))
                return
            }
            let ex_time = el.getAttribute("mix-ex") - 1000
            if(ex_time <= 0){
                if(el.hasAttribute("mix-url")){
                    el.remove()                    
                }else{
                    el.remove()  
                }
                return
            }
            el.setAttribute("mix-ex", ex_time)
        })
    }catch(error){ 
        if(DISPLAY_ERRORS){ 
            console.error("setInterval for clearing pages", error) 
        }
    }
}, 1000)
// ##############################
function hide_elements(selectors){
    try{
        selectors = selectors.split(',')
        // console.log('selectors', selectors)
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(i=>{                 
                i.classList.add("mix-hidden")
            })
        })
    }catch(error){
        if(DISPLAY_ERRORS){ console.log(error) }
    }
}

// ##############################
function show_elements(selectors){
    try{
        selectors = selectors.split(',')
        // console.log('selectors', selectors)
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(i=>{                 
                i.classList.remove("mix-hidden")
            })
        })
    }catch(error){
        if(DISPLAY_ERRORS){ console.log(error) }
    }
}


// ##############################
function mix_switch_page(mix_page, push_to_history = true){
    try{
        el = document.querySelector(`[mix-url="${mix_page}"]`)
        if( ! el ){
            console.log("mix_switch_page() -> no page")
            console.log("mix_page", mix_page)
            let el_cover = false
            const el = document.querySelector(`[href='${mix_page}']`)
            if( el.hasAttribute("mix-cover")){ 
                el_cover = document.querySelector(el.getAttribute("mix-cover"))
                el_cover.classList.remove("mix-hidden")
            }            
            mix_page += mix_page.includes("?") ? "&mix-page=yes" : "?mix-page=yes"
            mix_fetch(mix_page, "GET", null, false, el_cover, false)
            return
        }
        document.title = el.getAttribute("mix-title")
        if( ! el.getAttribute("mix-y") ){ el.setAttribute("mix-y", "0") }
        
        hide_elements(el.getAttribute("mix-hide"))
        show_elements(el.getAttribute("mix-show"))
        
        document.querySelectorAll("[mix-on]").forEach(i=>{ i.setAttribute("mix-on", "no") })
        el.setAttribute("mix-on", "yes")  
        window.scrollTo(0, el.getAttribute("mix-y"))                
        if( push_to_history ){
            history.pushState({"mix_page":el.getAttribute("mix-url")}, "title", el.getAttribute("mix-url"))
        }
    }catch(error){ 
        if(DISPLAY_ERRORS){ 
            console.error("mix_switch_page()", error) 
        }
    }
}
// ##############################
let timeout = null
function mixhtml(){
    try{
        const el = event.target
        if( el.hasAttribute("mix-page") ){
            const href = el.getAttribute("href")
            const loaded_page = document.querySelector(`[mix-url="${href}"]`)
            if(loaded_page){ 
                if( loaded_page.getAttribute("mix-on") == "yes" ){
                    return
                }             
                mix_switch_page(loaded_page.getAttribute("mix-url"), true)
                return
             }
        }      
        let url = ""
        let method = "GET"
        let form = false
        let el_cover = false
        if( el.hasAttribute("mix-get") ){ url = el.getAttribute("mix-get"); method = "GET" }
        if( el.hasAttribute("mix-post") ){ url = el.getAttribute("mix-post"); method = "POST" }
        if( el.hasAttribute("mix-patch") ){ url = el.getAttribute("mix-patch"); method = "PATCH" }
        if( el.hasAttribute("mix-put") ){ url = el.getAttribute("mix-put"); method = "PUT" }
        if( el.hasAttribute("mix-delete") ){ url = el.getAttribute("mix-delete"); method = "DELETE" }
        if( el.hasAttribute("mix-cover")){ 
            el_cover = document.querySelector(el.getAttribute("mix-cover"))
            el_cover.classList.remove("mix-hidden")
        }
        if( el.hasAttribute("href") && url == "" ){ url = el.getAttribute("href") }
        if(el.tagName === "FORM"){
            if( el.hasAttribute("action") ){ 
                if( url == ""){ url = el.getAttribute("action") }                
            }
            if(["POST", "PUT", "PATCH"].includes(method)){
                let errors = false
                el.querySelectorAll("[mix-check]").forEach(el=>{
                    el.classList.remove("mix-error")                     
                    const regex = el.getAttribute("mix-check")                  
                    const re = new RegExp(regex)
                    if( ! re.test(el.value) ){
                        el.classList.add("mix-error") 
                        errors = true
                    }
                })                  
                if(errors) return
            } 
            form = el
        }
        if( el.hasAttribute("mix-post") && el.tagName !== "FORM" ){
            if(el.hasAttribute("mix-check")){
                el.classList.remove("mix-error") 
                const regex = el.getAttribute("mix-check")
                const re = new RegExp(regex)
                if( ! re.test(el.value) ){
                    el.classList.add("mix-error") 
                    return
                }                
            }
            const newElement = el.cloneNode(true)
            let frm = document.createElement("form")
            frm.appendChild(newElement)         
            form = frm         
        }
        if( url == "" ){ console.error("mixhtml() - url missing"); return }
        if( el.hasAttribute("mix-page") ){ url += url.includes("?") ? "&mix-page=yes" : "?mix-page=yes" }
        if(el.hasAttribute("mix-await")){
            el.innerHTML = el.getAttribute("mix-await")
            el.setAttribute("disabled", true)
        }
        if(form){
            if( el_await = form.querySelector("[mix-await]") ){
                el_await.innerHTML = el_await.getAttribute("mix-await")
                el_await.setAttribute("disabled", true)
            }
        }

        if( el.hasAttribute("mix-delay") ){
            clearTimeout(timeout)
            timeout = setTimeout(function(){
                mix_fetch(url, method, form, true, el_cover, el)
            }, el.getAttribute("mix-delay"))
        }else{
            mix_fetch(url, method, form, true, el_cover, el)
        }
    }catch(error){ 
        if(DISPLAY_ERRORS){ console.log(error) }
    }
}

// ##############################
async function mix_fetch(url, method, form, push_to_history=true, el_cover=false, el=false){
    try{
        console.log("el_cover", el_cover)
        let conn = null
        if( method == "GET" || method == "DELETE" ){
            conn = await fetch(url, {method:method})
        }
        if( method == "POST" || method == "PATCH" || method == "PUT" ){
            if( form ){
                conn = await fetch(url, {method:method, body: new FormData(form) })
            }else{
                conn = await fetch(url, {method:method})
            }              
        }
        if(el){
            if( el.hasAttribute("mix-await") ){
                el.innerHTML = el.getAttribute("mix-default")
                el.removeAttribute("disabled")
            }            
        }
        if(form){
            if( el_await = form.querySelector("[mix-await]") ){
                el_await.innerHTML = el_await.getAttribute("mix-default")
                el_await.removeAttribute("disabled")
            }
        }
        if(el_cover){
            el_cover.classList.add("mix-hidden")
        }
        const template = document.createElement("template")
        template.innerHTML = await conn.text()
        const t = template.content
        t.querySelectorAll("*").forEach(element=>{
            if( element.hasAttribute("mix-url") ){            
                document.title = element.getAttribute("mix-title")
                if(push_to_history){
                    history.pushState({"mix_page":element.getAttribute("mix-url")}, "title", element.getAttribute("mix-url"))
                }

                hide_elements(element.getAttribute("mix-hide"))
                show_elements(element.getAttribute("mix-show"))

                document.querySelectorAll("[mix-on]").forEach(i=>{                 
                    i.setAttribute("mix-on", "no")
                })    
                window.scrollTo(0,0)                                            
            } 
            if( element.hasAttribute("mix-before") ){           
                document.querySelectorAll(element.getAttribute("mix-before")).forEach(el=>{                  
                    console.log(element)
                    element.removeAttribute("mix-before")
                    if( element.hasAttribute("mix-url") ){
                        el.insertAdjacentHTML("beforebegin", element.outerHTML)
                     }
                    else{
                        el.insertAdjacentHTML("beforebegin", element.innerHTML)
                    }
                })
            } 
            if( element.hasAttribute("mix-top") ){            
                document.querySelectorAll(element.getAttribute("mix-top")).forEach(el=>{                  
                    element.removeAttribute("mix-top")
                    if( element.hasAttribute("mix-url") ){
                        el.insertAdjacentHTML("afterbegin", element.outerHTML)
                     }
                    else{                    
                        el.insertAdjacentHTML("afterbegin", element.innerHTML)
                    }
                })
            }  
            if( element.hasAttribute("mix-bottom") ){            
                document.querySelectorAll(element.getAttribute("mix-bottom")).forEach(el=>{                  
                    element.removeAttribute("mix-bottom")
                    if( element.hasAttribute("mix-url") ){
                        el.insertAdjacentHTML("beforeend", element.outerHTML)
                     }
                    else{                    
                        el.insertAdjacentHTML("beforeend", element.innerHTML)
                    }
                })
            } 
            if( element.hasAttribute("mix-after") ){            
                document.querySelectorAll(element.getAttribute("mix-after")).forEach(el=>{                  
                    element.removeAttribute("mix-after")
                    if( element.hasAttribute("mix-url") ){
                        el.insertAdjacentHTML("afterend", element.outerHTML)
                     }
                    else{
                        el.insertAdjacentHTML("afterend", element.innerHTML)
                    }
                })
            }
            if( element.hasAttribute("mix-update") ){            
                document.querySelectorAll(element.getAttribute("mix-update")).forEach(el=>{                  
                    element.removeAttribute("mix-update")
                    if( element.hasAttribute("mix-url") ){
                        console.log("mix-update not possible on single page app element")
                     }
                    else{
                        el.innerHTML = element.innerHTML 
                    }
                })
            }
            if( element.hasAttribute("mix-replace") ){            
                document.querySelectorAll(element.getAttribute("mix-replace")).forEach(el=>{                  
                    element.removeAttribute("mix-replace")
                    if( element.hasAttribute("mix-url") ){
                        console.log("mix-replace not possible on single page app element")
                     }
                    else{
                        el.outerHTML = element.innerHTML
                        
                    }
                })
            }            
            if( element.hasAttribute("mix-remove") ){   
                document.querySelectorAll(element.getAttribute("mix-remove")).forEach(el=>{
                    el.remove()
                })
            } 
            if(element.hasAttribute("mix-function")){
                const function_name = element.getAttribute("mix-function").trim()
                window[function_name](element.innerHTML)
            }  
            if(element.hasAttribute("mix-redirect")){
                const redirect_url = element.getAttribute("mix-redirect").trim()
                window.location.href = redirect_url
            }                                                                                                 
        })
        mix_convert()
    }catch(error){ 
        if(DISPLAY_ERRORS){
            console.error("mix_fetch()", error) 
        }
    }
}

// ##############################
function mix_convert(){
    document.querySelectorAll("[mix-url], [mix-get], [mix-post], [mix-patch], [mix-put], [mix-delete], [mix-ttl]").forEach( el => {
        try{
            let el_event = "onclick"
            if( el.tagName === "FORM" ){ el_event = "onsubmit" }
            if( el.hasAttribute("mix-focus") ){ el_event = "onfocus" }
            if( el.hasAttribute("mix-blur") ){ el_event = "onblur" }
            if( el.hasAttribute("mix-change") ){ el_event = "onchange" }
            if( el.hasAttribute("mix-input") ){ el_event = "oninput" }
            if( el.hasAttribute("mix-url") && ! el.getAttribute("mix-on") ){ el.setAttribute("mix-on","yes") }
            if( el.hasAttribute("mix-url") && ! el.hasAttribute("mix-ttl") ){ el.setAttribute("mix-ttl", "0") }
            if(el.hasAttribute("mix-ttl")){
                if(el.hasAttribute("mix-fade-out")){ 
                    const ttl = el.hasAttribute("mix-ttl") ? el.getAttribute("mix-ttl") : 2000
                    el.setAttribute("style", `animation: mix-fade-out ${ttl}ms forwards;`) 
                }
                const ttl = el.getAttribute("mix-ttl") || 0
                if( ! /^[0-9]\d*$/.test(ttl) ){
                    console.log("mix-ttl must be an integer starting from 1")
                }else{
                    if(el.hasAttribute("mix-url")){
                        if(!el.hasAttribute("mix-ex")){
                            el.setAttribute("mix-ex", el.getAttribute("mix-ttl"))
                        }
                    }else{
                        setTimeout(()=>{ el.remove() }, ttl)
                        el.removeAttribute("mix-ttl")
                    }
                    return
                }                    
            }           
            el.setAttribute(el_event, "mixhtml(); return false")                              
        }catch(error){ if(DISPLAY_ERRORS){ console.log(error) }}
    })
}
mix_convert()















